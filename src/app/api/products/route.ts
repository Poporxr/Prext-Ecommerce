// src/app/api/products/route.ts
// Firestore + Cloud Storage handlers for `/api/products` using Firebase Admin SDK.
// - GET    /api/products      -> list all products
// - POST   /api/products      -> create a new product with image upload

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { adminDB, adminStorage } from "@/lib/firebaseAdmins";

// Ensure this route runs in the Node.js runtime so we can use the Admin SDK.
export const runtime = "nodejs";

// Sizes structure we want on every product, matching your existing data.
interface Sizes {
  small: "S";
  medium: "M";
  large: "L";
  xl: "XL";
  xxl: "XXL";
  defaultSize: "S" | "M" | "L" | "XL" | "XXL";
}

// Shape of a product document stored in Firestore.
// This matches your example structure, plus timestamps.
interface ProductDoc {
  id: number; // numeric product id (separate from Firestore doc id)
  image: string; // image URL from Firebase Storage
  name: string;
  slug: string;
  description: string;
  sizes: Sizes;
  priceCents: number;
  quantity: number;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  // Allow arbitrary extra fields if needed later.
  [key: string]: unknown;
}

// GET /api/products
// Returns all products from the Firestore `products` collection using Admin SDK.
// We expose both the numeric `id` (stored in the document) and the
// Firestore document id as `firestoreId`.
export async function GET(_request: NextRequest) {
  try {
    const snapshot = await adminDB.collection("products").get();

    const products = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as ProductDoc;
      return {
        firestoreId: docSnap.id,
        ...data,
      };
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("GET /api/products error", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products
// Creates a new product document in Firestore and uploads its image
// to Firebase Storage.
//
// Expects multipart/form-data with fields:
// - name: string
// - priceCents OR price: number
// - description: string
// - slug: (optional string; if omitted, generated from name)
// - image: File (the product image)
export async function POST(request: NextRequest) {
  // 1. Parse and validate form fields
  let name: string;
  let description: string;
  let slug: string;
  let priceCents: number;
  let imageFile: File;

  try {
    const formData = await request.formData();

    const rawName = formData.get("name");
    const rawDescription = formData.get("description");
    const rawSlug = formData.get("slug");
    const rawPriceCents = formData.get("priceCents") ?? formData.get("price");
    const rawImage = formData.get("image");

    // name
    if (typeof rawName !== "string" || !rawName.trim()) {
      return NextResponse.json(
        { error: "Field 'name' is required and must be a non-empty string." },
        { status: 400 }
      );
    }
    name = rawName.trim();

    // description
    if (typeof rawDescription !== "string" || !rawDescription.trim()) {
      return NextResponse.json(
        {
          error:
            "Field 'description' is required and must be a non-empty string.",
        },
        { status: 400 }
      );
    }
    description = rawDescription.trim();

    // priceCents / price
    if (rawPriceCents === null) {
      return NextResponse.json(
        {
          error:
            "Either 'priceCents' or 'price' is required and must be a positive number.",
        },
        { status: 400 }
      );
    }

    const priceNumber = Number(rawPriceCents);
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      return NextResponse.json(
        { error: "'priceCents' / 'price' must be a positive number." },
        { status: 400 }
      );
    }
    priceCents = priceNumber;

    // slug (optional; generate if missing)
    let computedSlug: string;
    if (typeof rawSlug === "string" && rawSlug.trim()) {
      computedSlug = rawSlug.trim();
    } else {
      const base = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const suffix = randomUUID().slice(0, 8);
      computedSlug = `${base}-${suffix}`;
    }
    slug = computedSlug;

    // image file
    if (!(rawImage instanceof File)) {
      return NextResponse.json(
        { error: "Field 'image' is required and must be a file." },
        { status: 400 }
      );
    }
    imageFile = rawImage;
  } catch (error) {
    console.error("Failed to parse form data in POST /api/products", error);
    return NextResponse.json(
      {
        error: "Invalid form data. Ensure you are sending multipart/form-data.",
      },
      { status: 400 }
    );
  }

  // 2. Upload image to Cloud Storage with a unique filename (Admin SDK)
  let imageUrl: string;

  try {
    // Explicitly use the bucket name from environment variable
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
      throw new Error(
        "FIREBASE_STORAGE_BUCKET environment variable is not set."
      );
    }

    const bucket = adminStorage.bucket(bucketName);

    // Check if bucket exists and is accessible
    const [exists] = await bucket.exists();
    if (!exists) {
      throw new Error(
        `Storage bucket "${bucketName}" does not exist. Please create it in Firebase Console (Storage section) or verify the bucket name is correct. Expected format: "your-project-id.appspot.com"`
      );
    }

    const safeOriginalName = imageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const uniqueName = `${Date.now()}-${randomUUID()}-${safeOriginalName}`;
    const filePath = `products/${uniqueName}`;
    const file = bucket.file(filePath);

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await file.save(buffer, {
      contentType: imageFile.type || "application/octet-stream",
      resumable: false,
    });

    // Public URL (assuming you configure access appropriately)
    imageUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
  } catch (error) {
    console.error("Cloud Storage upload failed in POST /api/products", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Provide more helpful error messages
    let userFriendlyError = "Failed to upload product image.";
    if (errorMessage.includes("does not exist")) {
      userFriendlyError = errorMessage;
    } else if (errorMessage.includes("FIREBASE_STORAGE_BUCKET")) {
      userFriendlyError = errorMessage;
    }

    return NextResponse.json(
      {
        error: userFriendlyError,
        details: errorMessage,
      },
      { status: 500 }
    );
  }

  // 3. Build the product document and save it to Firestore (Admin SDK)
  try {
    const now = new Date().toISOString();

    const sizes: Sizes = {
      small: "S",
      medium: "M",
      large: "L",
      xl: "XL",
      xxl: "XXL",
      defaultSize: "M",
    };

    const numericId = Date.now();

    const data: ProductDoc = {
      id: numericId,
      image: imageUrl,
      name,
      slug,
      description,
      sizes,
      priceCents,
      quantity: 1,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDB.collection("products").add(data);

    return NextResponse.json(
      {
        firestoreId: docRef.id,
        ...data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Firestore write failed in POST /api/products", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
