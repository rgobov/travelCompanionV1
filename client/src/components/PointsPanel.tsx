import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PointOfInterest } from "@shared/schema";
import PointCard from "@/components/PointCard";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Coordinate } from "@shared/schema";

interface PointsPanelProps {
  points: PointOfInterest[];
  tourId: number;
  onAddPoint: () => void;
  onEditPoint: (point: PointOfInterest) => void;
  onPointSelect: (pointId: number) => void;
  selectedPointId?: number;
  onMapClick: (coordinates: Coordinate) => void;
  onFinalizeTour: () => void;
}

export default function PointsPanel({ 
  points, 
  tourId, 
  onAddPoint, 
  onEditPoint, 
  onPointSelect,
  selectedPointId,
  onMapClick,
  onFinalizeTour
}: PointsPanelProps) {
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const { toast } = useToast();

  const handleDeletePoint = async (pointId: number) => {
    if (confirm("Are you sure you want to delete this point?")) {
      setIsDeleting(pointId);
      try {
        await apiRequest("DELETE", `/api/points/${pointId}`);
        
        // Invalidate points query cache
        queryClient.invalidateQueries({ queryKey: [`/api/tours/${tourId}/points`] });
        
        toast({
          title: "Point Deleted",
          description: "Point of interest has been deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting point:", error);
        toast({
          title: "Error",
          description: "Failed to delete point. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(null);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Points of Interest</h3>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onAddPoint}
          className="bg-secondary hover:bg-secondary/90 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Point
        </Button>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Click on the map to add points or click the "Add Point" button.
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
        <div className="space-y-3">
          {points.length > 0 ? (
            points.map((point) => (
              <PointCard
                key={point.id}
                point={point}
                isSelected={point.id === selectedPointId}
                onEdit={() => onEditPoint(point)}
                onDelete={() => handleDeletePoint(point.id)}
                onSelect={() => onPointSelect(point.id)}
                isDeleting={isDeleting === point.id}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No points added yet.</p>
              <p className="text-sm mt-2">
                Click on the map to add your first point of interest.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="pt-4 mt-auto">
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-white" 
          onClick={onFinalizeTour}
          disabled={points.length === 0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Finalize Tour
        </Button>
      </div>
    </div>
  );
}
