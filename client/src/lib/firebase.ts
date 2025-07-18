import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import type { WorkoutCategory, WorkoutSubcategory, Exercise, InsertWorkoutCategory, InsertWorkoutSubcategory, InsertExercise } from '@shared/schema';

const firebaseConfig = {
  apiKey: "AIzaSyB_liZT4SR7h47J9XBJYPiaYCrGNLinhuA",
  authDomain: "calorie-316d8.firebaseapp.com",
  projectId: "calorie-316d8",
  storageBucket: "calorie-316d8.firebasestorage.app",
  messagingSenderId: "817302259483",
  appId: "1:817302259483:web:454240a8702611bb84f5be",
  measurementId: "G-ZRP9DS8EQS"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Connect to Firestore emulator in development (disabled for production use)
// if (import.meta.env.DEV) {
//   try {
//     connectFirestoreEmulator(db, 'localhost', 8080);
//     console.log('Connected to Firestore emulator');
//   } catch (error) {
//     console.log('Firestore emulator connection failed:', error);
//   }
// }

// Initialize Analytics (only in production)
let analytics;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  analytics = getAnalytics(app);
}

export { analytics };

// Sample data initialization function
export const initializeSampleWorkoutData = async () => {
  try {
    // Create sample categories
    const chestCategory = await createWorkoutCategory({
      name: "Chest",
      nameKurdish: "سینه",
      nameArabic: "الصدر",
      iconUrl: "",
      order: 1
    });

    const backCategory = await createWorkoutCategory({
      name: "Back",
      nameKurdish: "پشت",
      nameArabic: "الظهر",
      iconUrl: "",
      order: 2
    });

    // Create sample subcategories
    const upperChestSubcategory = await createWorkoutSubcategory(chestCategory, {
      categoryId: chestCategory,
      name: "Upper Chest",
      nameKurdish: "سینه سەروو",
      nameArabic: "الصدر العلوي",
      iconUrl: "",
      order: 1
    });

    const lowerChestSubcategory = await createWorkoutSubcategory(chestCategory, {
      categoryId: chestCategory,
      name: "Lower Chest",
      nameKurdish: "سینه خواروو",
      nameArabic: "الصدر السفلي",
      iconUrl: "",
      order: 2
    });

    // Create sample exercises
    await createExercise(chestCategory, upperChestSubcategory, {
      categoryId: chestCategory,
      subcategoryId: upperChestSubcategory,
      name: "Incline Bench Press",
      nameKurdish: "پەنج کردنی سینه سەروو",
      nameArabic: "ضغط الصدر المائل",
      description: "An upper chest exercise using an inclined bench",
      videoUrl: "",
      thumbnailUrl: "",
      muscleGroups: ["chest", "triceps", "shoulders"],
      bodyTarget: "Upper body",
      difficulty: "intermediate",
      equipment: "barbell",
      order: 1
    });

    await createExercise(chestCategory, lowerChestSubcategory, {
      categoryId: chestCategory,
      subcategoryId: lowerChestSubcategory,
      name: "Decline Bench Press",
      nameKurdish: "پەنج کردنی سینه خواروو",
      nameArabic: "ضغط الصدر المنحدر",
      description: "A lower chest exercise using a declined bench",
      videoUrl: "",
      thumbnailUrl: "",
      muscleGroups: ["chest", "triceps"],
      bodyTarget: "Upper body",
      difficulty: "intermediate",
      equipment: "barbell",
      order: 1
    });

    console.log("Sample workout data initialized successfully");
  } catch (error) {
    console.error("Error initializing sample data:", error);
  }
};

// Workout Categories
export const getWorkoutCategories = async (): Promise<WorkoutCategory[]> => {
  try {
    const querySnapshot = await getDocs(query(collection(db, 'workoutCategories'), orderBy('order')));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as WorkoutCategory[];
  } catch (error) {
    console.error('Error fetching workout categories:', error);
    throw error;
  }
};

export const createWorkoutCategory = async (category: InsertWorkoutCategory): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'workoutCategories'), category);
    return docRef.id;
  } catch (error) {
    console.error('Error creating workout category:', error);
    throw error;
  }
};

export const updateWorkoutCategory = async (id: string, category: Partial<WorkoutCategory>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'workoutCategories', id), category);
  } catch (error) {
    console.error('Error updating workout category:', error);
    throw error;
  }
};

export const deleteWorkoutCategory = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'workoutCategories', id));
  } catch (error) {
    console.error('Error deleting workout category:', error);
    throw error;
  }
};

// Workout Subcategories
export const getWorkoutSubcategories = async (categoryId: string): Promise<WorkoutSubcategory[]> => {
  try {
    const querySnapshot = await getDocs(query(collection(db, 'workoutCategories', categoryId, 'subcategories'), orderBy('order')));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as WorkoutSubcategory[];
  } catch (error) {
    console.error('Error fetching workout subcategories:', error);
    throw error;
  }
};

export const createWorkoutSubcategory = async (categoryId: string, subcategory: InsertWorkoutSubcategory): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'workoutCategories', categoryId, 'subcategories'), subcategory);
    return docRef.id;
  } catch (error) {
    console.error('Error creating workout subcategory:', error);
    throw error;
  }
};

export const updateWorkoutSubcategory = async (categoryId: string, id: string, subcategory: Partial<WorkoutSubcategory>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'workoutCategories', categoryId, 'subcategories', id), subcategory);
  } catch (error) {
    console.error('Error updating workout subcategory:', error);
    throw error;
  }
};

export const deleteWorkoutSubcategory = async (categoryId: string, id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'workoutCategories', categoryId, 'subcategories', id));
  } catch (error) {
    console.error('Error deleting workout subcategory:', error);
    throw error;
  }
};

// Exercises
export const getExercises = async (categoryId: string, subcategoryId?: string): Promise<Exercise[]> => {
  try {
    const exercisesRef = subcategoryId ? 
      collection(db, 'workoutCategories', categoryId, 'subcategories', subcategoryId, 'exercises') :
      collection(db, 'workoutCategories', categoryId, 'exercises');
    
    const querySnapshot = await getDocs(query(exercisesRef, orderBy('order')));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Exercise[];
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }
};

export const createExercise = async (categoryId: string, subcategoryId: string | undefined, exercise: InsertExercise): Promise<string> => {
  try {
    const exercisesRef = subcategoryId ? 
      collection(db, 'workoutCategories', categoryId, 'subcategories', subcategoryId, 'exercises') :
      collection(db, 'workoutCategories', categoryId, 'exercises');
    
    const docRef = await addDoc(exercisesRef, exercise);
    return docRef.id;
  } catch (error) {
    console.error('Error creating exercise:', error);
    throw error;
  }
};

export const updateExercise = async (categoryId: string, subcategoryId: string | undefined, id: string, exercise: Partial<Exercise>): Promise<void> => {
  try {
    const exerciseRef = subcategoryId ? 
      doc(db, 'workoutCategories', categoryId, 'subcategories', subcategoryId, 'exercises', id) :
      doc(db, 'workoutCategories', categoryId, 'exercises', id);
    
    await updateDoc(exerciseRef, exercise);
  } catch (error) {
    console.error('Error updating exercise:', error);
    throw error;
  }
};

export const deleteExercise = async (categoryId: string, subcategoryId: string | undefined, id: string): Promise<void> => {
  try {
    const exerciseRef = subcategoryId ? 
      doc(db, 'workoutCategories', categoryId, 'subcategories', subcategoryId, 'exercises', id) :
      doc(db, 'workoutCategories', categoryId, 'exercises', id);
    
    await deleteDoc(exerciseRef);
  } catch (error) {
    console.error('Error deleting exercise:', error);
    throw error;
  }
};
