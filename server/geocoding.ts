/**
 * Geocoding utilities using OpenStreetMap Nominatim API
 * Free and open-source geocoding service
 */

export interface GeocodingResult {
  latitude: string;
  longitude: string;
  displayName: string;
  success: boolean;
  error?: string;
}

/**
 * Geocode an address to coordinates using Nominatim
 * @param address - Full address string to geocode
 * @returns Geocoding result with coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult> {
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
        "User-Agent": "Transputec-Dispatch-App/1.0",
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

