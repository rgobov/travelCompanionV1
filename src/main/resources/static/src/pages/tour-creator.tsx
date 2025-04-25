import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import TourForm from "@/components/TourForm";
import MapView from "@/components/MapView";
import PointsPanel from "@/components/PointsPanel";
import PointModal from "@/components/PointModal";
import { useMap } from "@/hooks/useMap";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PointOfInterest, Coordinate } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function TourCreator() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State
  const [tourId, setTourId] = useState<number | null>(null);
  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [selectedPointId, setSelectedPointId] = useState<number | undefined>();
  const [editingPoint, setEditingPoint] = useState<PointOfInterest | undefined>();
  
  // Map utilities
  const { clickedCoordinates, handleMapClick, resetCoordinates } = useMap();
  
  // Tour query
  const { data: tour, isLoading: isLoadingTour } = useQuery({
    queryKey: ['/api/tours', tourId],
    enabled: !!tourId,
    queryFn: async () => {
      if (!tourId) return null;
      const res = await fetch(`/api/tours/${tourId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch tour');
      return res.json();
    }
  });
  
  // Points query
  const { 
    data: points = [], 
    isLoading: isLoadingPoints,
    error: pointsError
  } = useQuery<PointOfInterest[]>({
    queryKey: ['/api/tours', tourId, 'points'],
    enabled: !!tourId,
    queryFn: async () => {
      if (!tourId) return [];
      const res = await fetch(`/api/tours/${tourId}/points`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch points');
      return res.json();
    }
  });
  
  // Finalize tour mutation
  const finalizeTourMutation = useMutation({
    mutationFn: async () => {
      if (!tourId) throw new Error('No tour selected');
      await apiRequest('PUT', `/api/tours/${tourId}`, { 
        ...tour, 
        isFinalized: true 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
      toast({
        title: 'Tour Finalized',
        description: 'Your tour has been finalized successfully!',
      });
      setLocation('/tours');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to finalize tour: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Handle map click
  useEffect(() => {
    if (clickedCoordinates && tourId) {
      setIsPointModalOpen(true);
    }
  }, [clickedCoordinates]);
  
  // Handlers
  const handleTourSave = (id: number) => {
    setTourId(id);
  };
  
  const handlePointModalClose = () => {
    setIsPointModalOpen(false);
    resetCoordinates();
    setEditingPoint(undefined);
  };
  
  const handleAddPointClick = () => {
    setEditingPoint(undefined);
    setIsPointModalOpen(true);
  };
  
  const handleEditPoint = (point: PointOfInterest) => {
    setEditingPoint(point);
    setIsPointModalOpen(true);
  };
  
  const handlePointSelect = (pointId: number) => {
    setSelectedPointId(pointId === selectedPointId ? undefined : pointId);
  };
  
  const handlePointSave = () => {
    // No additional logic needed, queries are invalidated in the modal
  };
  
  const handleFinalizeTour = () => {
    if (points.length === 0) {
      toast({
        title: 'Cannot Finalize',
        description: 'Add at least one point before finalizing the tour.',
        variant: 'destructive',
      });
      return;
    }
    
    finalizeTourMutation.mutate();
  };
  
  // Content depending on tour creation status
  const renderContent = () => {
    if (!tourId) {
      return <TourForm onSave={handleTourSave} />;
    }
    
    if (isLoadingTour || isLoadingPoints) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Skeleton className="h-[600px] w-full" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-[600px] w-full" />
          </div>
        </div>
      );
    }
    
    if (pointsError) {
      return (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800">
          <h3 className="text-lg font-semibold mb-2">Error Loading Points</h3>
          <p>There was a problem loading the tour points. Please try again.</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PointsPanel 
            points={points}
            tourId={tourId}
            onAddPoint={handleAddPointClick}
            onEditPoint={handleEditPoint}
            onPointSelect={handlePointSelect}
            selectedPointId={selectedPointId}
            onMapClick={handleMapClick}
            onFinalizeTour={handleFinalizeTour}
          />
        </div>
        <div className="lg:col-span-2">
          <MapView 
            points={points}
            onMapClick={handleMapClick}
            onMarkerClick={handlePointSelect}
            selectedPointId={selectedPointId}
          />
        </div>
      </div>
    );
  };
  
  return (
    <main className="flex-1 overflow-hidden">
      <div className="container mx-auto px-4 py-6">
        {tourId && (
          <div className="mb-4">
            <TourForm 
              onSave={handleTourSave} 
              initialData={{ id: tourId, ...tour }} 
            />
          </div>
        )}
        
        {renderContent()}
        
        {isPointModalOpen && (
          <PointModal 
            isOpen={isPointModalOpen}
            onClose={handlePointModalClose}
            tourId={tourId!}
            coordinates={clickedCoordinates}
            point={editingPoint}
            onSave={handlePointSave}
          />
        )}
      </div>
    </main>
  );
}
