// Server-side Firebase Admin SDK
import {
  getApps,
  initializeApp,
  cert,
  applicationDefault,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Admin SDK once
if (!getApps().length) {
  initializeApp(
    process.env.FIREBASE_SERVICE_ACCOUNT
      ? { credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)) }
      : { credential: applicationDefault() }
  );
}

// Admin Firestore instance (no IndexedDB, full privileges)
export const adminDb = getFirestore();
