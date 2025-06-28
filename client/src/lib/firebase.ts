import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

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

// Initialize Analytics (only in production)
let analytics;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  analytics = getAnalytics(app);
}

export { analytics };
