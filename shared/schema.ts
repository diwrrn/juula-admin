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
  servingSize: z.number().positive().optional(),
  servingUnit: z.enum(["ml", "l", "g", "cup", "tbsp", "tsp", "plate", "fist", "piece"]).optional(),
  calories: z.number().min(0, "Calories must be non-negative"),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  fiber: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
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
