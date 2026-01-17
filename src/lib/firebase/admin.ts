import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const adminApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").includes("\\n")
            ? process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
            : process.env.FIREBASE_PRIVATE_KEY,
        }),
      })
    : getApps()[0];

export const adminAuth = getAuth(adminApp);
