// src/app/api/Cart/route.ts
// - GET  /api/Cart   -> list all cart items
// - POST /api/Cart   -> add/increment a cart item

import { NextRequest, NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmins";

export const runtime = "nodejs";

interface CartItemDoc {
  userId: string; // for now, can be "anonymous"; later: Firebase Auth uid
  productId: string;
  quantity: number;
  product: ProductDoc & { firestoreId?: string }; // Full product details stored in cart
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  [key: string]: unknown;
}

type CartItem = { id: string } & CartItemDoc;

// Product structure from products collection
interface ProductDoc {
  id: number;
  image: string;
  name: string;
  slug: string;
  description: string;
  sizes: {
    small: "S";
    medium: "M";
    large: "L";
    xl: "XL";
    xxl: "XXL";
    defaultSize: "S" | "M" | "L" | "XL" | "XXL";
  };
  priceCents: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

// Helper function to fetch product details by productId
async function fetchProductDetails(
  productId: string
): Promise<(ProductDoc & { firestoreId?: string }) | null> {
  try {
    const numericId = Number(productId);
    let productDoc: ProductDoc | null = null;
    let firestoreId: string | undefined;

    // Try to find by numeric id field first
    if (Number.isFinite(numericId)) {
      const productSnapshot = await adminDB
        .collection("products")
        .where("id", "==", numericId)
        .limit(1)
        .get();

      if (!productSnapshot.empty) {
        const doc = productSnapshot.docs[0];
        productDoc = doc.data() as ProductDoc;
        firestoreId = doc.id;
      }
    }

    // If not found by numeric id, try Firestore document id
    if (!productDoc) {
      const productRef = adminDB.collection("products").doc(productId);
      const productSnap = await productRef.get();

      if (productSnap.exists) {
        productDoc = productSnap.data() as ProductDoc;
        firestoreId = productSnap.id;
      }
    }

    if (productDoc) {
      return {
        ...productDoc,
        firestoreId,
      };
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    return null;
  }
}

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  error: string;
  details?: string;
}

// Type for incoming request body (flexible to handle various formats)
interface CartRequestBody {
  productId?: string;
  product_id?: string;
  "product-id"?: string;
  product?: string;
  quantity?: number | string;
  userId?: string;
  [key: string]: unknown;
}

// GET /api/Cart
// Fetches all cart items with product details (stored in cart). When you add auth, you should filter by userId here.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const snapshot = await adminDB.collection("cart").get();

    // Product details are already stored in cart items, so just return them
    const items: CartItem[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as CartItemDoc;
      return {
        id: docSnap.id,
        ...data,
      };
    });

    const body: ApiSuccess<CartItem[]> = {
      success: true,
      data: items,
    };

    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    console.error("GET /api/cart error", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Unknown error occurred";

    const body: ApiError = {
      success: false,
      error: "Failed to fetch cart items.",
      details:
        process.env.NODE_ENV === "development" ? errorMessage : undefined,
    };

    return NextResponse.json(body, { status: 500 });
  }
}

// POST /api/Cart
// Adds a new cart item or increments quantity if item already exists.
// Accepts:
// - JSON body: { productId: string; quantity?: number; userId?: string }
// - OR URL-encoded body: productId=...&quantity=...&userId=...
export async function POST(req: NextRequest) {
  let productId: string;
  let quantity: number;
  let userId: string;

  let json: CartRequestBody;
  try {
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      // Standard JSON body
      try {
        json = await req.json();
      } catch (parseError) {
        console.error("Failed to parse JSON body:", parseError);
        const body: ApiError = {
          success: false,
          error: "Invalid JSON in request body.",
          details:
            parseError instanceof Error
              ? parseError.message
              : "Unknown parsing error",
        };
        return NextResponse.json(body, { status: 400 });
      }
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      // URL-encoded form bodies
      try {
        const text = await req.text();
        if (!text || text.trim().length === 0) {
          const body: ApiError = {
            success: false,
            error: "Request body is empty.",
          };
          return NextResponse.json(body, { status: 400 });
        }
        const params = new URLSearchParams(text);
        json = Object.fromEntries(params.entries()) as CartRequestBody;
        if (json.quantity !== undefined) {
          json.quantity = Number(json.quantity);
        }
      } catch (parseError) {
        console.error("Failed to parse form body:", parseError);
        const errorMessage =
          parseError instanceof Error
            ? parseError.message
            : "Unknown parsing error";
        const body: ApiError = {
          success: false,
          error: "Invalid form data in request body.",
          details: errorMessage,
        };
        return NextResponse.json(body, { status: 400 });
      }
    } else {
      // Try to parse as JSON if no content-type or unknown type
      try {
        const text = await req.text();
        if (!text || text.trim().length === 0) {
          const body: ApiError = {
            success: false,
            error:
              "Request body is empty. Expected JSON { productId, quantity?, userId? }.",
          };
          return NextResponse.json(body, { status: 400 });
        }
        json = JSON.parse(text) as CartRequestBody;
      } catch (parseError) {
        console.error("Failed to parse request body:", parseError);
        const errorMessage =
          parseError instanceof Error
            ? parseError.message
            : "Unknown parsing error";
        const body: ApiError = {
          success: false,
          error:
            "Invalid request body. Expected JSON { productId, quantity?, userId? }.",
          details: errorMessage,
        };
        return NextResponse.json(body, { status: 400 });
      }
    }

    // Log received data for debugging (only in development)
    if (process.env.NODE_ENV === "development") {
      console.log("Received cart POST data:", {
        contentType,
        hasJson: !!json,
        jsonKeys: json ? Object.keys(json) : [],
        productId: json?.productId,
      });
    }

    // Check if json is valid
    if (!json || typeof json !== "object" || Array.isArray(json)) {
      const body: ApiError = {
        success: false,
        error: "Request body must be a JSON object.",
        details: `Received: ${typeof json}`,
      };
      return NextResponse.json(body, { status: 400 });
    }

    // Check for productId with various possible field names
    const productIdValue =
      json.productId || json.product_id || json["product-id"] || json.product;

    if (
      !productIdValue ||
      typeof productIdValue !== "string" ||
      !productIdValue.trim()
    ) {
      const body: ApiError = {
        success: false,
        error: "Field 'productId' is required and must be a non-empty string.",
        details: `Received fields: ${Object.keys(json).join(", ")}`,
      };
      return NextResponse.json(body, { status: 400 });
    }

    productId = String(productIdValue).trim();

    const rawQuantity = json.quantity !== undefined ? Number(json.quantity) : 1;

    if (!Number.isFinite(rawQuantity) || rawQuantity <= 0) {
      const body: ApiError = {
        success: false,
        error:
          "Field 'quantity' must be a positive number when provided (default is 1).",
      };
      return NextResponse.json(body, { status: 400 });
    }

    quantity = rawQuantity;

    // For now, allow client to pass userId or fallback to "anonymous".
    if (json.userId && typeof json.userId === "string" && json.userId.trim()) {
      userId = json.userId.trim();
    } else {
      userId = "anonymous"; // later replace with Firebase Auth uid
    }
  } catch (error) {
    console.error("Failed to parse request body in POST /api/cart", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Unknown error occurred";

    const body: ApiError = {
      success: false,
      error:
        "Invalid request body. Expected JSON { productId, quantity?, userId? } or URL-encoded form.",
      details:
        process.env.NODE_ENV === "development" ? errorMessage : undefined,
    };
    return NextResponse.json(body, { status: 400 });
  }

  try {
    // Validate productId format (should be non-empty string)
    if (!productId || productId.trim().length === 0) {
      const body: ApiError = {
        success: false,
        error: "Invalid productId: must be a non-empty string.",
      };
      return NextResponse.json(body, { status: 400 });
    }

    // Validate quantity
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 1000) {
      const body: ApiError = {
        success: false,
        error:
          "Invalid quantity: must be a positive number between 1 and 1000.",
      };
      return NextResponse.json(body, { status: 400 });
    }

    // Validate userId
    if (!userId || userId.trim().length === 0) {
      const body: ApiError = {
        success: false,
        error: "Invalid userId: must be a non-empty string.",
      };
      return NextResponse.json(body, { status: 400 });
    }

    // Fetch and validate product exists before proceeding
    const product = await fetchProductDetails(productId);
    if (!product) {
      const body: ApiError = {
        success: false,
        error: `Product with id "${productId}" not found.`,
      };
      return NextResponse.json(body, { status: 404 });
    }

    const collectionRef = adminDB.collection("cart");

    // Check if cart item for this user+product already exists
    let existingSnapshot;
    try {
      existingSnapshot = await collectionRef
        .where("userId", "==", userId)
        .where("productId", "==", productId)
        .limit(1)
        .get();
    } catch (queryError) {
      console.error("Firestore query error:", queryError);
      const body: ApiError = {
        success: false,
        error: "Failed to query existing cart items.",
        details:
          process.env.NODE_ENV === "development" && queryError instanceof Error
            ? queryError.message
            : undefined,
      };
      return NextResponse.json(body, { status: 500 });
    }

    const now = new Date().toISOString();

    // If exists, increment quantity
    if (!existingSnapshot.empty) {
      try {
        const existingDoc = existingSnapshot.docs[0];
        const existingData = existingDoc.data() as CartItemDoc;

        // Validate existing data structure
        if (
          !existingData ||
          typeof existingData.quantity !== "number" ||
          existingData.quantity < 0
        ) {
          console.error("Invalid existing cart item data:", existingData);
          const body: ApiError = {
            success: false,
            error: "Invalid cart item data found in database.",
          };
          return NextResponse.json(body, { status: 500 });
        }

        const newQuantity = existingData.quantity + quantity;

        // Prevent overflow
        if (newQuantity > 1000) {
          const body: ApiError = {
            success: false,
            error:
              "Quantity would exceed maximum allowed (1000). Current quantity: " +
              existingData.quantity,
          };
          return NextResponse.json(body, { status: 400 });
        }

        // Update product details in case they've changed
        const updatedProduct = await fetchProductDetails(productId);
        if (!updatedProduct) {
          const body: ApiError = {
            success: false,
            error: `Product with id "${productId}" no longer exists.`,
          };
          return NextResponse.json(body, { status: 404 });
        }

        await existingDoc.ref.update({
          quantity: newQuantity,
          product: updatedProduct, // Update product details
          updatedAt: now,
        });

        const updated: CartItemDoc = {
          ...existingData,
          quantity: newQuantity,
          product: updatedProduct,
          updatedAt: now,
        };

        const cartItem: CartItem = {
          id: existingDoc.id,
          ...updated,
        };

        const body: ApiSuccess<CartItem> = {
          success: true,
          data: cartItem,
        };

        return NextResponse.json(body, { status: 200 });
      } catch (updateError) {
        console.error("Firestore update error:", updateError);
        const errorMessage =
          updateError instanceof Error
            ? updateError.message
            : "Unknown update error";
        const body: ApiError = {
          success: false,
          error: "Failed to update cart item.",
          details:
            process.env.NODE_ENV === "development" ? errorMessage : undefined,
        };
        return NextResponse.json(body, { status: 500 });
      }
    }

    // Otherwise, create new cart item
    try {
      const docData: CartItemDoc = {
        userId,
        productId,
        quantity,
        product, // Store full product details
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await collectionRef.add(docData);

      const cartItem: CartItem = {
        id: docRef.id,
        ...docData,
      };

      const body: ApiSuccess<CartItem> = {
        success: true,
        data: cartItem,
      };

      return NextResponse.json(body, { status: 201 });
    } catch (createError) {
      console.error("Firestore create error:", createError);
      const errorMessage =
        createError instanceof Error
          ? createError.message
          : "Unknown create error";
      const body: ApiError = {
        success: false,
        error: "Failed to create cart item.",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      };
      return NextResponse.json(body, { status: 500 });
    }
  } catch (error) {
    console.error("POST /api/cart unexpected error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Unknown error occurred";

    const body: ApiError = {
      success: false,
      error: "An unexpected error occurred while processing the request.",
      details:
        process.env.NODE_ENV === "development" ? errorMessage : undefined,
    };
    return NextResponse.json(body, { status: 500 });
  }
}
