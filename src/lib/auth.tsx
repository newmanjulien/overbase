"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  User,
} from "firebase/auth";
import { app } from "./firebase"; // 👈 import your initialized app

type AuthState = { user: User | null; loading: boolean };
const AuthCtx = createContext<AuthState>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    const auth = getAuth(app);
    console.log("Setting up Firebase Auth...");

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        console.log("Auth state changed → signed in:", u.uid);
        setState({ user: u, loading: false });
      } else {
        console.log("Auth state changed → no user, signing in anonymously...");
        try {
          const cred = await signInAnonymously(auth);
          console.log("Anonymous sign-in success:", cred.user.uid);
          setState({ user: cred.user, loading: false });
        } catch (err) {
          console.error("Anonymous sign-in failed:", err);
          setState({ user: null, loading: false });
        }
      }
    });

    return () => unsub();
  }, []);

  if (state.loading) {
    return <div>Loading user...</div>;
  }

  return <AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
