import Image from "next/image";
import ProductCard from "../components/ProductCards";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export interface Product {
  firestoreId: string;
  id: number;
  description: string;
  sizes: object[];
  quantity: number;
  name: string;
  slug: string;
  image: string;
  priceCents: number;
}

export interface ProductsCardsprops {
  products: Product[];
}

const getProducts = async () => {
  const res = await fetch(`${BASE_URL}/api/products`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  return res.json();
};

export default async function Home() {
  const products = await getProducts();

  return (
    <main>
      <section className="relative w-full h-[100vh] mb-10">
        <Image
          fill
          className="absolute w-full"
          src="/images/hero-landing.png"
          alt="Hero Image"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/10" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center max-w-2xl px-6">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/70">
            New Collection
          </p>

          <h1 className="text-5xl md:text-6xl font-semibold text-white leading-tight">
            Designed for Modern Living
          </h1>

          <p className="mt-4 text-base md:text-lg text-white/80">
            Thoughtfully crafted pieces that blend comfort, style, and everyday
            elegance.
          </p>

          <div className="mt-8">
            <button className="rounded-full bg-white px-8 py-3 text-sm font-medium text-black hover:bg-white/90 transition">
              Shop Collection
            </button>
          </div>
        </div>
      </section>
      <div className="grid grid-cols-4 p-4 p-4 max-[446px]:grid-cols-1 max-[768px]:grid-cols-2 max-[1024px]:grid-cols-3 gap-4">
        <ProductCard products={products} />
      </div>
    </main>
  );
}
