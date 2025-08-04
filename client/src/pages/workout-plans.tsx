import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query as firestoreQuery, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, Dumbbell, Users, Clock, FolderOpen, Target, ArrowLeft, Play, Crown } from "lucide-react";
import { Link } from "wouter";
import type { WorkoutCategory, WorkoutSubcategory, Exercise, InsertWorkoutCategory, InsertWorkoutSubcategory, InsertExercise } from "@shared/schema";
import { WorkoutCategoryFormModal } from "@/components/workout-category-form-modal";
import { WorkoutSubcategoryFormModal } from "@/components/workout-subcategory-form-modal";
import { WorkoutExerciseFormModal } from "@/components/workout-exercise-form-modal";
import { 
  getWorkoutCategories, 
  getWorkoutSubcategories, 
  getExercises, 
  createWorkoutCategory, 
  createWorkoutSubcategory, 
  createExercise,
  updateWorkoutCategory,
  updateWorkoutSubcategory,
  updateExercise,
  deleteWorkoutCategory,
  deleteWorkoutSubcategory,
  deleteExercise,
  initializeSampleWorkoutData
} from "@/lib/firebase";

export default function WorkoutPlans() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<"categories" | "subcategories" | "exercises">("categories");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isSubcategoryFormOpen, setIsSubcategoryFormOpen] = useState(false);
  const [isExerciseFormOpen, setIsExerciseFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<WorkoutCategory | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<WorkoutSubcategory | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const pageSize = 12;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cached workout categories (load once, cache forever)
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/workout-categories"],
    queryFn: () => getWorkoutCategories(),
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
    gcTime: 24 * 60 * 60 * 1000, // Keep in memory for 24 hours
  });

  // Background prefetching for better UX - preload subcategories for all categories
  useEffect(() => {
    if (categories.length > 0) {
      categories.forEach(category => {
        queryClient.prefetchQuery({
          queryKey: ["/api/workout-subcategories", category.id],
          queryFn: () => getWorkoutSubcategories(category.id),
          staleTime: 24 * 60 * 60 * 1000,
        });
      });
    }
  }, [categories, queryClient]);

  // Add cache invalidation optimization for mutations
  const invalidateWorkoutCache = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/workout-categories"] });
    queryClient.invalidateQueries({ queryKey: ["/api/workout-subcategories"] });
    queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
  };

  // Cached subcategories for selected category
  const { data: subcategories = [], isLoading: subcategoriesLoading } = useQuery({
    queryKey: ["/api/workout-subcategories", selectedCategoryId],
    queryFn: () => getWorkoutSubcategories(selectedCategoryId),
    enabled: Boolean(selectedCategoryId),
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
    gcTime: 24 * 60 * 60 * 1000, // Keep in memory for 24 hours
  });

  // Only fetch exercises when subcategory is explicitly selected (not just browsing categories)
  const { data: exercises = [], isLoading: exercisesLoading } = useQuery({
    queryKey: ["/api/exercises", selectedCategoryId, selectedSubcategoryId],
    queryFn: () => getExercises(selectedCategoryId, selectedSubcategoryId),
    enabled: Boolean(selectedCategoryId && selectedSubcategoryId && view === "exercises"),
    staleTime: 10 * 60 * 1000, // Cache exercises for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in memory for 30 minutes
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertWorkoutCategory) => {
      if (editingCategory) {
        await updateWorkoutCategory(editingCategory.id, data);
      } else {
        await createWorkoutCategory(data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Workout category ${editingCategory ? 'updated' : 'created'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workout-categories"] });
      setIsCategoryFormOpen(false);
      setEditingCategory(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create category: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      await deleteWorkoutCategory(categoryId);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workout category deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workout-categories"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete category: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Create/Update subcategory mutation
  const createSubcategoryMutation = useMutation({
    mutationFn: async (data: InsertWorkoutSubcategory) => {
      if (editingSubcategory) {
        await updateWorkoutSubcategory(selectedCategoryId, editingSubcategory.id, data);
      } else {
        await createWorkoutSubcategory(selectedCategoryId, data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Workout subcategory ${editingSubcategory ? 'updated' : 'created'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workout-subcategories", selectedCategoryId] });
      setIsSubcategoryFormOpen(false);
      setEditingSubcategory(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${editingSubcategory ? 'update' : 'create'} subcategory: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete subcategory mutation
  const deleteSubcategoryMutation = useMutation({
    mutationFn: async (subcategoryId: string) => {
      await deleteWorkoutSubcategory(selectedCategoryId, subcategoryId);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workout subcategory deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workout-subcategories", selectedCategoryId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete subcategory: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Create/Update exercise mutation
  const createExerciseMutation = useMutation({
    mutationFn: async (data: InsertExercise) => {
      if (editingExercise) {
        await updateExercise(selectedCategoryId, selectedSubcategoryId, editingExercise.id, data);
      } else {
        await createExercise(selectedCategoryId, selectedSubcategoryId, data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Exercise ${editingExercise ? 'updated' : 'created'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/exercises", selectedCategoryId, selectedSubcategoryId] });
      setIsExerciseFormOpen(false);
      setEditingExercise(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create exercise: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete exercise mutation
  const deleteExerciseMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      await deleteExercise(selectedCategoryId, selectedSubcategoryId, exerciseId);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Exercise deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/exercises", selectedCategoryId, selectedSubcategoryId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete exercise: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter categories
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter subcategories
  const filteredSubcategories = subcategories.filter(subcategory =>
    subcategory.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter exercises
  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = view === "categories" 
    ? Math.ceil(filteredCategories.length / pageSize)
    : view === "subcategories"
    ? Math.ceil(filteredSubcategories.length / pageSize)
    : Math.ceil(filteredExercises.length / pageSize);
  
  const paginatedItems = view === "categories"
    ? filteredCategories.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : view === "subcategories"
    ? filteredSubcategories.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredExercises.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Modal handlers
  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsCategoryFormOpen(true);
  };

  const handleEditCategory = (category: WorkoutCategory) => {
    setEditingCategory(category);
    setIsCategoryFormOpen(true);
  };

  const handleCategoryFormSubmit = (data: InsertWorkoutCategory) => {
    createCategoryMutation.mutate(data);
  };

  const handleCreateExercise = () => {
    setEditingExercise(null);
    setIsExerciseFormOpen(true);
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setIsExerciseFormOpen(true);
  };

  const handleCreateSubcategory = () => {
    setEditingSubcategory(null);
    setIsSubcategoryFormOpen(true);
  };

  const handleEditSubcategory = (subcategory: WorkoutSubcategory) => {
    setEditingSubcategory(subcategory);
    setIsSubcategoryFormOpen(true);
  };

  const handleSubcategoryFormSubmit = (data: InsertWorkoutSubcategory) => {
    const subcategoryData = {
      ...data,
      categoryId: selectedCategoryId
    };
    createSubcategoryMutation.mutate(subcategoryData);
  };

  const handleExerciseFormSubmit = (data: InsertExercise) => {
    const exerciseData = {
      ...data,
      categoryId: selectedCategoryId,
      subcategoryId: selectedSubcategoryId
    };
    createExerciseMutation.mutate(exerciseData);
  };

  const handleViewCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setView("subcategories");
    setCurrentPage(1);
    setSearchTerm("");
    // Pre-load subcategories when category is selected for better UX
    queryClient.prefetchQuery({
      queryKey: ["/api/workout-subcategories", categoryId],
      queryFn: () => getWorkoutSubcategories(categoryId),
      staleTime: 24 * 60 * 60 * 1000,
    });
  };

  const handleViewSubcategory = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
    setView("exercises");
    setCurrentPage(1);
    setSearchTerm("");
    // Pre-load exercises when subcategory is selected for better UX
    queryClient.prefetchQuery({
      queryKey: ["/api/exercises", selectedCategoryId, subcategoryId],
      queryFn: () => getExercises(selectedCategoryId, subcategoryId),
      staleTime: 10 * 60 * 1000,
    });
  };

  const handleBackToCategories = () => {
    setView("categories");
    setSelectedCategoryId("");
    setSelectedSubcategoryId("");
    setCurrentPage(1);
    setSearchTerm("");
  };

  const handleBackToSubcategories = () => {
    setView("subcategories");
    setSelectedSubcategoryId("");
    setCurrentPage(1);
    setSearchTerm("");
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Dumbbell className="text-primary text-2xl" />
            <h1 className="text-xl font-medium text-gray-900">Workout Manager</h1>
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
              <Link href="/revenuecat-users">
                <Button variant="ghost" size="sm">
                  <Crown className="h-4 w-4 mr-1" />
                  Users
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
        {/* Breadcrumb and Back Button */}
        {view === "subcategories" && (
          <div className="mb-4 flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleBackToCategories}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Categories
            </Button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700">{selectedCategory?.name}</span>
          </div>
        )}

        {view === "exercises" && (
          <div className="mb-4 flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleBackToSubcategories}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Subcategories
            </Button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700">{selectedCategory?.name}</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700">{subcategories.find(s => s.id === selectedSubcategoryId)?.name}</span>
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={
                  view === "categories" ? "Search categories..." : 
                  view === "subcategories" ? "Search subcategories..." :
                  "Search exercises..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button onClick={
              view === "categories" ? handleCreateCategory : 
              view === "subcategories" ? handleCreateSubcategory :
              handleCreateExercise
            }>
              <Plus className="h-4 w-4 mr-2" />
              {view === "categories" ? "Create Category" : 
               view === "subcategories" ? "Create Subcategory" :
               "Create Exercise"}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Categories</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
                <FolderOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Exercises</p>
                  <p className="text-2xl font-bold">
                    {view === "exercises" ? exercises.length : categories.reduce((sum, cat) => sum + (cat.exerciseCount || 0), 0)}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {view === "categories" ? "Showing" : 
                     view === "subcategories" ? "In Category" : 
                     "In Subcategory"}
                  </p>
                  <p className="text-2xl font-bold">
                    {view === "categories" ? filteredCategories.length : 
                     view === "subcategories" ? filteredSubcategories.length :
                     filteredExercises.length}
                  </p>
                </div>
                <Play className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        {(view === "categories" && categoriesLoading) || 
         (view === "subcategories" && subcategoriesLoading) || 
         (view === "exercises" && exercisesLoading) ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {view === "categories" ? "No categories found" : 
               view === "subcategories" ? "No subcategories found" :
               "No exercises found"}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {view === "categories" ? (
              // Categories view
              (paginatedItems as WorkoutCategory[]).map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                          {category.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          Order: {category.order}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteCategoryMutation.mutate(category.id)}
                          disabled={deleteCategoryMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {category.iconUrl && (
                        <div className="text-sm text-gray-600">
                          <p><span className="font-medium">Icon URL:</span> {category.iconUrl}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewCategory(category.id)}
                        >
                          <FolderOpen className="h-3 w-3 mr-1" />
                          View Subcategories
                        </Button>
                        <Badge variant="secondary" className="text-xs">
                          {category.exerciseCount || 0} exercises
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : view === "subcategories" ? (
              // Subcategories view
              (paginatedItems as WorkoutSubcategory[]).map((subcategory) => (
                <Card key={subcategory.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                          {subcategory.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          Order: {subcategory.order}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditSubcategory(subcategory)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteSubcategoryMutation.mutate(subcategory.id)}
                          disabled={deleteSubcategoryMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {subcategory.iconUrl && (
                        <div className="text-sm text-gray-600">
                          <p><span className="font-medium">Icon URL:</span> {subcategory.iconUrl}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewSubcategory(subcategory.id)}
                        >
                          <FolderOpen className="h-3 w-3 mr-1" />
                          View Exercises
                        </Button>
                        <Badge variant="secondary" className="text-xs">
                          {subcategory.exerciseCount || 0} exercises
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Exercises view
              (paginatedItems as Exercise[]).map((exercise) => (
                <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                          {exercise.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {exercise.difficulty} • {exercise.equipment}
                        </p>
                        {exercise.bodyTarget && (
                          <p className="text-xs text-gray-500">
                            Target: {exercise.bodyTarget}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditExercise(exercise)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteExerciseMutation.mutate(exercise.id)}
                          disabled={deleteExerciseMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {exercise.description && (
                        <div className="text-sm text-gray-600">
                          <p>{exercise.description.substring(0, 100)}...</p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        {exercise.muscleGroups.map((muscle, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {muscle}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          Order: {exercise.order}
                        </div>
                        {exercise.videoUrl && (
                          <Button size="sm" variant="outline" className="text-xs">
                            <Play className="h-3 w-3 mr-1" />
                            Watch Video
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
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

      {/* Category Form Modal */}
      <WorkoutCategoryFormModal
        isOpen={isCategoryFormOpen}
        onClose={() => {
          setIsCategoryFormOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSubmit={handleCategoryFormSubmit}
        isLoading={createCategoryMutation.isPending}
      />

      {/* Subcategory Form Modal */}
      <WorkoutSubcategoryFormModal
        isOpen={isSubcategoryFormOpen}
        onClose={() => {
          setIsSubcategoryFormOpen(false);
          setEditingSubcategory(null);
        }}
        subcategory={editingSubcategory}
        categoryId={selectedCategoryId}
        onSubmit={handleSubcategoryFormSubmit}
        isLoading={createSubcategoryMutation.isPending}
      />

      {/* Exercise Form Modal */}
      <WorkoutExerciseFormModal
        isOpen={isExerciseFormOpen}
        onClose={() => {
          setIsExerciseFormOpen(false);
          setEditingExercise(null);
        }}
        exercise={editingExercise}
        onSubmit={handleExerciseFormSubmit}
        isLoading={createExerciseMutation.isPending}
      />
    </div>
  );
}