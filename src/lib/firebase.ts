// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAfITpxGzA5Me0xNxJKq-Xg3AqFJGYYboY",
  authDomain: "hndl-53cf3.firebaseapp.com",
  projectId: "hndl-53cf3",
  storageBucket: "hndl-53cf3.appspot.com",
  messagingSenderId: "150655327355",
  appId: "1:150655327355:web:cd88bde83d126e3e9dd6de",
};

// Only initialize if not already initialized (Next.js hot reload safe)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
