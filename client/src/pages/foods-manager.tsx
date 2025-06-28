import { useState, useMemo } from "react";
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
  where,
  onSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Food, InsertFood, categoryConfig } from "@shared/schema";
import { FoodsTable } from "@/components/foods-table";
import { FoodFormModal } from "@/components/food-form-modal";
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";
import { BulkActionsBar } from "@/components/bulk-actions-bar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Utensils, Plus, Search, Filter, Download, CheckCircle } from "lucide-react";
import { useEffect } from "react";

export default function FoodsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [deletingFood, setDeletingFood] = useState<Food | null>(null);
  const [selectedFoods, setSelectedFoods] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<keyof Food>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Fetch foods from Firestore
  const { data: foods = [], isLoading, error } = useQuery({
    queryKey: ["/api/foods"],
    queryFn: async () => {
      const foodsCollection = collection(db, "foods");
      const q = firestoreQuery(foodsCollection, orderBy("name"));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Food[];
    },
  });

  // Set up real-time listener
  useEffect(() => {
    const foodsCollection = collection(db, "foods");
    const q = firestoreQuery(foodsCollection, orderBy("name"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedFoods = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Food[];
      
      queryClient.setQueryData(["/api/foods"], updatedFoods);
    });

    return () => unsubscribe();
  }, [queryClient]);

  // Add food mutation
  const addFoodMutation = useMutation({
    mutationFn: async (newFood: InsertFood) => {
      const foodsCollection = collection(db, "foods");
      const now = new Date();
      await addDoc(foodsCollection, {
        ...newFood,
        createdAt: now,
        updatedAt: now,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Food item added successfully",
      });
      setIsAddModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/foods"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add food item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update food mutation
  const updateFoodMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertFood> }) => {
      const foodDoc = doc(db, "foods", id);
      await updateDoc(foodDoc, {
        ...data,
        updatedAt: new Date(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Food item updated successfully",
      });
      setEditingFood(null);
      queryClient.invalidateQueries({ queryKey: ["/api/foods"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update food item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete food mutation
  const deleteFoodMutation = useMutation({
    mutationFn: async (id: string) => {
      const foodDoc = doc(db, "foods", id);
      await deleteDoc(foodDoc);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Food item deleted successfully",
      });
      setDeletingFood(null);
      queryClient.invalidateQueries({ queryKey: ["/api/foods"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete food item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map(id => deleteDoc(doc(db, "foods", id)))
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `${selectedFoods.size} food items deleted successfully`,
      });
      setSelectedFoods(new Set());
      queryClient.invalidateQueries({ queryKey: ["/api/foods"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete food items: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter and sort foods
  const filteredAndSortedFoods = useMemo(() => {
    let filtered = foods.filter(food => {
      const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.kurdishName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.arabicName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false;
      
      const matchesCategory = categoryFilter === "all" || food.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      const aValue = a[sortBy] || "";
      const bValue = b[sortBy] || "";
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [foods, searchTerm, categoryFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedFoods.length / pageSize);
  const paginatedFoods = filteredAndSortedFoods.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: keyof Food) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleExport = () => {
    const dataToExport = selectedFoods.size > 0 
      ? foods.filter(food => selectedFoods.has(food.id))
      : filteredAndSortedFoods;
    
    const csv = [
      "Name (English),Kurdish Name,Arabic Name,Brand,Category,Food Type,Servings,Calories,Protein,Carbs,Fat,Fiber,Sugar,Sodium",
      ...dataToExport.map(food => {
        const servingsText = food.servings?.map(s => `${s.size}${s.unit}${s.description ? ` (${s.description})` : ''}`).join('; ') || '';
        const nutrition = food.nutritionPer100 || {
          calories: (food as any).calories || 0,
          protein: (food as any).protein || 0,
          carbs: (food as any).carbs || 0,
          fat: (food as any).fat || 0,
          fiber: (food as any).fiber || 0,
          sugar: (food as any).sugar || 0,
          sodium: (food as any).sodium || 0
        };
        return `"${food.name}","${food.kurdishName || ""}","${food.arabicName || ""}","${food.brand || ""}","${food.category}","${food.foodType}","${servingsText}",${nutrition.calories},${nutrition.protein || 0},${nutrition.carbs || 0},${nutrition.fat || 0},${nutrition.fiber || 0},${nutrition.sugar || 0},${nutrition.sodium || 0}`;
      })
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "foods-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">Failed to connect to Firebase</div>
          <div className="text-gray-600">{error.message}</div>
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
            <Utensils className="text-primary text-2xl" />
            <h1 className="text-xl font-medium text-gray-900">Foods Database Manager</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Connected to Firebase</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-medium">A</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Admin User</span>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20 flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 flex-shrink-0">
          <nav className="p-4 space-y-2">
            <div className="flex items-center space-x-3 px-3 py-2 bg-blue-50 text-primary rounded-lg font-medium">
              <span className="w-5">📊</span>
              <span>Foods Database</span>
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200 mt-auto">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-900">
                {filteredAndSortedFoods.length} Food Items
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Synced</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-medium text-gray-900">Foods Database</h2>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      <CheckCircle className="h-3 w-3 inline mr-1" />
                      Synced
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Add a sample rice item to demonstrate multiple servings
                      addFoodMutation.mutate({
                        name: "White Rice",
                        kurdishName: "برنج سپی",
                        arabicName: "أرز أبيض",
                        brand: "Demo",
                        category: "grains",
                        foodType: "solid",
                        availableUnits: ["cup", "g", "plate"],
                        nutritionPer100: {
                          calories: 205,
                          protein: 4.3,
                          carbs: 45,
                          fat: 0.4,
                          fiber: 0.6,
                        },

                      });
                    }}
                    disabled={addFoodMutation.isPending}
                  >
                    {addFoodMutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    Add Sample Rice
                  </Button>
                  <Button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Food
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="mt-4 flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search foods by name (English, Kurdish, Arabic), brand, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(categoryConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <LoadingSpinner size="lg" className="mx-auto mb-4" />
                  <div className="text-gray-600 font-medium">Loading foods from Firebase...</div>
                </div>
              </div>
            ) : (
              <>
                {/* Foods Table */}
                <FoodsTable
                  foods={paginatedFoods}
                  selectedFoods={selectedFoods}
                  onSelectionChange={setSelectedFoods}
                  onEdit={setEditingFood}
                  onDelete={setDeletingFood}
                  onSort={handleSort}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />

                {/* Pagination */}
                <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">
                      Showing <span className="font-medium">{Math.min((currentPage - 1) * pageSize + 1, filteredAndSortedFoods.length)}</span> to{" "}
                      <span className="font-medium">{Math.min(currentPage * pageSize, filteredAndSortedFoods.length)}</span> of{" "}
                      <span className="font-medium">{filteredAndSortedFoods.length}</span> results
                    </span>
                    <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="25">25 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                        <SelectItem value="100">100 per page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <FoodFormModal
        isOpen={isAddModalOpen || !!editingFood}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingFood(null);
        }}
        food={editingFood}
        onSubmit={(data) => {
          if (editingFood) {
            updateFoodMutation.mutate({ id: editingFood.id, data });
          } else {
            addFoodMutation.mutate(data);
          }
        }}
        isLoading={addFoodMutation.isPending || updateFoodMutation.isPending}
      />

      <DeleteConfirmationModal
        isOpen={!!deletingFood}
        onClose={() => setDeletingFood(null)}
        foodName={deletingFood?.name || ""}
        onConfirm={() => {
          if (deletingFood) {
            deleteFoodMutation.mutate(deletingFood.id);
          }
        }}
        isLoading={deleteFoodMutation.isPending}
      />

      <BulkActionsBar
        selectedCount={selectedFoods.size}
        onClearSelection={() => setSelectedFoods(new Set())}
        onBulkDelete={() => bulkDeleteMutation.mutate(Array.from(selectedFoods))}
        onBulkExport={handleExport}
        isVisible={selectedFoods.size > 0}
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  );
}
