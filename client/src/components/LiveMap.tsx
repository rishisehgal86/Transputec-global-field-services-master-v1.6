import { useEffect, useRef, useState } from "react";

interface LiveMapProps {
  latitude: number;
  longitude: number;
  accuracy?: number;
  engineerName?: string;
  lastUpdate?: Date;
}

export function LiveMap({ latitude, longitude, accuracy, engineerName, lastUpdate }: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
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
        zoom: 15,
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

  // Update marker position
  useEffect(() => {
    if (!map || !L) return;

    try {
      if (marker) {
        marker.setLatLng([latitude, longitude]);
        map.setView([latitude, longitude], map.getZoom());
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
        
        newMarker.bindPopup(popupContent).openPopup();
        setMarker(newMarker);
        map.setView([latitude, longitude], 15);
      }
    } catch (error) {
      console.error("Failed to update marker:", error);
    }
  }, [latitude, longitude, map, L]);

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
    </div>
  );
}

