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
  availableUnits: z.array(z.enum(["ml", "l", "g", "cup", "tbsp", "tsp", "plate", "fist", "piece"])).optional(),
  // Nutrition facts per 100g (solid) or 100ml (liquid)
  nutritionPer100: z.object({
    calories: z.number().min(0, "Calories must be non-negative"),
    protein: z.number().min(0).optional(),
    carbs: z.number().min(0).optional(),
    fat: z.number().min(0).optional(),
    fiber: z.number().min(0).optional(),
    sugar: z.number().min(0).optional(),
    sodium: z.number().min(0).optional(),
    calcium: z.number().min(0).optional(),
    potassium: z.number().min(0).optional(),
    vitaminB12: z.number().min(0).optional(),
    vitaminA: z.number().min(0).optional(),
    vitaminE: z.number().min(0).optional(),
    vitaminD: z.number().min(0).optional()
  }),
  // Custom conversion overrides for variable serving sizes
  customConversions: z.object({
    cup: z.number().positive().optional(), // grams/ml per cup
    plate: z.number().positive().optional(), // grams/ml per plate
    fist: z.number().positive().optional(), // grams/ml per fist
    piece: z.number().positive().optional(), // grams/ml per piece
    tbsp: z.number().positive().optional(), // grams/ml per tablespoon
    tsp: z.number().positive().optional() // grams/ml per teaspoon
  }).optional(),
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

// Food-specific conversion tables for better accuracy
export const foodSpecificConversions: Record<string, { cup: number | null, plate: number | null, piece: number | null }> = {
  // Grains & Cereals
  "rice": { cup: 185, plate: 200, piece: null },
  "pasta": { cup: 220, plate: 180, piece: null },
  "oatmeal": { cup: 240, plate: 200, piece: null },
  "quinoa": { cup: 170, plate: 150, piece: null },
  "bread": { cup: null, plate: null, piece: 25 },
  
  // Fruits
  "apple": { cup: 125, plate: null, piece: 180 },
  "banana": { cup: 150, plate: null, piece: 120 },
  "orange": { cup: 180, plate: null, piece: 150 },
  "grapes": { cup: 150, plate: 200, piece: 5 },
  "strawberry": { cup: 150, plate: 200, piece: 15 },
  "blueberry": { cup: 150, plate: 200, piece: 1 },
  
  // Vegetables
  "broccoli": { cup: 90, plate: 150, piece: 25 },
  "potato": { cup: 150, plate: 200, piece: 200 },
  "carrot": { cup: 130, plate: 150, piece: 60 },
  "tomato": { cup: 180, plate: 200, piece: 120 },
  "onion": { cup: 160, plate: 180, piece: 100 },
  "cucumber": { cup: 120, plate: 150, piece: 300 },
  
  // Proteins
  "chicken": { cup: null, plate: 200, piece: 150 },
  "beef": { cup: null, plate: 200, piece: 100 },
  "fish": { cup: null, plate: 180, piece: 120 },
  "egg": { cup: null, plate: null, piece: 50 },
  "tofu": { cup: 250, plate: 200, piece: 85 },
  
  // Dairy
  "cheese": { cup: 115, plate: null, piece: 30 },
  "yogurt": { cup: 245, plate: null, piece: null },
  
  // Nuts & Seeds
  "almond": { cup: 140, plate: null, piece: 1 },
  "walnut": { cup: 120, plate: null, piece: 3 },
  "peanut": { cup: 150, plate: null, piece: 1 }
};

// Size variants for highly variable items
export const sizeVariants = {
  "apple": {
    "piece_small": 120,
    "piece_medium": 180,
    "piece_large": 240
  },
  "potato": {
    "piece_small": 150,
    "piece_medium": 200,
    "piece_large": 300
  },
  "banana": {
    "piece_small": 90,
    "piece_medium": 120,
    "piece_large": 150
  },
  "egg": {
    "piece_small": 40,
    "piece_medium": 50,
    "piece_large": 60
  }
};

// Helper function to detect food type from name
function detectFoodType(foodName: string): string | null {
  const name = foodName.toLowerCase();
  for (const [key] of Object.entries(foodSpecificConversions)) {
    if (name.includes(key)) {
      return key;
    }
  }
  return null;
}

// Conversion utility function with food-specific accuracy
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
  
  // Default conversions (fallback)
  const defaultConversions: Record<string, number> = {
    // Liquid conversions (to ml)
    "l": 1000,
    "ml": 1,
    "cup": food.foodType === "liquid" ? 240 : 200, // 240ml for liquids, 200g for solids
    "tbsp": food.foodType === "liquid" ? 15 : 12,  // 15ml for liquids, 12g for solids
    "tsp": food.foodType === "liquid" ? 5 : 4,     // 5ml for liquids, 4g for solids
    
    // Solid conversions (to grams)
    "g": 1,
    "plate": 200,  // default plate size
    "fist": 80,    // default fist size
    "piece": 50    // default piece size
  };
  
  // Get food-specific conversions
  const foodType = detectFoodType(food.name);
  const foodSpecific = foodType ? (foodSpecificConversions[foodType] || {}) : {};
  
  // Priority: custom conversions > food-specific > defaults
  const conversions = {
    ...defaultConversions,
    ...foodSpecific,
    ...(food.customConversions || {})
  };
  
  // Apply conversion if available
  const conversionValue = conversions[servingUnit as keyof typeof conversions];
  if (conversionValue !== undefined && conversionValue !== null) {
    gramsOrMl = servingSize * conversionValue;
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

// Helper function to get suggested conversion values for a food
export function getSuggestedConversions(foodName: string, foodType: "solid" | "liquid") {
  const detectedType = detectFoodType(foodName);
  if (detectedType && foodSpecificConversions[detectedType]) {
    return foodSpecificConversions[detectedType];
  }
  
  // Return null for no suggestions (will use defaults)
  return null;
}
