import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tour } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Edit, Map, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TourList() {
  const [, setLocation] = useLocation();
  
  // Query to fetch all tours
  const { 
    data: tours = [], 
    isLoading, 
    error 
  } = useQuery<Tour[]>({
    queryKey: ['/api/tours'],
  });
  
  const handleCreateTour = () => {
    setLocation("/create");
  };
  
  const handleViewTour = (tourId: number) => {
    //setLocation(`/tour/${tourId}`);
    window.location.href = `/tour/${tourId}`;
  };
  
  const handleEditTour = (tourId: number) => {
    setLocation(`/create?tour=${tourId}`);
  };
  
  if (isLoading) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Tours</h1>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </main>
    );
  }
  
  if (error) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Tours</h2>
            <p className="text-red-600">
              There was a problem loading your tours. Please try again later.
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Tours</h1>
          <Button onClick={handleCreateTour}>
            <Map className="mr-2 h-4 w-4" />
            Create New Tour
          </Button>
        </div>
        
        {tours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <Card key={tour.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{tour.name}</CardTitle>
                  </div>
                  <CardDescription className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                    {tour.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    {tour.description || "No description provided."}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewTour(tour.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditTour(tour.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Map className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Tours Created Yet</h2>
            <p className="text-gray-600 mb-6">
              Start by creating your first tour experience.
            </p>
            <Button onClick={handleCreateTour}>
              Create Your First Tour
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
