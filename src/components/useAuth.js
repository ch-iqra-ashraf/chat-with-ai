import { useState, useEffect } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // watch login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    if (isSigningIn) return; // prevent a second call while one is pending
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code !== "auth/cancelled-popup-request") {
        console.error("Sign in failed:", err);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return { currentUser, isSigningIn, handleSignIn, handleSignOut };
}
