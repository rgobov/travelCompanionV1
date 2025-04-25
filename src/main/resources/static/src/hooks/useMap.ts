import { useState, useCallback } from "react";
import { Coordinate } from "@shared/schema";

// Default center coordinates (Paris)
const DEFAULT_CENTER: Coordinate = { lat: 48.8566, lng: 2.3522 };

export function useMap() {
  const [mapCenter, setMapCenter] = useState<Coordinate>(DEFAULT_CENTER);
  const [clickedCoordinates, setClickedCoordinates] = useState<Coordinate | undefined>();
  
  // Function to handle map clicks
  const handleMapClick = useCallback((coordinates: Coordinate) => {
    setClickedCoordinates(coordinates);
  }, []);
  
  // Function to reset coordinates
  const resetCoordinates = useCallback(() => {
    setClickedCoordinates(undefined);
  }, []);
  
  // Function to center the map on specific coordinates
  const centerMap = useCallback((coordinates: Coordinate) => {
    setMapCenter(coordinates);
  }, []);
  
  // Function to reset the map to default center
  const resetMap = useCallback(() => {
    setMapCenter(DEFAULT_CENTER);
  }, []);
  
  return {
    mapCenter,
    clickedCoordinates,
    handleMapClick,
    resetCoordinates,
    centerMap,
    resetMap,
    DEFAULT_CENTER,
  };
}
