import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PointOfInterest, Tour } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, ArrowLeft, MapPin } from "lucide-react";
import MapView from "@/components/MapView";
import PointModal from "@/components/PointModal";
import PointCard from "@/components/PointCard";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function TourView() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/tour/:id");
  const tourId = params?.id ? parseInt(params.id) : null;
  
  const [selectedPointId, setSelectedPointId] = useState<number | undefined>();
  const [editingPoint, setEditingPoint] = useState<PointOfInterest | undefined>();
  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  
  const { toast } = useToast();
  
  // Tour query
  const { 
    data: tour, 
    isLoading: isLoadingTour,
    error: tourError,
  } = useQuery<Tour>({
    queryKey: ['/api/tours', tourId],
    enabled: !!tourId,
    queryFn: async () => {
      if (!tourId) throw new Error('No tour ID provided');
      const response = await fetch(`/api/tours/${tourId}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch tour');
      return response.json();
    }
  });
  
  // Points query
  const { 
    data: points = [], 
    isLoading: isLoadingPoints,
    error: pointsError,
  } = useQuery<PointOfInterest[]>({
    queryKey: [`/api/tours/${tourId}/points`],
    enabled: !!tourId,
    queryFn: async () => {
      if (!tourId) return [];
      const response = await fetch(`/api/tours/${tourId}/points`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch points');
      return response.json();
    }
  });
  
  const handleGoBack = () => {
    setLocation("/tours");
  };
  
  const handleEditTour = () => {
    if (tourId) {
      setLocation(`/create?tour=${tourId}`);
    }
  };
  
  const handlePointSelect = (pointId: number) => {
    setSelectedPointId(pointId === selectedPointId ? undefined : pointId);
  };
  
  const handleEditPoint = (point: PointOfInterest) => {
    setEditingPoint(point);
    setIsPointModalOpen(true);
  };
  
  const handlePointModalClose = () => {
    setIsPointModalOpen(false);
    setEditingPoint(undefined);
  };
  
  const handlePointSave = () => {
    // Запросы инвалидируются внутри модального окна
  };
  
  const handleDeletePoint = async (pointId: number) => {
    if (confirm("Вы уверены, что хотите удалить эту точку интереса?")) {
      setIsDeleting(pointId);
      try {
        await apiRequest("DELETE", `/api/points/${pointId}`);
        
        // Инвалидация кэша запросов точек
        queryClient.invalidateQueries({ queryKey: [`/api/tours/${tourId}/points`] });
        
        toast({
          title: "Точка удалена",
          description: "Точка интереса была успешно удалена",
        });
        
        // Если удалённая точка была выбрана, снимаем выбор
        if (selectedPointId === pointId) {
          setSelectedPointId(undefined);
        }
      } catch (error) {
        console.error("Ошибка при удалении точки:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось удалить точку. Пожалуйста, попробуйте снова.",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(null);
      }
    }
  };
  
  if (isLoadingTour || isLoadingPoints) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-10 w-full mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Skeleton className="h-[600px] w-full" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-[600px] w-full" />
            </div>
          </div>
        </div>
      </main>
    );
  }
  
  if (tourError || pointsError || !tour) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Ошибка загрузки данных</h2>
            <p className="text-red-600">
              Произошла ошибка при загрузке данных тура. Пожалуйста, попробуйте позже.
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-4"
            >
              Повторить
            </Button>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={handleGoBack}
                className="mr-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад к списку
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">{tour.name}</h1>
            </div>
            <Button onClick={handleEditTour}>
              <Edit className="mr-2 h-4 w-4" />
              Редактировать тур
            </Button>
          </div>
          
          <div className="flex items-center mb-4">
            <MapPin className="h-5 w-5 mr-2 text-gray-500" />
            <span className="text-gray-600">{tour.location}</span>
          </div>
          
          {tour.description && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Описание</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{tour.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Точки интереса</span>
                  <span className="text-sm text-gray-500 font-normal">
                    {points.length} {points.length === 1 ? 'точка' : 'точек'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {points.length > 0 ? (
                    points.map((point) => (
                      <PointCard
                        key={point.id}
                        point={point}
                        isSelected={point.id === selectedPointId}
                        onEdit={() => handleEditPoint(point)}
                        onDelete={() => handleDeletePoint(point.id)}
                        onSelect={() => handlePointSelect(point.id)}
                        isDeleting={isDeleting === point.id}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>В этом туре пока нет точек интереса.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <MapView 
              points={points}
              onMarkerClick={handlePointSelect}
              selectedPointId={selectedPointId}
              readOnly
            />
          </div>
        </div>
        
        {isPointModalOpen && (
          <PointModal 
            isOpen={isPointModalOpen}
            onClose={handlePointModalClose}
            tourId={tourId!}
            point={editingPoint}
            onSave={handlePointSave}
          />
        )}
      </div>
    </main>
  );
} 