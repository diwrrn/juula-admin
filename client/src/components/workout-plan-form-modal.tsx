import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query as firestoreQuery, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { insertWorkoutPlanSchema, type InsertWorkoutPlan, type WorkoutPlan, type WorkoutCategory, type Exercise, type WorkoutPlanExercise } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Search, Trash2, Edit } from "lucide-react";

interface WorkoutPlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutPlan?: WorkoutPlan | null;
  onSubmit: (data: InsertWorkoutPlan) => void;
  isLoading: boolean;
}

const formSchema = insertWorkoutPlanSchema;

export function WorkoutPlanFormModal({ isOpen, onClose, workoutPlan, onSubmit, isLoading }: WorkoutPlanFormModalProps) {
  const [planExercises, setPlanExercises] = useState<WorkoutPlanExercise[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [newSets, setNewSets] = useState("");
  const [newReps, setNewReps] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Fetch workout categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/workout-categories"],
    queryFn: async () => {
      const categoriesCollection = collection(db, "workoutCategories");
      const q = firestoreQuery(categoriesCollection, orderBy("order"));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as WorkoutCategory[];
    },
  });

  // Fetch exercises
  const { data: exercises = [] } = useQuery({
    queryKey: ["/api/exercises"],
    queryFn: async () => {
      const allExercises: Exercise[] = [];
      for (const category of categories) {
        const exercisesCollection = collection(db, "workoutCategories", category.id, "exercises");
        const q = firestoreQuery(exercisesCollection, orderBy("order"));
        const snapshot = await getDocs(q);
        
        const categoryExercises = snapshot.docs.map(doc => ({
          id: doc.id,
          categoryId: category.id,
          ...doc.data(),
        })) as Exercise[];
        
        allExercises.push(...categoryExercises);
      }
      return allExercises;
    },
    enabled: categories.length > 0,
  });

  // Initialize form data when workoutPlan prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (workoutPlan) {
        setPlanExercises(workoutPlan.exercises || []);
      } else {
        setPlanExercises([]);
      }
      // Reset form states
      setExerciseSearch("");
      setSelectedCategoryId("all");
      setSelectedExerciseId("");
      setNewSets("");
      setNewReps("");
      setNewNotes("");
    }
  }, [workoutPlan, isOpen]);

  const form = useForm<InsertWorkoutPlan>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "demo-user",
      name: "",
      exercises: [],
    },
  });

  // Reset form when workoutPlan changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (workoutPlan) {
        form.reset({
          userId: workoutPlan.userId || "demo-user",
          name: workoutPlan.name || "",
          exercises: workoutPlan.exercises || [],
        });
      } else {
        form.reset({
          userId: "demo-user",
          name: "",
          exercises: [],
        });
      }
      // Clear form validation errors
      form.clearErrors();
    }
  }, [workoutPlan, form, isOpen]);

  const handleSubmit = (data: InsertWorkoutPlan) => {
    onSubmit({
      ...data,
      exercises: planExercises,
    });
  };

  // Filter exercises based on search and category
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchesCategory = selectedCategoryId === "all" || selectedCategoryId === "" || exercise.categoryId === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  // Add exercise to workout plan
  const addExerciseToPlane = () => {
    if (selectedExerciseId && newSets && newReps) {
      const exercise = exercises.find(ex => ex.id === selectedExerciseId);
      if (exercise) {
        const newExercise: WorkoutPlanExercise = {
          exerciseId: selectedExerciseId,
          categoryId: exercise.categoryId,
          sets: parseInt(newSets),
          reps: parseInt(newReps),
          notes: newNotes || undefined,
          order: planExercises.length + 1
        };
        setPlanExercises([...planExercises, newExercise]);
        setSelectedExerciseId("");
        setNewSets("");
        setNewReps("");
        setNewNotes("");
        setExerciseSearch("");
        setSelectedCategoryId("all");
      }
    }
  };

  // Remove exercise from workout plan
  const removeExerciseFromPlan = (index: number) => {
    const updatedExercises = planExercises.filter((_, i) => i !== index);
    // Update order numbers
    const reorderedExercises = updatedExercises.map((exercise, i) => ({
      ...exercise,
      order: i + 1
    }));
    setPlanExercises(reorderedExercises);
  };

  // Get exercise name by ID
  const getExerciseName = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    return exercise?.name || exerciseId;
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {workoutPlan ? "Edit Workout Plan" : "Create New Workout Plan"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Plan Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="e.g., Push Day, Pull Day, Leg Day"
              className="w-full"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Add Exercise Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Exercise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Search Exercise</Label>
                  <Input
                    placeholder="Search exercises..."
                    value={exerciseSearch}
                    onChange={(e) => setExerciseSearch(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Exercise</Label>
                <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredExercises.map((exercise) => (
                      <SelectItem key={exercise.id} value={exercise.id}>
                        {exercise.name} ({getCategoryName(exercise.categoryId)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Sets</Label>
                  <Input
                    type="number"
                    placeholder="3"
                    value={newSets}
                    onChange={(e) => setNewSets(e.target.value)}
                    min="1"
                  />
                </div>

                <div>
                  <Label>Reps</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={newReps}
                    onChange={(e) => setNewReps(e.target.value)}
                    min="1"
                  />
                </div>

                <div>
                  <Label>Notes (Optional)</Label>
                  <Input
                    placeholder="e.g., Focus on form"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={addExerciseToPlane}
                disabled={!selectedExerciseId || !newSets || !newReps}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise to Plan
              </Button>
            </CardContent>
          </Card>

          {/* Current Exercises in Plan */}
          {planExercises.length > 0 && (
            <div className="space-y-2">
              <Label>Current Exercises ({planExercises.length})</Label>
              <div className="space-y-2">
                {planExercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{getExerciseName(exercise.exerciseId)}</div>
                      <div className="text-sm text-gray-500">
                        {getCategoryName(exercise.categoryId)} • {exercise.sets} sets × {exercise.reps} reps
                      </div>
                      {exercise.notes && (
                        <div className="text-xs text-gray-400 mt-1">
                          Notes: {exercise.notes}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExerciseFromPlan(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || planExercises.length === 0}>
              {isLoading ? "Saving..." : workoutPlan ? "Update Plan" : "Create Plan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}