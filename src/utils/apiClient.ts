// src/utils/apiClient.ts
// Helper utility for making authenticated API requests with Firebase ID tokens

import { auth } from "@/lib/firebase/firebase";

/**
 * Makes an authenticated fetch request with Firebase ID token in Authorization header.
 * 
 * @param url - The API endpoint URL
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Promise<Response> - The fetch response
 * @throws Error if user is not authenticated
 * 
 * @example
 * ```ts
 * const response = await authenticatedFetch("/api/cart", {
 *   method: "POST",
 *   body: JSON.stringify({ productId: "123", quantity: 1 }),
 * });
 * ```
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const token = await user.getIdToken();
  
  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  return fetch(url, {
    ...options,
    headers,
  });
}
