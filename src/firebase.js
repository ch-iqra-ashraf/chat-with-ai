
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";


export const googleProvider = new GoogleAuthProvider();

const firebaseConfig = {
  apiKey: "AIzaSyB9odIwoEjjuo7hB8kmaVhpdmSBWEOxakw",
  authDomain: "chatwithai-3e3ab.firebaseapp.com",
  projectId: "chatwithai-3e3ab",
  storageBucket: "chatwithai-3e3ab.firebasestorage.app",
  messagingSenderId: "797513959086",
  appId: "1:797513959086:web:e0f06b8b73b2ff31414f3f",
  measurementId: "G-7RJZ8JL2VY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);