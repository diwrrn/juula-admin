import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFoodSchema, type Food, type InsertFood } from "@shared/schema";

import { categoryConfig, allServingUnits, mealTimingOptions, getSuggestedConversions } from "@shared/schema";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Minus } from "lucide-react";

interface FoodFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  food?: Food | null;
  onSubmit: (data: InsertFood) => void;
  isLoading: boolean;
}

export function FoodFormModal({ isOpen, onClose, food, onSubmit, isLoading }: FoodFormModalProps) {
  const getDefaultValues = () => {
    const defaultFoodType = food?.foodType || "solid";
    const defaultUnits = defaultFoodType === "liquid" 
      ? ["ml", "l", "cup", "tbsp", "tsp"] as const
      : ["g", "cup", "tbsp", "tsp", "plate", "fist", "piece"] as const;
    
    return {
      name: food?.name || "",
      kurdishName: food?.kurdishName || "",
      arabicName: food?.arabicName || "",
      brand: food?.brand || "",
      category: food?.category || "fruits",
      foodType: defaultFoodType,
      availableUnits: food?.availableUnits || [...defaultUnits],
      nutritionPer100: {
        calories: food?.nutritionPer100?.calories || 0,
        protein: food?.nutritionPer100?.protein || 0,
        carbs: food?.nutritionPer100?.carbs || 0,
        fat: food?.nutritionPer100?.fat || 0,
        fiber: food?.nutritionPer100?.fiber || 0,
        sugar: food?.nutritionPer100?.sugar || 0,
        sodium: food?.nutritionPer100?.sodium || 0,
        calcium: food?.nutritionPer100?.calcium || 0,
        potassium: food?.nutritionPer100?.potassium || 0,
        vitaminB12: food?.nutritionPer100?.vitaminB12 || 0,
        vitaminA: food?.nutritionPer100?.vitaminA || 0,
        vitaminE: food?.nutritionPer100?.vitaminE || 0,
        vitaminD: food?.nutritionPer100?.vitaminD || 0,
        iron: food?.nutritionPer100?.iron || 0,
        magnesium: food?.nutritionPer100?.magnesium || 0,
      },
      customConversions: food?.customConversions || {},
      vegetarian: food?.vegetarian || false,
      vegan: food?.vegan || false,
      glutenFree: food?.glutenFree || false,
      dairyFree: food?.dairyFree || false,
      mealTiming: food?.mealTiming || [],
    };
  };

  const form = useForm<InsertFood>({
    resolver: zodResolver(insertFoodSchema),
    defaultValues: getDefaultValues(),
  });

  // Reset form when modal opens with different food
  useEffect(() => {
    if (isOpen) {
      form.reset(getDefaultValues());
    }
  }, [isOpen, food?.id]);

  const foodType = form.watch("foodType");



  const handleSubmit = (data: InsertFood) => {
    // Clean all undefined values for Firebase compatibility
    const cleanCustomConversions = Object.fromEntries(
      Object.entries(data.customConversions || {}).filter(([_, value]) => value !== undefined && value !== null)
    );
    
    // Set appropriate default units based on food type
    const defaultUnits = data.foodType === "liquid" 
      ? ["ml", "l", "cup", "tbsp", "tsp"] as const
      : ["g", "cup", "tbsp", "tsp", "plate", "fist", "piece"] as const;
    
    const cleanData = {
      ...data,
      availableUnits: data.availableUnits?.filter(Boolean) || [...defaultUnits] as ("ml" | "l" | "g" | "cup" | "tbsp" | "tsp" | "plate" | "fist" | "piece")[],
      customConversions: cleanCustomConversions
    };
    onSubmit(cleanData);
  };

  // Available serving units based on food type
  const availableServingUnits = allServingUnits.filter(unit => {
    if (foodType === "liquid") {
      return !["plate", "fist", "piece"].includes(unit.value);
    }
    return !["ml", "l"].includes(unit.value);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{food ? "Edit Food Item" : "Add New Food Item"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Basic Information</h4>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (English) *</FormLabel>
                    <FormControl>
                      <Input placeholder="White Rice" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="kurdishName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kurdish Name</FormLabel>
                      <FormControl>
                        <Input placeholder="برنج سپی" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="arabicName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arabic Name</FormLabel>
                      <FormControl>
                        <Input placeholder="أرز أبيض" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <Input placeholder="Uncle Ben's" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(categoryConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="foodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="solid">Solid</SelectItem>
                          <SelectItem value="liquid">Liquid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Available Units */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Available Units</h4>
                <p className="text-sm text-gray-500">Which units can this food be measured in?</p>
              </div>
              
              <FormField
                control={form.control}
                name="availableUnits"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="grid grid-cols-3 gap-3">
                        {availableServingUnits.map((unit) => (
                          <div key={unit.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={unit.value}
                              checked={field.value?.includes(unit.value as any) || false}
                              onCheckedChange={(checked) => {
                                const currentUnits = field.value || [];
                                if (checked) {
                                  field.onChange([...currentUnits, unit.value as any]);
                                } else {
                                  field.onChange(currentUnits.filter(u => u !== unit.value));
                                }
                              }}
                            />
                            <Label htmlFor={unit.value} className="text-sm">
                              {unit.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Nutrition Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">
                Nutrition Facts per 100{foodType === "solid" ? "g" : "ml"}
              </h4>
              
              <FormField
                control={form.control}
                name="nutritionPer100.calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="nutritionPer100.protein"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nutritionPer100.carbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbs (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nutritionPer100.fat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fat (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="nutritionPer100.fiber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiber (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nutritionPer100.sugar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sugar (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nutritionPer100.sodium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sodium (mg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Vitamins and Minerals */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Vitamins & Minerals</h4>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="nutritionPer100.calcium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calcium (mg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nutritionPer100.potassium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Potassium (mg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nutritionPer100.vitaminB12"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vitamin B12 (μg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="nutritionPer100.vitaminA"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vitamin A (μg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nutritionPer100.vitaminE"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vitamin E (mg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nutritionPer100.vitaminD"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vitamin D (μg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nutritionPer100.iron"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Iron (mg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nutritionPer100.magnesium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Magnesium (mg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Custom Serving Conversions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Custom Serving Conversions</h4>
                <p className="text-sm text-gray-500">Override default weights for more accuracy</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">
                  Set custom weights for this specific food. Leave blank to use smart defaults.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="customConversions.cup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>1 cup = ? {foodType === "solid" ? "grams" : "ml"}</FormLabel>
                        <FormControl>
                          <div className="flex gap-1">
                            <Input 
                              type="number" 
                              step="0.1" 
                              placeholder="Auto"
                              value={field.value === undefined || field.value === null ? "" : String(field.value)}
                              onChange={(e) => {
                                const value = e.target.value.trim();
                                if (value === "") {
                                  field.onChange(undefined);
                                } else {
                                  const numValue = parseFloat(value);
                                  field.onChange(isNaN(numValue) ? undefined : numValue);
                                }
                              }}
                            />
                            {(field.value !== undefined && field.value !== null) && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  field.onChange(undefined);
                                  // Also clear the input value directly
                                  const input = document.querySelector(`input[name="customConversions.cup"]`) as HTMLInputElement;
                                  if (input) input.value = "";
                                }}
                                className="px-2 shrink-0"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customConversions.plate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>1 plate = ? {foodType === "solid" ? "grams" : "ml"}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="Auto"
                            value={field.value === undefined ? "" : field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "") {
                                field.onChange(undefined);
                              } else {
                                const numValue = Number(value);
                                field.onChange(isNaN(numValue) ? undefined : numValue);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customConversions.piece"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>1 piece = ? {foodType === "solid" ? "grams" : "ml"}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="Auto"
                            value={field.value === undefined ? "" : field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "") {
                                field.onChange(undefined);
                              } else {
                                const numValue = Number(value);
                                field.onChange(isNaN(numValue) ? undefined : numValue);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="customConversions.fist"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>1 fist = ? {foodType === "solid" ? "grams" : "ml"}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="Auto"
                            value={field.value === undefined ? "" : field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "") {
                                field.onChange(undefined);
                              } else {
                                const numValue = Number(value);
                                field.onChange(isNaN(numValue) ? undefined : numValue);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customConversions.tbsp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>1 tbsp = ? {foodType === "solid" ? "grams" : "ml"}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="Auto"
                            value={field.value === undefined ? "" : field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "") {
                                field.onChange(undefined);
                              } else {
                                const numValue = Number(value);
                                field.onChange(isNaN(numValue) ? undefined : numValue);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="customConversions.tsp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>1 tsp = ? {foodType === "solid" ? "grams" : "ml"}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="Auto"
                            value={field.value === undefined ? "" : field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "") {
                                field.onChange(undefined);
                              } else {
                                const numValue = Number(value);
                                field.onChange(isNaN(numValue) ? undefined : numValue);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Dietary Information */}
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Dietary Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vegetarian"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Vegetarian</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vegan"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Vegan</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="glutenFree"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Gluten Free</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dairyFree"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Dairy Free</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Meal Timing */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Meal Timing</h4>
                <p className="text-sm text-gray-500">When is this food appropriate?</p>
              </div>
              
              <FormField
                control={form.control}
                name="mealTiming"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="grid grid-cols-3 gap-4">
                        {mealTimingOptions.map((timing) => (
                          <div key={timing.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={timing.value}
                              checked={field.value?.includes(timing.value as any) || false}
                              onCheckedChange={(checked) => {
                                const currentTimings = field.value || [];
                                if (checked) {
                                  field.onChange([...currentTimings, timing.value as any]);
                                } else {
                                  field.onChange(currentTimings.filter(t => t !== timing.value));
                                }
                              }}
                            />
                            <Label htmlFor={timing.value} className="text-sm font-medium">
                              {timing.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                {food ? "Update Food" : "Add Food"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}