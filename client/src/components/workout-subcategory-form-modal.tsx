import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWorkoutSubcategorySchema, type InsertWorkoutSubcategory, type WorkoutSubcategory } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface WorkoutSubcategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  subcategory?: WorkoutSubcategory | null;
  categoryId: string;
  onSubmit: (data: InsertWorkoutSubcategory) => void;
  isLoading: boolean;
}

export function WorkoutSubcategoryFormModal({ isOpen, onClose, subcategory, categoryId, onSubmit, isLoading }: WorkoutSubcategoryFormModalProps) {
  const form = useForm<InsertWorkoutSubcategory>({
    resolver: zodResolver(insertWorkoutSubcategorySchema),
    defaultValues: {
      categoryId: categoryId,
      name: "",
      nameKurdish: "",
      nameArabic: "",
      iconUrl: "",
      order: 1,
    },
  });

  // Reset form when subcategory changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (subcategory) {
        form.reset({
          categoryId: subcategory.categoryId || categoryId,
          name: subcategory.name || "",
          nameKurdish: subcategory.nameKurdish || "",
          nameArabic: subcategory.nameArabic || "",
          iconUrl: subcategory.iconUrl || "",
          order: subcategory.order || 1,
        });
      } else {
        form.reset({
          categoryId: categoryId,
          name: "",
          nameKurdish: "",
          nameArabic: "",
          iconUrl: "",
          order: 1,
        });
      }
      // Clear form validation errors
      form.clearErrors();
    }
  }, [subcategory, categoryId, form, isOpen]);

  const handleSubmit = (data: InsertWorkoutSubcategory) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {subcategory ? "Edit Workout Subcategory" : "Create New Workout Subcategory"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategory Name (English)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Upper Back, Lower Back"
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    The English name of the workout subcategory
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nameKurdish"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategory Name (Kurdish)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Kurdish name"
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    The Kurdish name of the workout subcategory (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nameArabic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategory Name (Arabic)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Arabic name"
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    The Arabic name of the workout subcategory (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="iconUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://example.com/icon.png"
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    URL to an icon image for this subcategory
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      placeholder="1"
                      className="w-full"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormDescription>
                    Display order for this subcategory (lower numbers appear first)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : subcategory ? "Update Subcategory" : "Create Subcategory"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}