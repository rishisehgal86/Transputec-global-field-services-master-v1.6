/**
 * Geocoding utilities with Google Places API (primary) and OpenStreetMap Nominatim (fallback)
 * Google Places provides better accuracy when API key is available
 * Falls back to free OpenStreetMap when Google API key is not configured
 */

import { ENV } from './_core/env';

export interface GeocodingResult {
  latitude: string;
  longitude: string;
  displayName: string;
  success: boolean;
  error?: string;
}

export interface AddressSuggestion {
  latitude: string;
  longitude: string;
  displayName: string;
  type: string;
  importance: number;
}

/**
 * Search for address suggestions using Google Places API (if available) or Nominatim fallback
 * @param address - Address search query
 * @param limit - Maximum number of results (default: 5)
 * @returns Array of address suggestions
 */
export async function searchAddresses(address: string, limit: number = 5): Promise<AddressSuggestion[]> {
  // Try Google Places API first if API key is available
  if (ENV.googlePlacesApiKey) {
    try {
      return await searchAddressesGoogle(address, limit);
    } catch (error) {
      console.warn('Google Places API failed, falling back to OpenStreetMap:', error);
      // Fall through to OpenStreetMap fallback
    }
  }
  
  // Fallback to OpenStreetMap
  return await searchAddressesOSM(address, limit);
}

/**
 * Search for address suggestions using Google Places API
 * @param address - Address search query
 * @param limit - Maximum number of results
 * @returns Array of address suggestions
 */
async function searchAddressesGoogle(address: string, limit: number): Promise<AddressSuggestion[]> {
  if (!address || address.trim().length === 0) {
    return [];
  }

  try {
    const encodedAddress = encodeURIComponent(address.trim());
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${ENV.googlePlacesApiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Places API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return [];
    }

    // Take only the requested number of results
    return data.results.slice(0, limit).map((result: any) => ({
      latitude: result.geometry.location.lat.toString(),
      longitude: result.geometry.location.lng.toString(),
      displayName: result.formatted_address,
      type: result.types?.[0] || 'unknown',
      importance: result.geometry.location_type === 'ROOFTOP' ? 1.0 : 0.8,
    }));
  } catch (error) {
    console.error('Google Places search error:', error);
    throw error; // Re-throw to trigger fallback
  }
}

/**
 * Search for address suggestions using OpenStreetMap Nominatim
 * @param address - Address search query
 * @param limit - Maximum number of results
 * @returns Array of address suggestions
 */
async function searchAddressesOSM(address: string, limit: number): Promise<AddressSuggestion[]> {
  if (!address || address.trim().length === 0) {
    return [];
  }

  try {
    const encodedAddress = encodeURIComponent(address.trim());
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=${limit}&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "FieldPulse-Go-App/2.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((result: any) => ({
      latitude: result.lat,
      longitude: result.lon,
      displayName: result.display_name,
      type: result.type || "unknown",
      importance: result.importance || 0,
    }));
  } catch (error) {
    console.error("Address search error:", error);
    return [];
  }
}

/**
 * Geocode an address to coordinates using Google Places API (if available) or Nominatim fallback
 * @param address - Full address string to geocode
 * @returns Geocoding result with coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  // Try Google Places API first if API key is available
  if (ENV.googlePlacesApiKey) {
    try {
      return await geocodeAddressGoogle(address);
    } catch (error) {
      console.warn('Google Places API failed, falling back to OpenStreetMap:', error);
      // Fall through to OpenStreetMap fallback
    }
  }
  
  // Fallback to OpenStreetMap
  return await geocodeAddressOSM(address);
}

/**
 * Geocode an address using Google Places API
 * @param address - Full address string to geocode
 * @returns Geocoding result with coordinates
 */
async function geocodeAddressGoogle(address: string): Promise<GeocodingResult> {
  if (!address || address.trim().length === 0) {
    return {
      latitude: "",
      longitude: "",
      displayName: "",
      success: false,
      error: "Address is required",
    };
  }

  try {
    const encodedAddress = encodeURIComponent(address.trim());
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${ENV.googlePlacesApiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Places API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return {
        latitude: "",
        longitude: "",
        displayName: "",
        success: false,
        error: "Address not found",
      };
    }

    const result = data.results[0];

    return {
      latitude: result.geometry.location.lat.toString(),
      longitude: result.geometry.location.lng.toString(),
      displayName: result.formatted_address,
      success: true,
    };
  } catch (error) {
    console.error('Google Places geocoding error:', error);
    throw error; // Re-throw to trigger fallback
  }
}

/**
 * Geocode an address using OpenStreetMap Nominatim
 * @param address - Full address string to geocode
 * @returns Geocoding result with coordinates
 */
async function geocodeAddressOSM(address: string): Promise<GeocodingResult> {
  if (!address || address.trim().length === 0) {
    return {
      latitude: "",
      longitude: "",
      displayName: "",
      success: false,
      error: "Address is required",
    };
  }

  try {
    // Use Nominatim API (OpenStreetMap's geocoding service)
    const encodedAddress = encodeURIComponent(address.trim());
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "FieldPulse-Go-App/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return {
        latitude: "",
        longitude: "",
        displayName: "",
        success: false,
        error: "Address not found",
      };
    }

    const result = data[0];

    return {
      latitude: result.lat,
      longitude: result.lon,
      displayName: result.display_name,
      success: true,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return {
      latitude: "",
      longitude: "",
      displayName: "",
      success: false,
      error: error instanceof Error ? error.message : "Geocoding failed",
    };
  }
}

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate ETA based on distance and transport mode
 * @param distanceKm - Distance in kilometers
 * @param mode - Transport mode (driving, walking, cycling)
 * @returns ETA in minutes
 */
export function calculateETA(
  distanceKm: number,
  mode: "driving" | "walking" | "cycling" = "driving"
): number {
  const speeds = {
    driving: 40, // km/h average in urban areas
    walking: 5, // km/h
    cycling: 15, // km/h
  };

  const speed = speeds[mode];
  const hours = distanceKm / speed;
  const minutes = Math.round(hours * 60);

  return minutes;
}

