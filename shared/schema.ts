import { z } from "zod";

export const foodSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Food name is required"),
  kurdishName: z.string().optional(),
  arabicName: z.string().optional(),
  brand: z.string().optional(),
  category: z.enum([
    "fruits",
    "vegetables", 
    "grains",
    "proteins",
    "dairy",
    "beverages",
    "snacks",
    "condiments"
  ]),
  foodType: z.enum(["solid", "liquid"]),
  servings: z.array(z.object({
    size: z.number().positive(),
    unit: z.enum(["ml", "l", "g", "cup", "tbsp", "tsp", "plate", "fist", "piece"]),
    description: z.string().optional()
  })).optional(),
  // Nutrition facts per 100g (solid) or 100ml (liquid)
  nutritionPer100: z.object({
    calories: z.number().min(0, "Calories must be non-negative"),
    protein: z.number().min(0).optional(),
    carbs: z.number().min(0).optional(),
    fat: z.number().min(0).optional(),
    fiber: z.number().min(0).optional(),
    sugar: z.number().min(0).optional(),
    sodium: z.number().min(0).optional()
  }),
  description: z.string().optional(),
  barcode: z.string().optional(),
  vegetarian: z.boolean().optional(),
  vegan: z.boolean().optional(),
  glutenFree: z.boolean().optional(),
  dairyFree: z.boolean().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertFoodSchema = foodSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Food = z.infer<typeof foodSchema>;
export type InsertFood = z.infer<typeof insertFoodSchema>;

// Category display names and colors
export const categoryConfig = {
  fruits: { label: "Fruits", color: "bg-green-100 text-green-800" },
  vegetables: { label: "Vegetables", color: "bg-green-100 text-green-800" },
  grains: { label: "Grains", color: "bg-yellow-100 text-yellow-800" },
  proteins: { label: "Proteins", color: "bg-blue-100 text-blue-800" },
  dairy: { label: "Dairy", color: "bg-purple-100 text-purple-800" },
  beverages: { label: "Beverages", color: "bg-cyan-100 text-cyan-800" },
  snacks: { label: "Snacks", color: "bg-orange-100 text-orange-800" },
  condiments: { label: "Condiments", color: "bg-gray-100 text-gray-800" },
};

// Serving units configuration based on food type
export const servingUnitsConfig = {
  solid: [
    { value: "g", label: "grams (g)" },
    { value: "cup", label: "cup" },
    { value: "tbsp", label: "tablespoon (tbsp)" },
    { value: "tsp", label: "teaspoon (tsp)" },
    { value: "plate", label: "plate" },
    { value: "fist", label: "fist" },
    { value: "piece", label: "piece" }
  ],
  liquid: [
    { value: "ml", label: "milliliters (ml)" },
    { value: "l", label: "liters (l)" },
    { value: "cup", label: "cup" },
    { value: "tbsp", label: "tablespoon (tbsp)" },
    { value: "tsp", label: "teaspoon (tsp)" }
  ]
};

// All available serving units for multi-serving support
export const allServingUnits = [
  { value: "ml", label: "milliliters (ml)" },
  { value: "l", label: "liters (l)" },
  { value: "g", label: "grams (g)" },
  { value: "cup", label: "cup" },
  { value: "tbsp", label: "tablespoon (tbsp)" },
  { value: "tsp", label: "teaspoon (tsp)" },
  { value: "plate", label: "plate" },
  { value: "fist", label: "fist" },
  { value: "piece", label: "piece" }
];

// Conversion utility function
export function calculateNutritionForServing(
  food: Food,
  servingSize: number,
  servingUnit: string
): {
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
} {
  const baseAmount = food.foodType === "solid" ? 100 : 100; // 100g or 100ml
  
  // Convert serving to grams/ml equivalent
  let gramsOrMl = servingSize;
  
  // Standard conversions (approximate)
  const conversions: Record<string, number> = {
    // Liquid conversions (to ml)
    "l": 1000,
    "ml": 1,
    "cup": 240, // 1 cup ≈ 240ml
    "tbsp": 15, // 1 tablespoon ≈ 15ml
    "tsp": 5,   // 1 teaspoon ≈ 5ml
    
    // Solid conversions (to grams) - these are estimates
    "g": 1,
    "plate": 200,  // 1 plate ≈ 200g (user configurable)
    "fist": 80,    // 1 fist ≈ 80g
    "piece": 50    // 1 piece ≈ 50g (varies by food)
  };
  
  if (conversions[servingUnit]) {
    gramsOrMl = servingSize * conversions[servingUnit];
  }
  
  // Calculate ratio compared to base amount (100g/100ml)
  const ratio = gramsOrMl / baseAmount;
  
  // Apply ratio to all nutrition values
  return {
    calories: Math.round(food.nutritionPer100.calories * ratio),
    protein: food.nutritionPer100.protein ? Math.round((food.nutritionPer100.protein * ratio) * 10) / 10 : undefined,
    carbs: food.nutritionPer100.carbs ? Math.round((food.nutritionPer100.carbs * ratio) * 10) / 10 : undefined,
    fat: food.nutritionPer100.fat ? Math.round((food.nutritionPer100.fat * ratio) * 10) / 10 : undefined,
    fiber: food.nutritionPer100.fiber ? Math.round((food.nutritionPer100.fiber * ratio) * 10) / 10 : undefined,
    sugar: food.nutritionPer100.sugar ? Math.round((food.nutritionPer100.sugar * ratio) * 10) / 10 : undefined,
    sodium: food.nutritionPer100.sodium ? Math.round((food.nutritionPer100.sodium * ratio) * 10) / 10 : undefined
  };
}
