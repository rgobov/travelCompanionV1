import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Coordinate, PointOfInterest } from "@shared/schema";
import { X, Upload, Music, Video } from "lucide-react";

// Extended schema with validation
const pointFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  latitude: z.string(),
  longitude: z.string(),
  photoFilename: z.string().optional(),
  audioFilename: z.string().optional(),
  videoFilename: z.string().optional(),
  order: z.number().optional(),
});

type PointFormData = z.infer<typeof pointFormSchema>;

interface PointModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourId: number;
  coordinates?: Coordinate;
  point?: PointOfInterest;
  onSave: () => void;
}

export default function PointModal({ 
  isOpen, 
  onClose, 
  tourId, 
  coordinates, 
  point,
  onSave
}: PointModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    point?.photoFilename ? `/api/media/photos/${point.photoFilename}` : null
  );
  const [audioFile, setAudioFile] = useState<string | null>(
    point?.audioFilename ? point.audioFilename : null
  );
  const [videoFile, setVideoFile] = useState<string | null>(
    point?.videoFilename ? point.videoFilename : null
  );
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  const form = useForm<PointFormData>({
    resolver: zodResolver(pointFormSchema),
    defaultValues: {
      name: point?.name || "",
      description: point?.description || "",
      latitude: point?.latitude || coordinates?.lat.toString() || "",
      longitude: point?.longitude || coordinates?.lng.toString() || "",
      photoFilename: point?.photoFilename || "",
      audioFilename: point?.audioFilename || "",
      videoFilename: point?.videoFilename || "",
      order: point?.order || undefined,
    },
  });

  // Handle photo upload
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("photo", file);
    
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    setUploadingPhoto(true);
    
    try {
      const response = await fetch("/api/upload/photo", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload photo");
      }
      
      const data = await response.json();
      form.setValue("photoFilename", data.filename);
      
      toast({
        title: "Photo Uploaded",
        description: "Photo has been uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      setPreviewImage(null);
      
      toast({
        title: "Upload Failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle audio upload
  const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("audio", file);
    
    setUploadingAudio(true);
    
    try {
      const response = await fetch("/api/upload/audio", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload audio");
      }
      
      const data = await response.json();
      form.setValue("audioFilename", data.filename);
      setAudioFile(file.name);
      
      toast({
        title: "Audio Uploaded",
        description: "Audio guide has been uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading audio:", error);
      setAudioFile(null);
      
      toast({
        title: "Upload Failed",
        description: "Failed to upload audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingAudio(false);
    }
  };
  
  // Handle video upload
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("video", file);
    
    setUploadingVideo(true);
    
    try {
      const response = await fetch("/api/upload/video", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload video");
      }
      
      const data = await response.json();
      form.setValue("videoFilename", data.filename);
      setVideoFile(file.name);
      
      toast({
        title: "Video Uploaded",
        description: "Short video has been uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading video:", error);
      setVideoFile(null);
      
      toast({
        title: "Upload Failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingVideo(false);
    }
  };

  // Handle form submission
  async function onSubmit(values: PointFormData) {
    setIsSaving(true);
    
    try {
      const pointData = {
        ...values,
        tourId,
      };
      
      let response;
      
      if (point?.id) {
        // Update existing point
        response = await apiRequest("PUT", `/api/points/${point.id}`, pointData);
      } else {
        // Create new point
        response = await apiRequest("POST", `/api/tours/${tourId}/points`, pointData);
      }
      
      // Invalidate points query cache
      queryClient.invalidateQueries({ queryKey: [`/api/tours/${tourId}/points`] });
      
      toast({
        title: point?.id ? "Point Updated" : "Point Created",
        description: `Successfully ${point?.id ? "updated" : "created"} point "${values.name}"`,
      });
      
      // Close modal and notify parent
      onClose();
      onSave();
    } catch (error) {
      console.error("Error saving point:", error);
      
      toast({
        title: "Error",
        description: `Failed to ${point?.id ? "update" : "create"} point. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md z-[1100] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {point?.id ? "Edit Point of Interest" : "Add Point of Interest"}
          </DialogTitle>
          <DialogDescription>
            Add details about this location.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Eiffel Tower" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide details about this point of interest" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Point order in the tour" 
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel>Photo</FormLabel>
              <div className="mt-1">
                {previewImage ? (
                  <div className="relative">
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="w-full h-40 object-cover rounded-md border border-gray-200"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-gray-800/70 hover:bg-gray-900/90"
                      onClick={() => {
                        setPreviewImage(null);
                        form.setValue("photoFilename", "");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-md p-6 flex items-center justify-center cursor-pointer hover:bg-gray-50"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/90">
                          <span>Upload a photo</span>
                          <input
                            ref={photoInputRef}
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            disabled={uploadingPhoto}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      {uploadingPhoto && <p className="text-xs text-blue-500">Uploading...</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <FormLabel>Audio Guide</FormLabel>
              <div className="mt-1">
                {audioFile ? (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50">
                    <div className="flex items-center">
                      <Music className="h-5 w-5 text-primary mr-2" />
                      <span className="text-sm font-medium">{audioFile}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setAudioFile(null);
                        form.setValue("audioFilename", "");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-md p-6 flex items-center justify-center cursor-pointer hover:bg-gray-50"
                    onClick={() => audioInputRef.current?.click()}
                  >
                    <div className="space-y-1 text-center">
                      <Music className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/90">
                          <span>Upload audio guide</span>
                          <input
                            ref={audioInputRef}
                            type="file"
                            className="sr-only"
                            accept="audio/*"
                            onChange={handleAudioChange}
                            disabled={uploadingAudio}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">MP3, WAV up to 20MB</p>
                      {uploadingAudio && <p className="text-xs text-blue-500">Uploading...</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <FormLabel>Short Video</FormLabel>
              <div className="mt-1">
                {videoFile ? (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50">
                    <div className="flex items-center">
                      <Video className="h-5 w-5 text-primary mr-2" />
                      <span className="text-sm font-medium">{videoFile}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setVideoFile(null);
                        form.setValue("videoFilename", "");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-md p-6 flex items-center justify-center cursor-pointer hover:bg-gray-50"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <div className="space-y-1 text-center">
                      <Video className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/90">
                          <span>Upload short video</span>
                          <input
                            ref={videoInputRef}
                            type="file"
                            className="sr-only"
                            accept="video/*"
                            onChange={handleVideoChange}
                            disabled={uploadingVideo}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">MP4, MOV up to 50MB</p>
                      {uploadingVideo && <p className="text-xs text-blue-500">Uploading...</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="photoFilename"
              render={({ field }) => (
                <input type="hidden" {...field} />
              )}
            />
            
            <FormField
              control={form.control}
              name="audioFilename"
              render={({ field }) => (
                <input type="hidden" {...field} />
              )}
            />
            
            <FormField
              control={form.control}
              name="videoFilename"
              render={({ field }) => (
                <input type="hidden" {...field} />
              )}
            />
            
            <DialogFooter className="pt-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSaving || uploadingPhoto || uploadingAudio || uploadingVideo}
              >
                {isSaving 
                  ? "Saving..." 
                  : point?.id 
                    ? "Update Point" 
                    : "Save Point"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
