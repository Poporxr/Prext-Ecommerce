// lib/firebaseAdmin.ts
// Server-side Firebase Admin initialization for Firestore.

import { getApps, getApp, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Expect these env vars to be set from your Firebase service account.
// NEVER hard-code secrets in your repo.
const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
} = process.env;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  throw new Error("Missing Firebase Admin environment variables.");
}

const adminApp =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        credential: cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          // Replace escaped newlines in env var
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });

export const adminDB = getFirestore(adminApp);
