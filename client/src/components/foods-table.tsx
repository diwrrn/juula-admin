import { Food, categoryConfig } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Copy, Trash2, ChevronUp, ChevronDown } from "lucide-react";

interface FoodsTableProps {
  foods: Food[];
  selectedFoods: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onEdit: (food: Food) => void;
  onDelete: (food: Food) => void;
  onSort: (field: keyof Food) => void;
  sortBy: keyof Food;
  sortOrder: "asc" | "desc";
}

export function FoodsTable({
  foods,
  selectedFoods,
  onSelectionChange,
  onEdit,
  onDelete,
  onSort,
  sortBy,
  sortOrder,
}: FoodsTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(new Set(foods.map(food => food.id)));
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectFood = (foodId: string, checked: boolean) => {
    const newSelected = new Set(selectedFoods);
    if (checked) {
      newSelected.add(foodId);
    } else {
      newSelected.delete(foodId);
    }
    onSelectionChange(newSelected);
  };

  const handleDuplicate = (food: Food) => {
    // Create a copy of the food without the id
    const { id, createdAt, updatedAt, ...foodData } = food;
    onEdit({
      ...foodData,
      name: `${food.name} (Copy)`,
      id: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Food);
  };

  const SortButton = ({ field, children }: { field: keyof Food; children: React.ReactNode }) => (
    <button
      onClick={() => onSort(field)}
      className="flex items-center space-x-1 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
    >
      <span>{children}</span>
      {sortBy === field && (
        sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
      )}
    </button>
  );

  return (
    <div className="flex-1 overflow-auto bg-white">
      <table className="w-full">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-6 py-3 text-left">
              <Checkbox
                checked={foods.length > 0 && selectedFoods.size === foods.length}
                onCheckedChange={handleSelectAll}
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="name">Food Name</SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="category">Category</SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Servings
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="calories">Calories</SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nutrition
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="updatedAt">Last Modified</SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {foods.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                No food items found. Add your first food item to get started.
              </td>
            </tr>
          ) : (
            foods.map((food) => (
              <tr key={food.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Checkbox
                    checked={selectedFoods.has(food.id)}
                    onCheckedChange={(checked) => handleSelectFood(food.id, checked as boolean)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                      <span className="text-xl">🍎</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{food.name}</div>
                      {food.kurdishName && (
                        <div className="text-sm text-gray-600 font-medium">{food.kurdishName}</div>
                      )}
                      {food.arabicName && (
                        <div className="text-sm text-gray-600 font-medium">{food.arabicName}</div>
                      )}
                      {food.brand && (
                        <div className="text-sm text-gray-500">{food.brand}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${categoryConfig[food.category]?.color || "bg-gray-100 text-gray-800"}`}>
                    {categoryConfig[food.category]?.label || food.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="space-y-1">
                    {food.servings && food.servings.length > 0 ? (
                      food.servings.map((serving, index) => (
                        <div key={index} className="text-xs">
                          {serving.size}{serving.unit}
                          {serving.description && <span className="text-gray-400 ml-1">({serving.description})</span>}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-400">No servings defined</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {food.calories} kcal
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="space-y-1">
                    <div>Protein: <span className="font-medium">{food.protein || 0}g</span></div>
                    <div>Carbs: <span className="font-medium">{food.carbs || 0}g</span></div>
                    <div>Fat: <span className="font-medium">{food.fat || 0}g</span></div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {food.updatedAt.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(food)}
                      className="text-primary hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(food)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(food)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
