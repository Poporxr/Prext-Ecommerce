// src/app/api/products/route.ts
// Firestore + Cloud Storage handlers for `/api/products`.
// - GET    /api/products      -> list all products
// - POST   /api/products      -> create a new product with image upload

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { adminDB } from "@/lib/firebaseAdmins";
import cloudinary from "@/lib/cloudinary";

// Ensure Node.js runtime for Admin SDK and Cloudinary.
export const runtime = "nodejs";

interface Sizes {
  small: "S";
  medium: "M";
  large: "L";
  xl: "XL";
  xxl: "XXL";
  defaultSize: "S" | "M" | "L" | "XL" | "XXL";
}

// Firestore product document shape (matches your example + timestamps).
interface ProductDoc {
  id: number; // numeric product id (separate from Firestore doc id)
  image: string; // image URL from Storage
  name: string;
  slug: string;
  description: string;
  sizes: Sizes;
  priceCents: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

// GET /api/products
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
// Expects multipart/form-data:
// - name: string
// - description: string
// - priceCents OR price: number
// - slug: optional string (auto-generated if missing)
// - image: File
export async function POST(request: NextRequest) {
  // 1. Parse and validate form data
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
    const rawPrice = formData.get("priceCents") ?? formData.get("price");
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

    // price
    if (rawPrice === null) {
      return NextResponse.json(
        {
          error:
            "Either 'priceCents' or 'price' is required and must be a positive number.",
        },
        { status: 400 }
      );
    }
    const parsedPrice = Number(rawPrice);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { error: "'priceCents' / 'price' must be a positive number." },
        { status: 400 }
      );
    }
    priceCents = parsedPrice;

    // slug (optional)
    if (typeof rawSlug === "string" && rawSlug.trim()) {
      slug = rawSlug.trim();
    } else {
      const base = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const suffix = randomUUID().slice(0, 8);
      slug = `${base}-${suffix}`;
    }

    // image
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
        error:
          "Invalid form data. Ensure you are sending multipart/form-data with name, description, price, and image.",
      },
      { status: 400 }
    );
  }

  // 2. Upload image to Cloudinary with a unique filename
  let imageUrl: string;
  try {
    const safeOriginalName = imageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const uniqueName = `${Date.now()}-${randomUUID()}-${safeOriginalName}`;

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "products",
          public_id: uniqueName,
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result);
        }
      );

      stream.end(buffer);
    });

    imageUrl = uploadResult.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed in POST /api/products", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to upload product image.",
        details: errorMessage,
      },
      { status: 500 }
    );
  }

  // 3. Save product document in Firestore
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

    const numericId = Date.now(); // simple numeric id like your example

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
