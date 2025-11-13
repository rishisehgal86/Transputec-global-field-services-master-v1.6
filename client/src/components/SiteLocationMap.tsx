import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
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
  const [currentLat, setCurrentLat] = useState<number>(initialLat || 25.2048); // Default to Dubai
  const [currentLng, setCurrentLng] = useState<number>(initialLng || 55.2708);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current) return;

    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      try {
        // @ts-ignore - Leaflet is loaded via CDN
        const L = window.L;
        
        if (!L) {
          console.error("Leaflet not loaded");
          toast.error("Map library not loaded. Please refresh the page.");
          return;
        }

        // Initialize map
        const map = L.map(mapRef.current).setView([currentLat, currentLng], initialLat ? 15 : 12);
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
        toast.error("Failed to initialize map");
        setIsLoading(false);
      }
    };

    loadLeaflet();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [siteName]);

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
      <div
        ref={mapRef}
        className="w-full h-96 rounded-lg border border-border overflow-hidden"
        style={{ minHeight: "384px" }}
      />

      {/* Coordinates Display */}
      <div className="bg-accent/50 p-3 rounded-lg">
        <div className="text-sm font-medium mb-1">Current Coordinates:</div>
        <div className="text-xs text-muted-foreground">
          Latitude: {currentLat.toFixed(6)} | Longitude: {currentLng.toFixed(6)}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          Save Location
        </Button>
      </div>
    </div>
  );
}

