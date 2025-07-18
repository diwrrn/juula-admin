import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query as firestoreQuery, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, Dumbbell, Play, Users, Clock } from "lucide-react";
import { Link } from "wouter";
import type { WorkoutPlan, WorkoutCategory, Exercise } from "@shared/schema";

export default function WorkoutPlans() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch workout plans
  const { data: workoutPlans = [], isLoading: plansLoading, error: plansError } = useQuery({
    queryKey: ["/api/workout-plans"],
    queryFn: async () => {
      const plansCollection = collection(db, "users", "demo-user", "workoutPlans");
      const q = firestoreQuery(plansCollection, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as WorkoutPlan[];
    },
  });

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

  // Delete workout plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      await deleteDoc(doc(db, "users", "demo-user", "workoutPlans", planId));
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workout plan deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workout-plans"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete workout plan: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Add sample workout categories and exercises
  const addSampleDataMutation = useMutation({
    mutationFn: async () => {
      // Sample workout categories
      const sampleCategories = [
        { id: "chest", name: "Chest", order: 1 },
        { id: "back", name: "Back", order: 2 },
        { id: "shoulders", name: "Shoulders", order: 3 },
        { id: "arms", name: "Arms", order: 4 },
        { id: "legs", name: "Legs", order: 5 },
        { id: "core", name: "Core", order: 6 }
      ];

      // Sample exercises for each category
      const sampleExercises = [
        // Chest
        { id: "bench-press", categoryId: "chest", name: "Bench Press", muscleGroups: ["chest", "triceps"], difficulty: "intermediate", equipment: "barbell", order: 1 },
        { id: "push-ups", categoryId: "chest", name: "Push-ups", muscleGroups: ["chest", "shoulders"], difficulty: "beginner", equipment: "bodyweight", order: 2 },
        
        // Back
        { id: "deadlift", categoryId: "back", name: "Deadlift", muscleGroups: ["lower back", "hamstrings", "glutes"], difficulty: "intermediate", equipment: "barbell", order: 1 },
        { id: "pull-ups", categoryId: "back", name: "Pull-ups", muscleGroups: ["lats", "rhomboids"], difficulty: "intermediate", equipment: "bodyweight", order: 2 },
        
        // Shoulders
        { id: "shoulder-press", categoryId: "shoulders", name: "Shoulder Press", muscleGroups: ["shoulders", "triceps"], difficulty: "intermediate", equipment: "dumbbell", order: 1 },
        { id: "lateral-raises", categoryId: "shoulders", name: "Lateral Raises", muscleGroups: ["shoulders"], difficulty: "beginner", equipment: "dumbbell", order: 2 },
        
        // Arms
        { id: "bicep-curls", categoryId: "arms", name: "Bicep Curls", muscleGroups: ["biceps"], difficulty: "beginner", equipment: "dumbbell", order: 1 },
        { id: "tricep-dips", categoryId: "arms", name: "Tricep Dips", muscleGroups: ["triceps"], difficulty: "beginner", equipment: "bodyweight", order: 2 },
        
        // Legs
        { id: "squats", categoryId: "legs", name: "Squats", muscleGroups: ["quadriceps", "glutes"], difficulty: "beginner", equipment: "bodyweight", order: 1 },
        { id: "lunges", categoryId: "legs", name: "Lunges", muscleGroups: ["quadriceps", "glutes"], difficulty: "beginner", equipment: "bodyweight", order: 2 },
        
        // Core
        { id: "plank", categoryId: "core", name: "Plank", muscleGroups: ["core"], difficulty: "beginner", equipment: "bodyweight", order: 1 },
        { id: "crunches", categoryId: "core", name: "Crunches", muscleGroups: ["abs"], difficulty: "beginner", equipment: "bodyweight", order: 2 }
      ];

      // Add categories
      for (const category of sampleCategories) {
        await addDoc(collection(db, "workoutCategories"), category);
      }

      // Add exercises
      for (const exercise of sampleExercises) {
        await addDoc(collection(db, "workoutCategories", exercise.categoryId, "exercises"), exercise);
      }

      // Add sample workout plan
      const samplePlan = {
        userId: "demo-user",
        name: "Push Day",
        createdAt: new Date(),
        exercises: [
          {
            exerciseId: "bench-press",
            categoryId: "chest",
            sets: 4,
            reps: 10,
            notes: "Focus on controlled movement",
            order: 1
          },
          {
            exerciseId: "shoulder-press",
            categoryId: "shoulders",
            sets: 3,
            reps: 12,
            notes: "Keep core tight",
            order: 2
          },
          {
            exerciseId: "tricep-dips",
            categoryId: "arms",
            sets: 3,
            reps: 15,
            notes: "Slow and controlled",
            order: 3
          }
        ]
      };
      
      await addDoc(collection(db, "users", "demo-user", "workoutPlans"), samplePlan);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sample workout data added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workout-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workout-categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add sample data: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter and paginate workout plans
  const filteredPlans = workoutPlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredPlans.length / pageSize);
  const paginatedPlans = filteredPlans.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getExercisesByPlan = (plan: WorkoutPlan) => {
    return plan.exercises.map(planExercise => {
      const exercise = exercises.find(ex => ex.id === planExercise.exerciseId);
      return {
        ...planExercise,
        exercise
      };
    });
  };

  if (plansError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">Failed to connect to Firebase</div>
          <div className="text-gray-600">{plansError.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Dumbbell className="text-primary text-2xl" />
            <h1 className="text-xl font-medium text-gray-900">Workout Plans</h1>
            <nav className="flex items-center space-x-1 ml-8">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4 mr-1" />
                  Foods
                </Button>
              </Link>
              <Link href="/meals">
                <Button variant="ghost" size="sm">
                  <Clock className="h-4 w-4 mr-1" />
                  Meals
                </Button>
              </Link>
              <Link href="/workout-plans">
                <Button variant="ghost" size="sm" className="text-blue-600 bg-blue-50">
                  <Dumbbell className="h-4 w-4 mr-1" />
                  Workouts
                </Button>
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Connected to Firebase</span>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20 px-6">
        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search workout plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => addSampleDataMutation.mutate()}
              disabled={addSampleDataMutation.isPending}
            >
              {addSampleDataMutation.isPending ? "Adding..." : "Add Sample Data"}
            </Button>
            <Button className="bg-primary hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create New Plan
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Plans</p>
                  <p className="text-2xl font-bold">{workoutPlans.length}</p>
                </div>
                <Dumbbell className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Exercises</p>
                  <p className="text-2xl font-bold">{exercises.length}</p>
                </div>
                <Play className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workout Plans Grid */}
        {plansLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedPlans.map((plan) => {
              const planExercises = getExercisesByPlan(plan);
              return (
                <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                          {plan.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {plan.exercises.length} exercises
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deletePlanMutation.mutate(plan.id)}
                          disabled={deletePlanMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <p><span className="font-medium">Created:</span> {plan.createdAt.toLocaleDateString()}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Exercises:</p>
                        <div className="space-y-1">
                          {planExercises.slice(0, 3).map((planExercise, index) => (
                            <div key={index} className="text-xs text-gray-600 flex justify-between">
                              <span>{planExercise.exercise?.name || planExercise.exerciseId}</span>
                              <span>{planExercise.sets} × {planExercise.reps}</span>
                            </div>
                          ))}
                          {planExercises.length > 3 && (
                            <p className="text-xs text-gray-500">+{planExercises.length - 3} more</p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <Button size="sm" variant="outline" className="text-xs">
                          <Play className="h-3 w-3 mr-1" />
                          Start Workout
                        </Button>
                        <Badge variant="secondary" className="text-xs">
                          {plan.exercises.reduce((total, ex) => total + ex.sets, 0)} sets
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}