import { users, type User, type InsertUser, type Food, type InsertFood, type Meal, type InsertMeal } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Food operations
  getFoods(): Promise<Food[]>;
  getFood(id: string): Promise<Food | undefined>;
  createFood(food: InsertFood): Promise<Food>;
  updateFood(id: string, food: Partial<InsertFood>): Promise<Food>;
  deleteFood(id: string): Promise<void>;
  
  // Meal operations
  getMeals(): Promise<Meal[]>;
  getMeal(id: string): Promise<Meal | undefined>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  updateMeal(id: string, meal: Partial<InsertMeal>): Promise<Meal>;
  deleteMeal(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private foods: Map<string, Food>;
  private meals: Map<string, Meal>;
  currentId: number;
  currentFoodId: number;
  currentMealId: number;

  constructor() {
    this.users = new Map();
    this.foods = new Map();
    this.meals = new Map();
    this.currentId = 1;
    this.currentFoodId = 1;
    this.currentMealId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Food operations
  async getFoods(): Promise<Food[]> {
    return Array.from(this.foods.values());
  }

  async getFood(id: string): Promise<Food | undefined> {
    return this.foods.get(id);
  }

  async createFood(insertFood: InsertFood): Promise<Food> {
    const id = `food_${this.currentFoodId++}`;
    const now = new Date();
    const food: Food = {
      ...insertFood,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.foods.set(id, food);
    return food;
  }

  async updateFood(id: string, updateFood: Partial<InsertFood>): Promise<Food> {
    const existingFood = this.foods.get(id);
    if (!existingFood) {
      throw new Error(`Food with id ${id} not found`);
    }
    
    const updatedFood: Food = {
      ...existingFood,
      ...updateFood,
      updatedAt: new Date(),
    };
    this.foods.set(id, updatedFood);
    return updatedFood;
  }

  async deleteFood(id: string): Promise<void> {
    this.foods.delete(id);
  }

  // Meal operations
  async getMeals(): Promise<Meal[]> {
    return Array.from(this.meals.values());
  }

  async getMeal(id: string): Promise<Meal | undefined> {
    return this.meals.get(id);
  }

  async createMeal(insertMeal: InsertMeal): Promise<Meal> {
    const id = `meal_${this.currentMealId++}`;
    const now = new Date();
    const meal: Meal = {
      ...insertMeal,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.meals.set(id, meal);
    return meal;
  }

  async updateMeal(id: string, updateMeal: Partial<InsertMeal>): Promise<Meal> {
    const existingMeal = this.meals.get(id);
    if (!existingMeal) {
      throw new Error(`Meal with id ${id} not found`);
    }
    
    const updatedMeal: Meal = {
      ...existingMeal,
      ...updateMeal,
      updatedAt: new Date(),
    };
    this.meals.set(id, updatedMeal);
    return updatedMeal;
  }

  async deleteMeal(id: string): Promise<void> {
    this.meals.delete(id);
  }
}

export const storage = new MemStorage();
