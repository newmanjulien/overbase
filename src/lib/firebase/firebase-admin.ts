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
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  try {
    initializeApp(
      process.env.FIREBASE_SERVICE_ACCOUNT
        ? { credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)) }
        : {
            credential: applicationDefault(),
            projectId: projectId,
          }
    );
  } catch (error) {
    console.warn(
      "Firebase Admin SDK initialization failed. Server-side updates will be skipped.",
      error instanceof Error ? error.message : error
    );
  }
}

// Admin Firestore instance (no IndexedDB, full privileges)
export const adminDb = getFirestore();
