import ProductCard from "../components/ProductCards";
import LandingPage from "@/components/LandingPage";
import NavBar from "@/components/NavBar";
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
      <NavBar />
      <LandingPage />
      <h3 className="pl-5 text-4xl font-serif mb-10 text-black">Shop Now</h3>
      <div className="grid grid-cols-4 p-4 max-[446px]:grid-cols-1 max-[768px]:grid-cols-2 max-[1024px]:grid-cols-3 gap-4">
        
        <ProductCard products={products} />
      </div>
    </main>
  );
}
