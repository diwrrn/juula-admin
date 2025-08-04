import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy, 
  query as firestoreQuery,
  onSnapshot,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Meal, InsertMeal, Food } from "@shared/schema";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, Plus, Search, Clock, Users, Star, Edit, Trash2, Utensils, Dumbbell, Crown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { MealFormModal } from "@/components/meal-form-modal";

export default function MealsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [mealTypeFilter, setMealTypeFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  // Get meals from cache (populated by real-time listener)
  const { data: meals = [] } = useQuery<Meal[]>({
    queryKey: ["/api/meals"],
    queryFn: () => Promise.resolve([]), // Never called - data comes from onSnapshot
    staleTime: Infinity, // Data is always fresh via real-time listener
  });

  // Shared foods cache - no duplicate fetching
  const { data: foods = [] } = useQuery<Food[]>({
    queryKey: ["/api/foods"],
    queryFn: () => Promise.resolve([]), // Never called - data comes from Foods Manager's onSnapshot
    staleTime: Infinity, // Data is always fresh via real-time listener
  });

  // Real-time listener with loading state for meals
  const [mealsLoading, setMealsLoading] = useState(true);
  const [mealsError, setMealsError] = useState<Error | null>(null);

  useEffect(() => {
    const mealsCollection = collection(db, "meals");
    // Add limit to meals loading (30 meals initially)
    const q = firestoreQuery(mealsCollection, orderBy("name"), limit(30));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const updatedMeals = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Meal[];
        
        queryClient.setQueryData(["/api/meals"], updatedMeals);
        setMealsLoading(false);
        setMealsError(null);
      },
      (err) => {
        setMealsError(err as Error);
        setMealsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [queryClient]);

  // Add sample meal mutation
  const addSampleMealMutation = useMutation({
    mutationFn: async () => {
      const mealsCollection = collection(db, "meals");
      const now = new Date();
      const sampleMeal: InsertMeal = {
        name: "Protein Power Breakfast",
        mealArabicName: "فطار البروتين القوي",
        mealKurdishName: "نان ی پڕوتین",
        mealType: ["breakfast"],
        foods: [
          { foodId: "sample_eggs", basePortion: 120, role: "protein_primary" },
          { foodId: "sample_bread", basePortion: 75, role: "carb_primary" },
          { foodId: "sample_tomatoes", basePortion: 150, role: "filler" }
        ],
        baseCalories: 485,
        baseProtein: 32.5,
        baseCarbs: 45.2,
        baseFat: 18.7,
        minScale: 0.5,
        maxScale: 2.5,
        prepTime: 10,
        difficulty: "easy",
        cultural: ["arabic", "kurdish", "western"],
        tags: ["high_protein", "quick"],
        isActive: true
      };
      
      await addDoc(mealsCollection, {
        ...sampleMeal,
        createdAt: now,
        updatedAt: now,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sample meal added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add sample meal: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Add meal mutation
  const addMealMutation = useMutation({
    mutationFn: async (newMeal: InsertMeal) => {
      const mealsCollection = collection(db, "meals");
      const now = new Date();
      await addDoc(mealsCollection, {
        ...newMeal,
        createdAt: now,
        updatedAt: now,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Meal added successfully",
      });
      setIsAddModalOpen(false);
      setEditingMeal(null);
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add meal: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update meal mutation
  const updateMealMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertMeal> }) => {
      const mealDoc = doc(db, "meals", id);
      await updateDoc(mealDoc, {
        ...data,
        updatedAt: new Date(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Meal updated successfully",
      });
      setIsAddModalOpen(false);
      setEditingMeal(null);
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update meal: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete meal mutation
  const deleteMealMutation = useMutation({
    mutationFn: async (mealId: string) => {
      await deleteDoc(doc(db, "meals", mealId));
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Meal deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete meal: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter and sort meals
  const filteredAndSortedMeals = useMemo(() => {
    return meals.filter(meal => {
      const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.mealArabicName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.mealKurdishName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesMealType = mealTypeFilter === "all" || 
        (Array.isArray(meal.mealType) ? meal.mealType.includes(mealTypeFilter as any) : meal.mealType === mealTypeFilter);
      const matchesDifficulty = difficultyFilter === "all" || meal.difficulty === difficultyFilter;
      
      return matchesSearch && matchesMealType && matchesDifficulty && meal.isActive;
    });
  }, [meals, searchTerm, mealTypeFilter, difficultyFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedMeals.length / pageSize);
  const paginatedMeals = filteredAndSortedMeals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case "breakfast": return "bg-orange-100 text-orange-800";
      case "lunch": return "bg-blue-100 text-blue-800";
      case "dinner": return "bg-purple-100 text-purple-800";
      case "snack": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (mealsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">Failed to connect to Firebase</div>
          <div className="text-gray-600">{mealsError.message}</div>
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
            <ChefHat className="text-primary text-2xl" />
            <h1 className="text-xl font-medium text-gray-900">Meals Manager</h1>
            <nav className="flex items-center space-x-1 ml-8">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Utensils className="h-4 w-4 mr-1" />
                  Foods
                </Button>
              </Link>
              <Link href="/meals">
                <Button variant="ghost" size="sm" className="text-blue-600 bg-blue-50">
                  <ChefHat className="h-4 w-4 mr-1" />
                  Meals
                </Button>
              </Link>
              <Link href="/workout-plans">
                <Button variant="ghost" size="sm">
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
        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search meals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Select value={mealTypeFilter} onValueChange={setMealTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Meal Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>

            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => addSampleMealMutation.mutate()}
              disabled={addSampleMealMutation.isPending}
            >
              {addSampleMealMutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Add Sample Meal
            </Button>
            <Button 
              className="bg-primary hover:bg-blue-700"
              onClick={() => {
                setEditingMeal(null);
                setIsAddModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Meal
            </Button>
          </div>
        </div>

        {/* Meals Grid */}
        {mealsLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedMeals.map((meal) => (
              <Card key={meal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        {meal.name}
                      </CardTitle>
                      {meal.mealArabicName && (
                        <p className="text-sm text-gray-600 mb-1">{meal.mealArabicName}</p>
                      )}
                      {meal.mealKurdishName && (
                        <p className="text-sm text-gray-600">{meal.mealKurdishName}</p>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setEditingMeal(meal);
                          setIsAddModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteMealMutation.mutate(meal.id)}
                        disabled={deleteMealMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 flex-wrap">
                      {(Array.isArray(meal.mealType) ? meal.mealType : [meal.mealType]).map((type, index) => (
                        <Badge key={index} className={getMealTypeColor(type)}>
                          {type}
                        </Badge>
                      ))}
                      <Badge className={getDifficultyColor(meal.difficulty)}>
                        {meal.difficulty}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span>{meal.prepTime} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3 text-gray-500" />
                        <span>{meal.foods.length} foods</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p><span className="font-medium">Calories:</span> {meal.baseCalories}</p>
                      <p><span className="font-medium">Protein:</span> {meal.baseProtein}g</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {meal.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {meal.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{meal.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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

      {/* Add/Edit Meal Modal */}
      <MealFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMeal(null);
        }}
        meal={editingMeal}
        onSubmit={(data) => {
          if (editingMeal) {
            updateMealMutation.mutate({ id: editingMeal.id, data });
          } else {
            addMealMutation.mutate(data);
          }
        }}
        isLoading={addMealMutation.isPending || updateMealMutation.isPending}
      />
    </div>
  );
}