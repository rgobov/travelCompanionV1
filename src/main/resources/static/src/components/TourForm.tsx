import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Extended schema with validation
const tourFormSchema = z.object({
  name: z.string().min(3, "Tour name must be at least 3 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  description: z.string().optional(),
});

type TourFormData = z.infer<typeof tourFormSchema>;

interface TourFormProps {
  onSave: (tourId: number) => void;
  initialData?: {
    id?: number;
    name?: string;
    location?: string;
    description?: string;
  };
}

export default function TourForm({ onSave, initialData }: TourFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<TourFormData>({
    resolver: zodResolver(tourFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      location: initialData?.location || "",
      description: initialData?.description || "",
    },
  });

  async function onSubmit(values: TourFormData) {
    setIsSaving(true);
    try {
      let response;
      
      if (initialData?.id) {
        // Update existing tour
        response = await apiRequest("PUT", `/api/tours/${initialData.id}`, values);
      } else {
        // Create new tour
        response = await apiRequest("POST", "/api/tours", values);
      }
      
      const tourData = await response.json();
      
      // Invalidate tours query cache
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
      
      toast({
        title: initialData?.id ? "Tour Updated" : "Tour Created",
        description: `Successfully ${initialData?.id ? "updated" : "created"} "${values.name}"`,
      });
      
      // Call the onSave callback with the tour ID
      onSave(tourData.id);
    } catch (error) {
      console.error("Error saving tour:", error);
      toast({
        title: "Error",
        description: `Failed to ${initialData?.id ? "update" : "create"} tour. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {initialData?.id ? "Edit Tour" : "Create New Tour"}
      </h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tour Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tour name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Paris, France" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Brief description of your tour" 
                    className="resize-none" 
                    rows={2}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex items-center space-x-4">
            <Button type="submit" disabled={isSaving}>
              <Save className="h-5 w-5 mr-2" />
              {isSaving ? "Saving..." : "Save Tour Information"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
