import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExerciseSchema, type InsertExercise, type Exercise } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface WorkoutExerciseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise?: Exercise | null;
  onSubmit: (data: InsertExercise) => void;
  isLoading: boolean;
}

export function WorkoutExerciseFormModal({ isOpen, onClose, exercise, onSubmit, isLoading }: WorkoutExerciseFormModalProps) {
  const form = useForm<InsertExercise>({
    resolver: zodResolver(insertExerciseSchema),
    defaultValues: {
      name: "",
      nameKurdish: "",
      nameArabic: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
      muscleGroups: [],
      bodyTarget: "",
      difficulty: "beginner",
      equipment: "bodyweight",
      order: 1,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "muscleGroups",
  });

  // Reset form when exercise changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (exercise) {
        form.reset({
          name: exercise.name || "",
          nameKurdish: exercise.nameKurdish || "",
          nameArabic: exercise.nameArabic || "",
          description: exercise.description || "",
          videoUrl: exercise.videoUrl || "",
          thumbnailUrl: exercise.thumbnailUrl || "",
          muscleGroups: exercise.muscleGroups || [],
          bodyTarget: exercise.bodyTarget || "",
          difficulty: exercise.difficulty || "beginner",
          equipment: exercise.equipment || "bodyweight",
          order: exercise.order || 1,
        });
      } else {
        form.reset({
          name: "",
          nameKurdish: "",
          nameArabic: "",
          description: "",
          videoUrl: "",
          thumbnailUrl: "",
          muscleGroups: [],
          bodyTarget: "",
          difficulty: "beginner",
          equipment: "bodyweight",
          order: 1,
        });
      }
      // Clear form validation errors
      form.clearErrors();
    }
  }, [exercise, form, isOpen]);

  const handleSubmit = (data: InsertExercise) => {
    onSubmit(data);
  };

  const addMuscleGroup = () => {
    append("");
  };

  const removeMuscleGroup = (index: number) => {
    remove(index);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {exercise ? "Edit Exercise" : "Create New Exercise"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exercise Name (English)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Bench Press, Deadlift, Push-ups"
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    The English name of the exercise
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
                  <FormLabel>Exercise Name (Kurdish)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Kurdish name"
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    The Kurdish name of the exercise (optional)
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
                  <FormLabel>Exercise Name (Arabic)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Arabic name"
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    The Arabic name of the exercise (optional)
                  </FormDescription>
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
                      {...field}
                      placeholder="Describe the exercise, proper form, and technique..."
                      className="w-full min-h-[100px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed description of the exercise
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://player.vimeo.com/video/123456"
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      URL to a video demonstration
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://example.com/thumbnail.jpg"
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      URL to a thumbnail image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bodyTarget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body Target</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Upper body, Lower body, Core"
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    Target body area for this exercise
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Exercise difficulty level
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="equipment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select equipment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bodyweight">Bodyweight</SelectItem>
                        <SelectItem value="barbell">Barbell</SelectItem>
                        <SelectItem value="dumbbell">Dumbbell</SelectItem>
                        <SelectItem value="cable">Cable</SelectItem>
                        <SelectItem value="machine">Machine</SelectItem>
                        <SelectItem value="kettlebell">Kettlebell</SelectItem>
                        <SelectItem value="resistance-band">Resistance Band</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Required equipment
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
                      Display order
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <FormLabel>Muscle Groups</FormLabel>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Input
                      placeholder="e.g., chest, back, shoulders"
                      value={form.watch(`muscleGroups.${index}`) || ""}
                      onChange={(e) => form.setValue(`muscleGroups.${index}`, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMuscleGroup(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMuscleGroup}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Muscle Group
                </Button>
              </div>
              <FormDescription>
                Add the muscle groups this exercise targets
              </FormDescription>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : exercise ? "Update Exercise" : "Create Exercise"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}