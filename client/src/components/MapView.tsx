import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Coordinate } from "@shared/schema";
import L from "leaflet";

interface MapViewProps {
  points: Array<{
    id: number;
    name: string;
    latitude: string;
    longitude: string;
    order?: number;
  }>;
  onMapClick?: (coordinates: Coordinate) => void;
  selectedPointId?: number;
  onMarkerClick: (pointId: number) => void;
  defaultCenter?: Coordinate;
  readOnly?: boolean;
}

export default function MapView({ 
  points,
  onMapClick,
  selectedPointId,
  onMarkerClick,
  defaultCenter = { lat: 48.8566, lng: 2.3522 }, // Default to Paris
  readOnly = false
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{[key: number]: L.Marker}>({});
  const { toast } = useToast();
  const [mapInitialized, setMapInitialized] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map instance
    const map = L.map(mapContainerRef.current).setView(
      [defaultCenter.lat, defaultCenter.lng], 
      13
    );

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Handle map clicks if not in readOnly mode
    if (!readOnly && onMapClick) {
      map.on('click', (e) => {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    }

    // Store the map reference
    mapRef.current = map;
    setMapInitialized(true);

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [defaultCenter, readOnly, onMapClick]);

  // Update markers when points change
  useEffect(() => {
    if (!mapRef.current || !mapInitialized) return;

    const map = mapRef.current;
    const currentMarkerIds = new Set<number>();

    // Create or update markers for points
    points.forEach((point) => {
      const lat = parseFloat(point.latitude);
      const lng = parseFloat(point.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        console.error(`Invalid coordinates for point ${point.id}`);
        return;
      }

      currentMarkerIds.add(point.id);
      
      // Check if marker already exists
      if (markersRef.current[point.id]) {
        // Just update position
        markersRef.current[point.id].setLatLng([lat, lng]);
      } else {
        // Create custom icon
        const isSelected = point.id === selectedPointId;
        const icon = L.divIcon({
          className: `map-marker ${isSelected ? 'active' : ''}`,
          html: `<div class="w-8 h-8 flex items-center justify-center rounded-full ${isSelected ? 'bg-amber-500' : 'bg-primary'} text-white text-xs font-bold border-2 border-white shadow-md transform ${isSelected ? 'scale-125' : ''}">${point.order || ''}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });
        
        // Create new marker
        const marker = L.marker([lat, lng], { icon }).addTo(map);
        
        // Add popup and click handler
        marker.bindPopup(point.name);
        marker.on('click', () => {
          onMarkerClick(point.id);
        });
        
        // Store the marker reference
        markersRef.current[point.id] = marker;
      }
      
      // Update icon style based on selection
      const icon = L.divIcon({
        className: `map-marker ${point.id === selectedPointId ? 'active' : ''}`,
        html: `<div class="w-8 h-8 flex items-center justify-center rounded-full ${point.id === selectedPointId ? 'bg-amber-500' : 'bg-primary'} text-white text-xs font-bold border-2 border-white shadow-md transform ${point.id === selectedPointId ? 'scale-125' : ''}">${point.order || ''}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      
      markersRef.current[point.id].setIcon(icon);
    });

    // Remove markers that no longer exist in the points array
    Object.keys(markersRef.current).forEach((idStr) => {
      const id = parseInt(idStr);
      if (!currentMarkerIds.has(id)) {
        map.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });

    // Draw lines connecting points in order if there are at least 2 points
    if (points.length >= 2) {
      // Remove any existing lines
      map.eachLayer((layer) => {
        if (layer instanceof L.Polyline && !(layer instanceof L.Marker)) {
          map.removeLayer(layer);
        }
      });

      // Sort points by order
      const sortedPoints = [...points].sort((a, b) => 
        (a.order || 0) - (b.order || 0)
      );

      // Create line coordinates
      const lineCoords = sortedPoints.map(point => [
        parseFloat(point.latitude), 
        parseFloat(point.longitude)
      ] as [number, number]);

      // Draw line
      L.polyline(lineCoords, {
        color: '#4A90E2',
        weight: 3,
        opacity: 0.7,
        dashArray: '5, 10'
      }).addTo(map);
    }

  }, [points, selectedPointId, mapInitialized]);

  // Handle centering map
  const centerMap = () => {
    if (!mapRef.current) return;
    
    if (points.length > 0) {
      // Create bounds from all markers
      const bounds = L.latLngBounds(
        points.map(p => [parseFloat(p.latitude), parseFloat(p.longitude)])
      );
      
      // Add padding to bounds
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      
      toast({
        title: "Map Centered",
        description: "Map centered to show all points",
      });
    } else {
      // If no points, center on default location
      mapRef.current.setView([defaultCenter.lat, defaultCenter.lng], 13);
      
      toast({
        title: "Map Reset",
        description: "Map reset to default position",
      });
    }
  };

  // Handle resetting map
  const resetMap = () => {
    if (!mapRef.current) return;
    
    mapRef.current.setView([defaultCenter.lat, defaultCenter.lng], 13);
    
    toast({
      title: "Map Reset",
      description: "Map reset to default position",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {readOnly ? "Карта тура" : "Интерактивная карта"}
        </h3>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={centerMap}
            className="text-gray-700"
          >
            <Home className="h-4 w-4 mr-1" />
            Центрировать
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetMap}
            className="text-gray-700"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Сбросить
          </Button>
        </div>
      </div>
      
      <div className="w-full" style={{ height: '600px' }}>
        <div 
          ref={mapContainerRef} 
          className="w-full h-full rounded-lg border border-gray-300"
        ></div>
      </div>
      
      {readOnly && (
        <div className="mt-3 text-sm text-gray-500">
          <p className="text-center">Нажмите на маркер, чтобы увидеть подробности</p>
        </div>
      )}
      
      {!readOnly && (
        <div className="mt-3 text-sm text-gray-500">
          <p className="text-center">Нажмите на карту, чтобы добавить новую точку интереса</p>
        </div>
      )}
    </div>
  );
}
