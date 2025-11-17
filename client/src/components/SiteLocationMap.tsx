import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SiteLocationMapProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onLocationChange: (lat: number, lng: number) => void;
  onCancel: () => void;
  siteName: string;
}

export function SiteLocationMap({
  initialLat,
  initialLng,
  onLocationChange,
  onCancel,
  siteName,
}: SiteLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  // Safely convert null/string to default values
  // Database stores coordinates as VARCHAR, so we need to parse them
  const parseCoordinate = (value: any, defaultValue: number): number => {
    if (value === null || value === undefined) return defaultValue;
    const parsed = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(parsed) ? defaultValue : parsed;
  };
  
  const defaultLat = parseCoordinate(initialLat, 25.2048);
  const defaultLng = parseCoordinate(initialLng, 55.2708);
  
  const [currentLat, setCurrentLat] = useState<number>(defaultLat);
  const [currentLng, setCurrentLng] = useState<number>(defaultLng);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      try {
        // @ts-ignore - Leaflet is loaded via CDN
        const L = window.L;
        
        if (!L) {
          console.error("Leaflet not loaded");
          setMapError("Map library not loaded. Please refresh the page.");
          setIsLoading(false);
          return;
        }

        // Initialize map
        // Use zoom 15 if we have real coordinates, zoom 12 for default location
        const hasRealCoordinates = initialLat !== null && initialLat !== undefined;
        if (!mapRef.current) return;
        const map = L.map(mapRef.current).setView([currentLat, currentLng], hasRealCoordinates ? 15 : 12);
        mapInstanceRef.current = map;

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        // Create draggable marker
        const marker = L.marker([currentLat, currentLng], {
          draggable: true,
          icon: L.icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          }),
        }).addTo(map);

        marker.bindPopup(`<b>${siteName}</b><br>Drag to adjust location`).openPopup();
        markerRef.current = marker;

        // Update coordinates when marker is dragged
        marker.on("dragend", () => {
          const position = marker.getLatLng();
          setCurrentLat(position.lat);
          setCurrentLng(position.lng);
          marker.setPopupContent(`<b>${siteName}</b><br>Lat: ${position.lat.toFixed(6)}<br>Lng: ${position.lng.toFixed(6)}`);
        });

        // Allow clicking on map to move marker
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          setCurrentLat(lat);
          setCurrentLng(lng);
          marker.setPopupContent(`<b>${siteName}</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`).openPopup();
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError("Failed to initialize map. Please try again.");
        setIsLoading(false);
      }
    };

    loadLeaflet();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.error("Error removing map:", e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, [siteName, currentLat, currentLng, initialLat]);

  const handleSave = () => {
    onLocationChange(currentLat, currentLng);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Set Location for {siteName}</h3>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Click on the map or drag the marker to set the exact location.
      </div>

      {/* Map Container */}
      {mapError ? (
        <div className="w-full h-96 rounded-lg border border-border flex items-center justify-center bg-accent/20">
          <div className="text-center">
            <p className="text-destructive font-medium mb-2">{mapError}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <div
            ref={mapRef}
            className="w-full h-96 rounded-lg border border-border overflow-hidden"
            style={{ minHeight: "384px" }}
          />
        </div>
      )}

      {/* Coordinates Display */}
      {!mapError && (
        <div className="bg-accent/50 p-3 rounded-lg">
          <div className="text-sm font-medium mb-1">Current Coordinates:</div>
          <div className="text-xs text-muted-foreground">
            Latitude: {currentLat.toFixed(6)} | Longitude: {currentLng.toFixed(6)}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isLoading || !!mapError}>
          Save Location
        </Button>
      </div>
    </div>
  );
}

