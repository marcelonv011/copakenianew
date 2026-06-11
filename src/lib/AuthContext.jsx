import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/firebase/config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setIsLoadingAuth(true);
        setAuthError(null);

        if (!firebaseUser) {
          setUser(null);
          setIsAuthenticated(false);
          setAuthChecked(true);
          return;
        }

        let userData = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          full_name: firebaseUser.displayName || firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          role: "user",
          emailVerified: firebaseUser.emailVerified,
        };

        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          userData = {
            ...userData,
            ...userSnap.data(),
          };
        }

        setUser(userData);
        setIsAuthenticated(true);
        setAuthChecked(true);
      } catch (error) {
        console.error("Error en AuthContext:", error);
        setAuthError({
          type: "unknown",
          message: error.message || "Error al verificar autenticación",
        });
        setUser(null);
        setIsAuthenticated(false);
        setAuthChecked(true);
      } finally {
        setIsLoadingAuth(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => {
    window.location.href = "/login";
  };

  const checkUserAuth = async () => {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }

    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    const userData = {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      full_name: firebaseUser.displayName || firebaseUser.email,
      photoURL: firebaseUser.photoURL,
      role: "user",
      emailVerified: firebaseUser.emailVerified,
      ...(userSnap.exists() ? userSnap.data() : {}),
    };

    setUser(userData);
    setIsAuthenticated(true);

    return userData;
  };

  const checkAppState = async () => {
    return checkUserAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings: false,
        authError,
        appPublicSettings: null,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};