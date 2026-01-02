// src/lib/auth/verifyToken.ts
// Shared utility for verifying Firebase ID tokens in API routes.
// Extracts userId from verified token - never trusts client-provided userId.

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getApps, getApp } from "firebase-admin/app";

// Initialize Firebase Admin Auth
// Reuses the same Firebase Admin app initialized in firebaseAdmins.ts
let adminAuth: ReturnType<typeof getAuth>;

function getAdminAuth() {
  if (adminAuth) {
    return adminAuth;
  }

  // Get the existing Firebase Admin app (initialized in firebaseAdmins.ts)
  // This ensures we reuse the same app instance
  const adminApp = getApps().length > 0 ? getApp() : null;
  
  if (!adminApp) {
    throw new Error(
      "Firebase Admin app not initialized. Ensure firebaseAdmins.ts is imported first in your route."
    );
  }

  adminAuth = getAuth(adminApp);
  return adminAuth;
}

// Standard API error response format
export interface ApiError {
  success: false;
  error: string;
  details?: string;
}

// Result type for verified token
export interface VerifiedToken {
  userId: string;
  email?: string;
}

/**
 * Extracts and verifies Firebase ID token from Authorization header.
 * 
 * @param request - Next.js request object
 * @returns Verified token with userId, or null if token is missing/invalid
 * @throws Never throws - returns null for invalid tokens to allow graceful handling
 */
export async function verifyFirebaseToken(
  request: NextRequest
): Promise<VerifiedToken | null> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader) {
      return null;
    }

    // Support both "Bearer <token>" and just "<token>"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    if (!token || token.trim().length === 0) {
      return null;
    }

    // Verify token with Firebase Admin
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);

    // Extract userId from verified token (never trust client-provided userId)
    return {
      userId: decodedToken.uid,
      email: decodedToken.email,
    };
  } catch (error) {
    // Token verification failed (expired, invalid, etc.)
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Helper to create a consistent authentication error response.
 */
export function createAuthErrorResponse(
  message: string = "Authentication required",
  status: number = 401
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

/**
 * Higher-order function to protect API route handlers.
 * Verifies token and provides userId to the handler function.
 * 
 * Usage:
 * ```ts
 * export const POST = withAuth(async (req, { userId }) => {
 *   // userId is guaranteed to be valid here
 *   // ... your route logic
 * });
 * ```
 */
export function withAuth<T = unknown>(
  handler: (
    request: NextRequest,
    context: { userId: string; email?: string },
    ...args: unknown[]
  ) => Promise<NextResponse<T | ApiError>>
) {
  return async (
    request: NextRequest,
    ...args: unknown[]
  ): Promise<NextResponse<T | ApiError>> => {
    const verifiedToken = await verifyFirebaseToken(request);

    if (!verifiedToken) {
      return createAuthErrorResponse(
        "Invalid or missing authentication token. Please log in and try again.",
        401
      );
    }

    // Call the handler with verified userId
    return handler(request, verifiedToken, ...args);
  };
}

