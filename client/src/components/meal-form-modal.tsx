import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query as firestoreQuery, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { insertMealSchema, type InsertMeal, type Meal, type Food, type MealFood } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Search, Trash2, Edit, Check } from "lucide-react";

interface MealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal?: Meal | null;
  onSubmit: (data: InsertMeal) => void;
  isLoading: boolean;
}

const formSchema = insertMealSchema.extend({
  tags: z.array(z.string()).optional(),
  cultural: z.array(z.string()).optional(),
});

export function MealFormModal({ isOpen, onClose, meal, onSubmit, isLoading }: MealFormModalProps) {
  const [newTag, setNewTag] = useState("");
  const [selectedCultures, setSelectedCultures] = useState<string[]>([]);
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [mealFoods, setMealFoods] = useState<MealFood[]>([]);
  const [foodSearch, setFoodSearch] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [newFoodPortion, setNewFoodPortion] = useState("");
  const [newFoodRole, setNewFoodRole] = useState<"protein_primary" | "carb_primary" | "fat_primary" | "filler">("protein_primary");
  const [newAllowedPortions, setNewAllowedPortions] = useState("");
  const [editingPortions, setEditingPortions] = useState<{ [key: number]: string }>({});

  // Initialize form data when meal prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (meal) {
        setSelectedCultures(meal.cultural || []);
        setSelectedMealTypes(Array.isArray(meal.mealType) ? meal.mealType : [meal.mealType]);
        setTags(meal.tags || []);
        setMealFoods(meal.foods || []);
      } else {
        setSelectedCultures([]);
        setSelectedMealTypes(["breakfast"]);
        setTags([]);
        setMealFoods([]);
      }
      // Reset search states
      setFoodSearch("");
      setSelectedFoodId("");
      setNewFoodPortion("");
      setNewFoodRole("protein_primary");
      setNewAllowedPortions("");
      setNewTag("");
      setEditingPortions({});
    }
  }, [meal, isOpen]);

  // Fetch ALL foods for meal form - don't use cached data with limits
  const { data: foods = [] } = useQuery<Food[]>({
    queryKey: ["/api/foods-all"],
    queryFn: async () => {
      const foodsCollection = collection(db, "foods");
      const q = firestoreQuery(foodsCollection, orderBy("name")); // No limit - get all foods
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Loading food for meal form:', data.name || 'Unknown');
        
        // Ensure proper data structure - same as foods manager
        return {
          id: doc.id,
          name: data.name || '',
          kurdishName: data.kurdishName,
          arabicName: data.arabicName,
          baseName: data.baseName || '',
          brand: data.brand,
          category: data.category,
          foodType: data.foodType,
          availableUnits: data.availableUnits,
          // Ensure nutritionPer100 is properly structured
          nutritionPer100: data.nutritionPer100 ? {
            calories: Number(data.nutritionPer100.calories) || 0,
            protein: data.nutritionPer100.protein ? Number(data.nutritionPer100.protein) : undefined,
            carbs: data.nutritionPer100.carbs ? Number(data.nutritionPer100.carbs) : undefined,
            fat: data.nutritionPer100.fat ? Number(data.nutritionPer100.fat) : undefined,
            fiber: data.nutritionPer100.fiber ? Number(data.nutritionPer100.fiber) : undefined,
            sugar: data.nutritionPer100.sugar ? Number(data.nutritionPer100.sugar) : undefined,
            sodium: data.nutritionPer100.sodium ? Number(data.nutritionPer100.sodium) : undefined,
            calcium: data.nutritionPer100.calcium ? Number(data.nutritionPer100.calcium) : undefined,
            potassium: data.nutritionPer100.potassium ? Number(data.nutritionPer100.potassium) : undefined,
            vitaminB12: data.nutritionPer100.vitaminB12 ? Number(data.nutritionPer100.vitaminB12) : undefined,
            vitaminA: data.nutritionPer100.vitaminA ? Number(data.nutritionPer100.vitaminA) : undefined,
            vitaminE: data.nutritionPer100.vitaminE ? Number(data.nutritionPer100.vitaminE) : undefined,
            vitaminD: data.nutritionPer100.vitaminD ? Number(data.nutritionPer100.vitaminD) : undefined,
            vitaminC: data.nutritionPer100.vitaminC ? Number(data.nutritionPer100.vitaminC) : undefined,
            iron: data.nutritionPer100.iron ? Number(data.nutritionPer100.iron) : undefined,
            magnesium: data.nutritionPer100.magnesium ? Number(data.nutritionPer100.magnesium) : undefined,
          } : {
            calories: 0
          },
          customConversions: data.customConversions,
          vegetarian: data.vegetarian,
          vegan: data.vegan,
          glutenFree: data.glutenFree,
          dairyFree: data.dairyFree,
          mealPlanner: data.mealPlanner,
          allowDuplication: data.allowDuplication,
          lowCalorie: data.lowCalorie,
          calorieAdjustment: data.calorieAdjustment,
          minPortion: data.minPortion,
          maxPortion: data.maxPortion,
          mealTiming: data.mealTiming,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Food;
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const form = useForm<InsertMeal>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      mealArabicName: "",
      mealKurdishName: "",
      mealType: ["breakfast"],
      foods: [],
      baseCalories: 0,
      baseProtein: 0,
      baseCarbs: 0,
      baseFat: 0,
      minScale: 0.5,
      maxScale: 2.0,
      prepTime: 0,
      difficulty: "easy",
      cultural: [],
      tags: [],
      isActive: true,
    },
  });

  // Reset form when meal changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (meal) {
        form.reset({
          name: meal.name || "",
          mealArabicName: meal.mealArabicName || "",
          mealKurdishName: meal.mealKurdishName || "",
          mealType: Array.isArray(meal.mealType) ? meal.mealType : [meal.mealType || "breakfast"],
          foods: meal.foods || [],
          baseCalories: meal.baseCalories || 0,
          baseProtein: meal.baseProtein || 0,
          baseCarbs: meal.baseCarbs || 0,
          baseFat: meal.baseFat || 0,
          minScale: meal.minScale || 0.5,
          maxScale: meal.maxScale || 2.0,
          prepTime: meal.prepTime || 0,
          difficulty: meal.difficulty || "easy",
          cultural: meal.cultural || [],
          tags: meal.tags || [],
          isActive: meal.isActive ?? true,
        });
      } else {
        form.reset({
          name: "",
          mealArabicName: "",
          mealKurdishName: "",
          mealType: ["breakfast"],
          foods: [],
          baseCalories: 0,
          baseProtein: 0,
          baseCarbs: 0,
          baseFat: 0,
          minScale: 0.5,
          maxScale: 2.0,
          prepTime: 0,
          difficulty: "easy",
          cultural: [],
          tags: [],
          isActive: true,
        });
      }
      // Clear form validation errors
      form.clearErrors();
    }
  }, [meal, form, isOpen]);

  const handleSubmit = (data: InsertMeal) => {
    onSubmit({
      ...data,
      mealType: selectedMealTypes,
      foods: mealFoods,
      cultural: selectedCultures,
      tags: tags,
    });
  };

  // Filter foods based on search
  const filteredFoods = foods.filter(food => 
    food.name.toLowerCase().includes(foodSearch.toLowerCase()) ||
    food.kurdishName?.toLowerCase().includes(foodSearch.toLowerCase()) ||
    food.arabicName?.toLowerCase().includes(foodSearch.toLowerCase())
  );

  // Add food to meal
  const addFoodToMeal = () => {
    if (selectedFoodId && newFoodPortion) {
      // Parse allowed portions from comma-separated string
      const allowedPortions = newAllowedPortions
        .split(',')
        .map(p => parseFloat(p.trim()))
        .filter(p => !isNaN(p) && p > 0);
      
      const newFood: MealFood = {
        foodId: selectedFoodId,
        basePortion: parseFloat(newFoodPortion),
        role: newFoodRole,
        allowedPortions: allowedPortions.length > 0 ? allowedPortions : undefined,
      };
      const updatedFoods = [...mealFoods, newFood];
      setMealFoods(updatedFoods);
      setSelectedFoodId("");
      setNewFoodPortion("");
      setNewAllowedPortions("");
      setFoodSearch("");
    }
  };

  // Remove food from meal
  const removeFoodFromMeal = (index: number) => {
    const updatedFoods = mealFoods.filter((_, i) => i !== index);
    setMealFoods(updatedFoods);
  };

  // Get food name by ID with better logging
  const getFoodName = (foodId: string) => {
    const food = foods.find(f => f.id === foodId);
    if (!food) {
      console.warn(`Food not found for ID: ${foodId}. Available foods: ${foods.length}. Loading all foods...`);
      return `Loading... (${foodId})`;
    }
    return food.name || food.id;
  };

  // Calculate base nutrition from all foods in the meal
  const calculateBaseNutrition = () => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    mealFoods.forEach(mealFood => {
      const food = foods.find(f => f.id === mealFood.foodId);
      if (food && food.nutritionPer100) {
        // Formula: (nutritionPer100g × basePortion) ÷ 100
        const calories = (food.nutritionPer100.calories * mealFood.basePortion) / 100;
        const protein = ((food.nutritionPer100.protein || 0) * mealFood.basePortion) / 100;
        const carbs = ((food.nutritionPer100.carbs || 0) * mealFood.basePortion) / 100;
        const fat = ((food.nutritionPer100.fat || 0) * mealFood.basePortion) / 100;

        totalCalories += calories;
        totalProtein += protein;
        totalCarbs += carbs;
        totalFat += fat;
      }
    });

    return {
      calories: Math.round(totalCalories * 10) / 10,
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
    };
  };

  // Update form values when foods change
  const updateNutritionValues = () => {
    const nutrition = calculateBaseNutrition();
    form.setValue("baseCalories", nutrition.calories);
    form.setValue("baseProtein", nutrition.protein);
    form.setValue("baseCarbs", nutrition.carbs);
    form.setValue("baseFat", nutrition.fat);
  };

  // Recalculate nutrition when foods change
  useEffect(() => {
    if (foods.length > 0) {
      updateNutritionValues();
    }
  }, [mealFoods, foods]);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Start editing allowed portions for a specific meal food
  const startEditingPortions = (index: number) => {
    const currentPortions = mealFoods[index].allowedPortions || [];
    setEditingPortions({
      ...editingPortions,
      [index]: currentPortions.join(', ')
    });
  };

  // Save edited allowed portions
  const saveEditedPortions = (index: number) => {
    const portionsText = editingPortions[index] || '';
    const allowedPortions = portionsText
      .split(',')
      .map(p => parseFloat(p.trim()))
      .filter(p => !isNaN(p) && p > 0);
    
    const updatedFoods = [...mealFoods];
    updatedFoods[index] = {
      ...updatedFoods[index],
      allowedPortions: allowedPortions.length > 0 ? allowedPortions : undefined,
    };
    setMealFoods(updatedFoods);
    
    // Clear editing state
    const newEditingPortions = { ...editingPortions };
    delete newEditingPortions[index];
    setEditingPortions(newEditingPortions);
  };

  // Cancel editing allowed portions
  const cancelEditingPortions = (index: number) => {
    const newEditingPortions = { ...editingPortions };
    delete newEditingPortions[index];
    setEditingPortions(newEditingPortions);
  };

  const toggleCulture = (culture: string) => {
    setSelectedCultures(prev => 
      prev.includes(culture) 
        ? prev.filter(c => c !== culture)
        : [...prev, culture]
    );
  };

  const toggleMealType = (mealType: string) => {
    setSelectedMealTypes(prev => 
      prev.includes(mealType) 
        ? prev.filter(mt => mt !== mealType)
        : [...prev, mealType]
    );
  };

  const culturalOptions = ["arabic", "kurdish", "western", "mediterranean", "asian"];
  const mealTypeOptions = ["breakfast", "lunch", "dinner", "snack"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {meal ? "Edit Meal" : "Add New Meal"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name">Meal Name (English)*</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="e.g., Protein Power Breakfast"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mealArabicName">Arabic Name</Label>
                  <Input
                    id="mealArabicName"
                    {...form.register("mealArabicName")}
                    placeholder="e.g., فطار البروتين القوي"
                  />
                </div>
                <div>
                  <Label htmlFor="mealKurdishName">Kurdish Name</Label>
                  <Input
                    id="mealKurdishName"
                    {...form.register("mealKurdishName")}
                    placeholder="e.g., نان ی پڕوتین"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-4">
            <div>
              <Label>Meal Types*</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {mealTypeOptions.map((mealType) => (
                  <Badge
                    key={mealType}
                    variant={selectedMealTypes.includes(mealType) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleMealType(mealType)}
                  >
                    {mealType}
                  </Badge>
                ))}
              </div>
              {selectedMealTypes.length === 0 && (
                <p className="text-sm text-red-500 mt-1">At least one meal type is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty*</Label>
              <Select 
                value={form.watch("difficulty")} 
                onValueChange={(value) => form.setValue("difficulty", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Nutrition Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Base Nutrition (per serving)</h3>
              <Badge variant="secondary" className="text-xs">
                Auto-calculated from foods
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="baseCalories">Calories*</Label>
                <Input
                  id="baseCalories"
                  type="number"
                  {...form.register("baseCalories", { valueAsNumber: true })}
                  placeholder="Auto-calculated"
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="baseProtein">Protein (g)*</Label>
                <Input
                  id="baseProtein"
                  type="number"
                  step="0.1"
                  {...form.register("baseProtein", { valueAsNumber: true })}
                  placeholder="Auto-calculated"
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="baseCarbs">Carbs (g)*</Label>
                <Input
                  id="baseCarbs"
                  type="number"
                  step="0.1"
                  {...form.register("baseCarbs", { valueAsNumber: true })}
                  placeholder="Auto-calculated"
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="baseFat">Fat (g)*</Label>
                <Input
                  id="baseFat"
                  type="number"
                  step="0.1"
                  {...form.register("baseFat", { valueAsNumber: true })}
                  placeholder="Auto-calculated"
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Nutrition values are calculated using: (nutritionPer100g × basePortion) ÷ 100, then summed for all foods.
            </p>
          </div>

          {/* Scaling & Metadata */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="minScale">Min Scale*</Label>
              <Input
                id="minScale"
                type="number"
                step="0.1"
                {...form.register("minScale", { valueAsNumber: true })}
                placeholder="e.g., 0.5"
              />
            </div>
            <div>
              <Label htmlFor="maxScale">Max Scale*</Label>
              <Input
                id="maxScale"
                type="number"
                step="0.1"
                {...form.register("maxScale", { valueAsNumber: true })}
                placeholder="e.g., 2.5"
              />
            </div>
            <div>
              <Label htmlFor="prepTime">Prep Time (minutes)*</Label>
              <Input
                id="prepTime"
                type="number"
                {...form.register("prepTime", { valueAsNumber: true })}
                placeholder="e.g., 10"
              />
            </div>
          </div>

          {/* Foods Management */}
          <div className="space-y-4">
            <h3 className="font-semibold">Foods in this Meal</h3>
            
            {/* Add New Food */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Add Food</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Search Food</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search foods..."
                      value={foodSearch}
                      onChange={(e) => setFoodSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {foodSearch && filteredFoods.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border rounded-md">
                      {filteredFoods.slice(0, 10).map((food) => (
                        <div
                          key={food.id}
                          className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => {
                            setSelectedFoodId(food.id);
                            setFoodSearch(food.name);
                          }}
                        >
                          <div className="font-medium">{food.name}</div>
                          <div className="text-sm text-gray-500">
                            {food.arabicName && <span>{food.arabicName}</span>}
                            {food.kurdishName && <span> • {food.kurdishName}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Base Portion (g)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 120"
                      value={newFoodPortion}
                      onChange={(e) => setNewFoodPortion(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={newFoodRole} onValueChange={setNewFoodRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="protein_primary">Protein Primary</SelectItem>
                        <SelectItem value="carb_primary">Carb Primary</SelectItem>
                        <SelectItem value="fat_primary">Fat Primary</SelectItem>
                        <SelectItem value="filler">Filler</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Allowed Portions (g)</Label>
                  <Input
                    placeholder="e.g., 120, 190, 250"
                    value={newAllowedPortions}
                    onChange={(e) => setNewAllowedPortions(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Comma-separated values (optional)
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={addFoodToMeal}
                  disabled={!selectedFoodId || !newFoodPortion}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Food to Meal
                </Button>
              </CardContent>
            </Card>

            {/* Current Foods in Meal */}
            {mealFoods.length > 0 && (
              <div className="space-y-2">
                <Label>Current Foods ({mealFoods.length})</Label>
                <div className="space-y-2">
                  {mealFoods.map((mealFood, index) => {
                    const food = foods.find(f => f.id === mealFood.foodId);
                    const calories = food && food.nutritionPer100 ? Math.round(((food.nutritionPer100.calories * mealFood.basePortion) / 100) * 10) / 10 : 0;
                    const protein = food && food.nutritionPer100 ? Math.round((((food.nutritionPer100.protein || 0) * mealFood.basePortion) / 100) * 10) / 10 : 0;
                    
                    return (
                      <div
                        key={index}
                        className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{getFoodName(mealFood.foodId)}</div>
                          <div className="text-sm text-gray-500">
                            {mealFood.basePortion}g • {mealFood.role.replace('_', ' ')}
                          </div>
                          <div className="text-xs text-gray-400">
                            Contributes: {calories} cal, {protein}g protein
                          </div>
                          
                          {/* Allowed Portions - Show inline editor if editing, otherwise show current values */}
                          {editingPortions[index] !== undefined ? (
                            <div className="mt-2 flex items-center space-x-2">
                              <Input
                                value={editingPortions[index]}
                                onChange={(e) => setEditingPortions({
                                  ...editingPortions,
                                  [index]: e.target.value
                                })}
                                placeholder="e.g., 120, 190, 250"
                                className="h-8 text-xs"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => saveEditedPortions(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => cancelEditingPortions(index)}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between mt-1">
                              <div className="text-xs text-blue-600">
                                Allowed portions: {mealFood.allowedPortions && mealFood.allowedPortions.length > 0 
                                  ? mealFood.allowedPortions.join(', ') + 'g' 
                                  : 'None set'
                                }
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditingPortions(index)}
                                className="h-6 w-6 p-0 ml-2"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFoodFromMeal(index)}
                          className="ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Cultural Tags */}
          <div className="space-y-3">
            <Label>Cultural Classifications</Label>
            <div className="flex flex-wrap gap-2">
              {culturalOptions.map((culture) => (
                <Badge
                  key={culture}
                  variant={selectedCultures.includes(culture) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCulture(culture)}
                >
                  {culture}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <X 
                      className="h-3 w-3 ml-1" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : meal ? "Update Meal" : "Add Meal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}