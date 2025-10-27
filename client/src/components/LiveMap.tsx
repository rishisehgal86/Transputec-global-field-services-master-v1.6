import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Navigation } from "lucide-react";

interface LiveMapProps {
  latitude: number;
  longitude: number;
  accuracy?: number;
  engineerName?: string;
  lastUpdate?: Date;
  siteLatitude?: number;
  siteLongitude?: number;
  siteName?: string;
  showRecenterButton?: boolean;
}

export function LiveMap({ 
  latitude, 
  longitude, 
  accuracy, 
  engineerName, 
  lastUpdate,
  siteLatitude,
  siteLongitude,
  siteName,
  showRecenterButton = true
}: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [engineerMarker, setEngineerMarker] = useState<any>(null);
  const [siteMarker, setSiteMarker] = useState<any>(null);
  const [L, setL] = useState<any>(null);

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        const leaflet = await import("leaflet");
        
        // Fix default marker icon issue
        delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
        
        setL(leaflet);
      } catch (error) {
        console.error("Failed to load Leaflet:", error);
      }
    };

    loadLeaflet();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !L || map) return;

    try {
      const newMap = L.map(mapRef.current, {
        center: [latitude, longitude],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(newMap);

      setMap(newMap);
    } catch (error) {
      console.error("Failed to initialize map:", error);
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [L, mapRef.current]);

  // Update engineer marker
  useEffect(() => {
    if (!map || !L) return;

    try {
      if (engineerMarker) {
        engineerMarker.setLatLng([latitude, longitude]);
      } else {
        const blueIcon = L.icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        const newMarker = L.marker([latitude, longitude], { icon: blueIcon }).addTo(map);
        
        const popupContent = `
          <div style="text-align: center;">
            <strong>${engineerName || "Engineer Location"}</strong><br/>
            ${lastUpdate ? `Updated: ${lastUpdate.toLocaleTimeString()}` : ""}
            ${accuracy ? `<br/>Accuracy: ±${Math.round(accuracy)}m` : ""}
          </div>
        `;
        
        newMarker.bindPopup(popupContent);
        setEngineerMarker(newMarker);
      }

      // Auto-fit bounds if both markers exist
      if (siteMarker && engineerMarker) {
        const bounds = L.latLngBounds([
          [latitude, longitude],
          [siteLatitude!, siteLongitude!]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
      } else if (!siteLatitude || !siteLongitude) {
        // Center on engineer if no site location
        map.setView([latitude, longitude], 15);
      }
    } catch (error) {
      console.error("Failed to update engineer marker:", error);
    }
  }, [latitude, longitude, map, L]);

  // Update site marker
  useEffect(() => {
    if (!map || !L || !siteLatitude || !siteLongitude) return;

    try {
      if (!siteMarker) {
        const redIcon = L.icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        const newMarker = L.marker([siteLatitude, siteLongitude], { icon: redIcon }).addTo(map);
        
        const popupContent = `
          <div style="text-align: center;">
            <strong>${siteName || "Site Location"}</strong><br/>
            Destination
          </div>
        `;
        
        newMarker.bindPopup(popupContent);
        setSiteMarker(newMarker);

        // Fit bounds to show both markers
        if (engineerMarker) {
          const bounds = L.latLngBounds([
            [latitude, longitude],
            [siteLatitude, siteLongitude]
          ]);
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    } catch (error) {
      console.error("Failed to create site marker:", error);
    }
  }, [siteLatitude, siteLongitude, map, L]);

  const handleRecenter = () => {
    if (!map) return;

    if (siteLatitude && siteLongitude && engineerMarker && siteMarker) {
      // Fit bounds to show both markers
      const bounds = L.latLngBounds([
        [latitude, longitude],
        [siteLatitude, siteLongitude]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // Just center on engineer
      map.setView([latitude, longitude], 15);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" style={{ minHeight: "400px" }} />
      
      {!L && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {showRecenterButton && map && (
        <Button
          onClick={handleRecenter}
          size="sm"
          className="absolute top-4 right-4 z-[1000] shadow-lg"
          variant="secondary"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Return to Pins
        </Button>
      )}
    </div>
  );
}

