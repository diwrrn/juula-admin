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
import { categoryConfig, servingUnitsConfig, getSuggestedConversions } from "@shared/schema";
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
  const form = useForm<InsertFood>({
    resolver: zodResolver(insertFoodSchema),
    defaultValues: {
      name: food?.name || "",
      kurdishName: food?.kurdishName || "",
      arabicName: food?.arabicName || "",
      brand: food?.brand || "",
      category: food?.category || "fruits",
      foodType: food?.foodType || "solid",
      servings: food?.servings || [{ size: 100, unit: "g" }],
      nutritionPer100: food?.nutritionPer100 || {
        calories: (food as any)?.calories || 0,
        protein: (food as any)?.protein || 0,
        carbs: (food as any)?.carbs || 0,
        fat: (food as any)?.fat || 0,
        fiber: (food as any)?.fiber || 0,
        sugar: (food as any)?.sugar || 0,
        sodium: (food as any)?.sodium || 0,
        calcium: (food as any)?.calcium || 0,
        potassium: (food as any)?.potassium || 0,
        vitaminB12: (food as any)?.vitaminB12 || 0,
        vitaminA: (food as any)?.vitaminA || 0,
        vitaminE: (food as any)?.vitaminE || 0,
        vitaminD: (food as any)?.vitaminD || 0
      },
      customConversions: food?.customConversions || {},

      barcode: food?.barcode || "",
      vegetarian: food?.vegetarian || false,
      vegan: food?.vegan || false,
      glutenFree: food?.glutenFree || false,
      dairyFree: food?.dairyFree || false,
    },
  });

  const foodType = form.watch("foodType");
  const servings = form.watch("servings") || [];

  const handleSubmit = (data: InsertFood) => {
    onSubmit(data);
  };

  const availableUnits = foodType === "solid" 
    ? servingUnitsConfig.solid 
    : servingUnitsConfig.liquid;

  const addServing = () => {
    const currentServings = form.getValues("servings") || [];
    const defaultUnit = foodType === "solid" ? "g" : "ml";
    form.setValue("servings", [...currentServings, { size: 1, unit: defaultUnit }]);
  };

  const removeServing = (index: number) => {
    const currentServings = form.getValues("servings") || [];
    if (currentServings.length > 1) {
      form.setValue("servings", currentServings.filter((_, i) => i !== index));
    }
  };

  const updateServing = (index: number, field: "size" | "unit" | "description", value: any) => {
    const currentServings = form.getValues("servings") || [];
    const updatedServings = [...currentServings];
    updatedServings[index] = { ...updatedServings[index], [field]: value };
    form.setValue("servings", updatedServings);
  };

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

                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890123" {...field} />
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

            {/* Serving Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Serving Options</h4>
                <Button type="button" variant="outline" size="sm" onClick={addServing}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Serving
                </Button>
              </div>
              
              <div className="space-y-3">
                {servings.map((serving, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <div>
                        <Label>Size</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={serving.size}
                          onChange={(e) => updateServing(index, "size", Number(e.target.value))}
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Select 
                          value={serving.unit} 
                          onValueChange={(value) => updateServing(index, "unit", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableUnits.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input
                          value={serving.description || ""}
                          onChange={(e) => updateServing(index, "description", e.target.value)}
                          placeholder="cooked"
                        />
                      </div>
                    </div>
                    {servings.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeServing(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
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
                          <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="Auto"
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
                    name="customConversions.plate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>1 plate = ? {foodType === "solid" ? "grams" : "ml"}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="Auto"
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
                    name="customConversions.piece"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>1 piece = ? {foodType === "solid" ? "grams" : "ml"}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="Auto"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
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
                    name="customConversions.tbsp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>1 tbsp = ? {foodType === "solid" ? "grams" : "ml"}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="Auto"
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