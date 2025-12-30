export interface Product {
  id: number;
  image: string;
  name: string;
  rating: {
    stars: number;
    count: number;
  };
  priceCents: number;
}

export const products: Product[] = [
  {
    id: 1,
    image: "/images/products/2-slot-toaster-white.jpg",
    name: "2-Slot Toaster (White)",
    rating: {
      stars: 4.5,
      count: 123,
    },
    priceCents: 2999,
  },
  {
    id: 2,
    image: "/images/products/3-piece-cooking-set.jpg",
    name: "3-Piece Cooking Set",
    rating: {
      stars: 4,
      count: 87,
    },
    priceCents: 4599,
  },
  {
    id: 3,
    image: "/images/products/adults-plain-cotton-tshirt-2-pack-teal.jpg",
    name: "Adults Plain Cotton T-Shirt 2-Pack (Teal)",
    rating: {
      stars: 4,
      count: 210,
    },
    priceCents: 1999,
  },
  {
    id: 4,
    image: "/images/products/artistic-bowl-set-6-piece.jpg",
    name: "Artistic Bowl Set (6-Piece)",
    rating: {
      stars: 5,
      count: 64,
    },
    priceCents: 3599,
  },
  {
    id: 5,
    image: "/images/products/athletic-cotton-socks-6-pairs.jpg",
    name: "Athletic Cotton Socks (6 Pairs)",
    rating: {
      stars: 4,
      count: 321,
    },
    priceCents: 1499,
  },
  {
    id: 6,
    image: "/images/products/athletic-skateboard-shoes-gray.jpg",
    name: "Athletic Skateboard Shoes (Gray)",
    rating: {
      stars: 4,
      count: 98,
    },
    priceCents: 5499,
  },
  {
    id: 7,
    image: "/images/products/bath-towel-set-gray-rosewood.jpg",
    name: "Bath Towel Set (Gray/Rosewood)",
    rating: {
      stars: 4,
      count: 76,
    },
    priceCents: 2599,
  },
  {
    id: 8,
    image: "/images/products/bathroom-mat.jpg",
    name: "Bathroom Mat",
    rating: {
      stars: 4,
      count: 55,
    },
    priceCents: 1899,
  },
  {
    id: 9,
    image: "/images/products/black-and-silver-espresso-maker.jpg",
    name: "Black & Silver Espresso Maker",
    rating: {
      stars: 5,
      count: 132,
    },
    priceCents: 7999,
  },
  {
    id: 10,
    image: "/images/products/blackout-curtain-set-beige.jpg",
    name: "Blackout Curtain Set (Beige)",
    rating: {
      stars: 4,
      count: 43,
    },
    priceCents: 4899,
  },
  {
    id: 11,
    image: "/images/products/blackout-curtains-set-teal.jpg",
    name: "Blackout Curtain Set (Teal)",
    rating: {
      stars: 4,
      count: 52,
    },
    priceCents: 4999,
  },
  {
    id: 12,
    image: "/images/products/countertop-push-blender-black.jpg",
    name: "Countertop Push Blender (Black)",
    rating: {
      stars: 4,
      count: 65,
    },
    priceCents: 5599,
  },
  {
    id: 13,
    image: "/images/products/crystal-zirconia-stud-earrings-pink.jpg",
    name: "Crystal Zirconia Stud Earrings (Pink)",
    rating: {
      stars: 5,
      count: 201,
    },
    priceCents: 2599,
  },
  {
    id: 14,
    image: "/images/products/duvet-cover-set-gray-queen.jpg",
    name: "Duvet Cover Set (Gray, Queen)",
    rating: {
      stars: 4,
      count: 90,
    },
    priceCents: 6999,
  },
  {
    id: 15,
    image: "/images/products/electric-steel-hot-water-kettle-white.jpg",
    name: "Electric Steel Hot Water Kettle (White)",
    rating: {
      stars: 4,
      count: 112,
    },
    priceCents: 4299,
  },
  {
    id: 16,
    image: "/images/products/elegant-white-dinner-plate-set.jpg",
    name: "Elegant White Dinner Plate Set",
    rating: {
      stars: 5,
      count: 77,
    },
    priceCents: 3899,
  },
];
