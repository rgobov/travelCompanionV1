import { PointOfInterest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Music, Video } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PointCardProps {
  point: PointOfInterest;
  isSelected: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
  isDeleting: boolean;
}

export default function PointCard({ 
  point, 
  isSelected, 
  onEdit, 
  onDelete, 
  onSelect,
  isDeleting
}: PointCardProps) {
  return (
    <div 
      className={`border rounded-md hover:shadow-md transition-shadow bg-white overflow-hidden ${
        isSelected ? 'border-primary ring-1 ring-primary' : 'border-gray-200'
      }`}
    >
      <div 
        className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer"
        onClick={onSelect}
      >
        <div className="flex items-center">
          <div className={`w-6 h-6 ${isSelected ? 'bg-amber-500' : 'bg-primary'} rounded-full flex items-center justify-center mr-3 text-white text-xs font-bold`}>
            {point.order || '-'}
          </div>
          <span className="font-medium text-gray-900">{point.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-1 text-gray-500 hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit point</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-1 text-gray-500 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Skeleton className="h-4 w-4" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span className="sr-only">Delete point</span>
          </Button>
        </div>
      </div>
      
      {isSelected && (
        <div className="p-3 border-b border-gray-100">
          {point.photoFilename && (
            <div className="mb-3">
              <div className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden bg-gray-200">
                <img 
                  src={`/api/media/photos/${point.photoFilename}`} 
                  alt={point.name} 
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/640x360?text=No+Image';
                  }}
                />
              </div>
            </div>
          )}
          
          {point.description && (
            <div className="text-sm text-gray-700 mb-3">
              {point.description}
            </div>
          )}
          
          {point.audioFilename && (
            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
              <span>Audio guide:</span>
              <div className="flex items-center text-primary">
                <Music className="h-4 w-4 mr-1" />
                <a 
                  href={`/api/media/audio/${point.audioFilename}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {point.audioFilename.length > 20 
                    ? `${point.audioFilename.substring(0, 20)}...` 
                    : point.audioFilename}
                </a>
              </div>
            </div>
          )}
          
          {point.videoFilename && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1 flex items-center">
                <Video className="h-4 w-4 mr-1 text-primary" />
                <span>Short video:</span>
              </div>
              <div className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden bg-gray-200">
                <video 
                  src={`/api/media/videos/${point.videoFilename}`}
                  controls
                  className="w-full h-full object-contain"
                  preload="metadata"
                />
              </div>
            </div>
          )}
          
          {!point.description && !point.photoFilename && !point.audioFilename && !point.videoFilename && (
            <div className="text-sm text-gray-500 italic">
              No details added yet. Click edit to add description and media.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
