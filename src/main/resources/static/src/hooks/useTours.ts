import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tour, PointOfInterest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useTours() {
  const { toast } = useToast();
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  
  // Fetch all tours
  const {
    data: tours = [],
    isLoading: isLoadingTours,
    error: toursError,
  } = useQuery<Tour[]>({
    queryKey: ['/api/tours'],
    refetchOnWindowFocus: false,
  });
  
  // Fetch points for a selected tour
  const {
    data: points = [],
    isLoading: isLoadingPoints,
    error: pointsError,
  } = useQuery<PointOfInterest[]>({
    queryKey: ['/api/tours', selectedTourId, 'points'],
    enabled: !!selectedTourId,
    queryFn: async () => {
      if (!selectedTourId) return [];
      const response = await fetch(`/api/tours/${selectedTourId}/points`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch points');
      }
      return response.json();
    },
  });
  
  // Create a new tour
  const createTourMutation = useMutation({
    mutationFn: async (tourData: Partial<Tour>) => {
      const response = await apiRequest('POST', '/api/tours', tourData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
      setSelectedTourId(data.id);
      toast({
        title: 'Success',
        description: 'Tour created successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create tour: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Create a new point
  const createPointMutation = useMutation({
    mutationFn: async (pointData: Partial<PointOfInterest>) => {
      if (!selectedTourId) throw new Error('No tour selected');
      const response = await apiRequest('POST', `/api/tours/${selectedTourId}/points`, pointData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tours', selectedTourId, 'points'] });
      toast({
        title: 'Success',
        description: 'Point added successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add point: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Update a point
  const updatePointMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PointOfInterest> }) => {
      const response = await apiRequest('PUT', `/api/points/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tours', selectedTourId, 'points'] });
      toast({
        title: 'Success',
        description: 'Point updated successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update point: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Delete a point
  const deletePointMutation = useMutation({
    mutationFn: async (pointId: number) => {
      await apiRequest('DELETE', `/api/points/${pointId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tours', selectedTourId, 'points'] });
      toast({
        title: 'Success',
        description: 'Point deleted successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete point: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Select a tour and load its points
  const selectTour = useCallback((tourId: number) => {
    setSelectedTourId(tourId);
  }, []);
  
  return {
    tours,
    points,
    selectedTourId,
    isLoadingTours,
    isLoadingPoints,
    toursError,
    pointsError,
    selectTour,
    createTour: createTourMutation.mutate,
    createPoint: createPointMutation.mutate,
    updatePoint: updatePointMutation.mutate,
    deletePoint: deletePointMutation.mutate,
    isCreatingTour: createTourMutation.isPending,
    isCreatingPoint: createPointMutation.isPending,
    isUpdatingPoint: updatePointMutation.isPending,
    isDeletingPoint: deletePointMutation.isPending,
  };
}
