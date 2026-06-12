import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '@/firebase/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const buildUserData = async (firebaseUser) => {
    if (!firebaseUser) return null;

    const baseUserData = {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      full_name: firebaseUser.displayName || firebaseUser.email,
      photoURL: firebaseUser.photoURL || '',
      role: 'user',
      emailVerified: firebaseUser.emailVerified,
    };

    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return baseUserData;
    }

    return {
      ...baseUserData,
      ...userSnap.data(),
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      emailVerified: firebaseUser.emailVerified,
    };
  };

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

        const userData = await buildUserData(firebaseUser);

        setUser(userData);
        setIsAuthenticated(true);
        setAuthChecked(true);
      } catch (error) {
        console.error('Error en AuthContext:', error);

        setAuthError({
          type: 'unknown',
          message: error.message || 'Error al verificar autenticación',
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

  const checkUserAuth = async () => {
    try {
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        setUser(null);
        setIsAuthenticated(false);
        setAuthChecked(true);
        setIsLoadingAuth(false);
        return null;
      }

      setIsLoadingAuth(true);

      const userData = await buildUserData(firebaseUser);

      setUser(userData);
      setIsAuthenticated(true);
      setAuthChecked(true);

      return userData;
    } catch (error) {
      console.error('Error en checkUserAuth:', error);

      setUser(null);
      setIsAuthenticated(false);
      setAuthChecked(true);

      return null;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setAuthChecked(true);
      setIsLoadingAuth(false);

      window.location.replace('/');
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
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
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
