import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWorkoutCategorySchema, type InsertWorkoutCategory, type WorkoutCategory } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface WorkoutCategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: WorkoutCategory | null;
  onSubmit: (data: InsertWorkoutCategory) => void;
  isLoading: boolean;
}

export function WorkoutCategoryFormModal({ isOpen, onClose, category, onSubmit, isLoading }: WorkoutCategoryFormModalProps) {
  const form = useForm<InsertWorkoutCategory>({
    resolver: zodResolver(insertWorkoutCategorySchema),
    defaultValues: {
      name: "",
      nameKurdish: "",
      nameArabic: "",
      iconUrl: "",
      iconName: "",
      order: 1,
    },
  });

  // Reset form when category changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (category) {
        form.reset({
          name: category.name || "",
          nameKurdish: category.nameKurdish || "",
          nameArabic: category.nameArabic || "",
          iconUrl: category.iconUrl || "",
          iconName: category.iconName || "",
          order: category.order || 1,
        });
      } else {
        form.reset({
          name: "",
          nameKurdish: "",
          nameArabic: "",
          iconUrl: "",
          iconName: "",
          order: 1,
        });
      }
      // Clear form validation errors
      form.clearErrors();
    }
  }, [category, form, isOpen]);

  const handleSubmit = (data: InsertWorkoutCategory) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Workout Category" : "Create New Workout Category"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name (English)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Chest, Back, Legs"
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    The English name of the workout category
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
                  <FormLabel>Category Name (Kurdish)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Kurdish name"
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    The Kurdish name of the workout category (optional)
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
                  <FormLabel>Category Name (Arabic)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Arabic name"
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    The Arabic name of the workout category (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      URL to an icon image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="iconName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon Name (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., dumbbell, heart, target"
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Name of the icon to display
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                    Display order for this category (lower numbers appear first)
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
                {isLoading ? "Saving..." : category ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}