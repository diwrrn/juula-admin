import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertMealSchema, type InsertMeal, type Meal } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

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
  const [selectedCultures, setSelectedCultures] = useState<string[]>(meal?.cultural || []);
  const [tags, setTags] = useState<string[]>(meal?.tags || []);

  const form = useForm<InsertMeal>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: meal?.name || "",
      mealArabicName: meal?.mealArabicName || "",
      mealKurdishName: meal?.mealKurdishName || "",
      mealType: meal?.mealType || "breakfast",
      foods: meal?.foods || [],
      baseCalories: meal?.baseCalories || 0,
      baseProtein: meal?.baseProtein || 0,
      baseCarbs: meal?.baseCarbs || 0,
      baseFat: meal?.baseFat || 0,
      minScale: meal?.minScale || 0.5,
      maxScale: meal?.maxScale || 2.0,
      prepTime: meal?.prepTime || 0,
      difficulty: meal?.difficulty || "easy",
      cultural: meal?.cultural || [],
      tags: meal?.tags || [],
      isActive: meal?.isActive ?? true,
    },
  });

  const handleSubmit = (data: InsertMeal) => {
    onSubmit({
      ...data,
      cultural: selectedCultures,
      tags: tags,
    });
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const toggleCulture = (culture: string) => {
    setSelectedCultures(prev => 
      prev.includes(culture) 
        ? prev.filter(c => c !== culture)
        : [...prev, culture]
    );
  };

  const culturalOptions = ["arabic", "kurdish", "western", "mediterranean", "asian"];

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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mealType">Meal Type*</Label>
              <Select 
                value={form.watch("mealType")} 
                onValueChange={(value) => form.setValue("mealType", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
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
            <h3 className="font-semibold">Base Nutrition (per serving)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="baseCalories">Calories*</Label>
                <Input
                  id="baseCalories"
                  type="number"
                  {...form.register("baseCalories", { valueAsNumber: true })}
                  placeholder="e.g., 485"
                />
              </div>
              <div>
                <Label htmlFor="baseProtein">Protein (g)*</Label>
                <Input
                  id="baseProtein"
                  type="number"
                  step="0.1"
                  {...form.register("baseProtein", { valueAsNumber: true })}
                  placeholder="e.g., 32.5"
                />
              </div>
              <div>
                <Label htmlFor="baseCarbs">Carbs (g)*</Label>
                <Input
                  id="baseCarbs"
                  type="number"
                  step="0.1"
                  {...form.register("baseCarbs", { valueAsNumber: true })}
                  placeholder="e.g., 45.2"
                />
              </div>
              <div>
                <Label htmlFor="baseFat">Fat (g)*</Label>
                <Input
                  id="baseFat"
                  type="number"
                  step="0.1"
                  {...form.register("baseFat", { valueAsNumber: true })}
                  placeholder="e.g., 18.7"
                />
              </div>
            </div>
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