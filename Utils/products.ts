export interface Product {
  id: number;
  image: string;
  name: string;
  slug: string;
  description: string;
  sizes: {
    small: 'S';
    medium: 'M';
    large: 'L';
    xl: 'XL';
    xxl: 'XXL';
    defaultSize: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  };
  rating: {
    stars: number;
    count: number;
  };
  priceCents: number;
  quantity: number;
}

export const products: Product[] = [
  {
    id: 1,
    image: "/images/products/2-slot-toaster-white.jpg",
    name: "2-Slot Toaster (White)",
    slug: "2-slot-toaster-white-a1b2c3d4",
    description: "Compact 2-slot toaster in a clean white finish, perfect for evenly toasting bread, bagels, and snacks every morning.",
    sizes: {
      small: 'S',
      medium: 'M',
      large: 'L',
      xl: 'XL',
      xxl: 'XXL',
      defaultSize: 'M',
    },
    rating: {
      stars: 4.5,
      count: 123,
    },
    priceCents: 2999,
    quantity: 1,
  },
  {
    id: 2,
    image: "/images/products/3-piece-cooking-set.jpg",
    name: "3-Piece Cooking Set",
    slug: "3-piece-cooking-set-e5f6g7h8",
    description: "Versatile 3-piece non-stick cooking set ideal for everyday meals, from quick stir-fries to slow-simmered sauces.",
    sizes: {
      small: 'S',
      medium: 'M',
      large: 'L',
      xl: 'XL',
      xxl: 'XXL',
      defaultSize: 'M',
    },
    rating: {
      stars: 4,
      count: 87,
    },
    priceCents: 4599,
    quantity: 1,
  },
  {
    id: 3,
    image: "/images/products/adults-plain-cotton-tshirt-2-pack-teal.jpg",
    name: "Adults Plain Cotton T-Shirt 2-Pack (Teal)",
    slug: "adults-plain-cotton-t-shirt-2-pack-teal-j1k2l3m4",
    description: "Soft, breathable adults cotton t-shirt 2-pack in teal, perfect for layering or relaxed everyday wear.",
    sizes: {
      small: 'S',
      medium: 'M',
      large: 'L',
      xl: 'XL',
      xxl: 'XXL',
      defaultSize: 'M',
    },
    rating: {
      stars: 4,
      count: 210,
    },
    priceCents: 1999,
    quantity: 1,
  },
  {
    id: 4,
    image: "/images/products/artistic-bowl-set-6-piece.jpg",
    name: "Artistic Bowl Set (6-Piece)",
    slug: "artistic-bowl-set-6-piece-n5p6q7r8",
    description: "Elegant 6-piece artistic bowl set with a modern design, great for serving soups, salads, or snacks.",
    sizes: {
      small: 'S',
      medium: 'M',
      large: 'L',
      xl: 'XL',
      xxl: 'XXL',
      defaultSize: 'M',
    },
    rating: {
      stars: 5,
      count: 64,
    },
    priceCents: 3599,
    quantity: 1,
  },
  {
    id: 5,
    image: "/images/products/athletic-cotton-socks-6-pairs.jpg",
    name: "Athletic Cotton Socks (6 Pairs)",
    slug: "athletic-cotton-socks-6-pairs-s1t2u3v4",
    description: "Pack of six athletic cotton socks that offer cushioned comfort and breathable support for daily activities.",
    sizes: {
      small: 'S',
      medium: 'M',
      large: 'L',
      xl: 'XL',
      xxl: 'XXL',
      defaultSize: 'M',
    },
    rating: {
      stars: 4,
      count: 321,
    },
    priceCents: 1499,
    quantity: 1,
  },
  {
    id: 6,
    image: "/images/products/athletic-skateboard-shoes-gray.jpg",
    name: "Athletic Skateboard Shoes (Gray)",
    slug: "athletic-skateboard-shoes-gray-w9x8y7z6",
    description: "Durable gray skateboard shoes with a grippy sole and cushioned insole for skating or casual streetwear.",
    sizes: {
      small: 'S',
      medium: 'M',
      large: 'L',
      xl: 'XL',
      xxl: 'XXL',
      defaultSize: 'M',
    },
    rating: {
      stars: 4,
      count: 98,
    },
    priceCents: 5499,
    quantity: 1,
  },
  {
    id: 7,
    image: "/images/products/bath-towel-set-gray-rosewood.jpg",
    name: "Bath Towel Set (Gray/Rosewood)",
    slug: "bath-towel-set-gray-rosewood-a9b8c7d6",
    description: "Soft bath towel set in gray and rosewood tones, adding a cozy touch and quick absorbency to your bathroom.",
    sizes: {
      small: 'S',
      medium: 'M',
      large: 'L',
      xl: 'XL',
      xxl: 'XXL',
      defaultSize: 'M',
    },
    rating: {
      stars: 4,
      count: 76,
    },
    priceCents: 2599,
    quantity: 1,
  },
  {
    id: 8,
    image: "/images/products/bathroom-mat.jpg",
    name: "Bathroom Mat",
    slug: "bathroom-mat-e3f4g5h6",
    description: "Plush, non-slip bathroom mat that keeps your feet warm and dry stepping out of the shower or bath.",
    sizes: {
      small: 'S',
      medium: 'M',
      large: 'L',
      xl: 'XL',
      xxl: 'XXL',
      defaultSize: 'M',
    },
    rating: {
      stars: 4,
      count: 55,
    },
    priceCents: 1899,
    quantity: 1,
  },
  {
    id: 9,
    image: "/images/products/black-and-silver-espresso-maker.jpg",
    name: "Black & Silver Espresso Maker",
    slug: "black-silver-espresso-maker-j7k8l9m0",
    description: "Stylish black and silver espresso maker that brews rich, café-quality espresso shots at home.",
    sizes: {
      small: 'S',
      medium: 'M',
      large: 'L',
      xl: 'XL',
      xxl: 'XXL',
      defaultSize: 'M',
    },
    rating: {
      stars: 5,
      count: 132,
    },
    priceCents: 7999,
    quantity: 1,
  },
  {
    id: 10,
    image: "/images/products/blackout-curtain-set-beige.jpg",
    name: "Blackout Curtain Set (Beige)",
    slug: "blackout-curtain-set-beige-n1p2q3r4",
    description: "Beige blackout curtain set that blocks light and reduces noise for a darker, more restful room.",
    sizes: {
      small: 'S',
      medium: 'M',
      large: 'L',
      xl: 'XL',
      xxl: 'XXL',
      defaultSize: 'M',
    },
    rating: {
      stars: 4,
      count: 43,
    },
    priceCents: 4899,
    quantity: 1,
  },
  {
    id: 11,
    image: "/images/products/blackout-curtains-set-teal.jpg",
    name: "Blackout Curtain Set (Teal)",
    slug: "blackout-curtain-set-teal-s5t6u7v8",
    description: "Teal blackout curtain set that adds a pop of color while darkening your space and improving privacy.",
    sizes: {
      small: 'S',
      medium: 'M',
      large: 'L',
      xl: 'XL',
      xxl: 'XXL',
      defaultSize: 'M',
    },
    rating: {
      stars: 4,
      count: 52,
    },
    priceCents: 4999,
    quantity: 1,
  },
  {
    id: 12,
    image: "/images/products/countertop-push-blender-black.jpg",
    name: "Countertop Push Blender (Black)",
    slug: "countertop-push-blender-black-w1x2y3z4",
    description: "Compact black countertop push blender ideal for smoothies, sauces, and quick kitchen prep.",
    sizes: {
      small: 'S',
      medium: 'M',
      large: 'L',
      xl: 'XL',
      xxl: 'XXL',
      defaultSize: 'M',
    },
    rating: {
      stars: 4,
      count: 65,
    },
    priceCents: 5599,
    quantity: 1,
  },
  {
    id: 13,
    image: "/images/products/crystal-zirconia-stud-earrings-pink.jpg",
    name: "Crystal Zirconia Stud Earrings (Pink)",
    slug: "crystal-zirconia-stud-earrings-pink-a2b3c4d5",
    description: "Delicate pink crystal zirconia stud earrings that add a subtle sparkle to everyday or evening looks.",
    sizes: {
      small: 'S',
      medium: 'M',
      large: 'L',
      xl: 'XL',
      xxl: 'XXL',
      defaultSize: 'M',
    },
    rating: {
      stars: 5,
      count: 201,
    },
    priceCents: 2599,
    quantity: 1,
  },
  {
    id: 14,
    image: "/images/products/duvet-cover-set-gray-queen.jpg",
    name: "Duvet Cover Set (Gray, Queen)",
    slug: "duvet-cover-set-gray-queen-e6f7g8h9",
    description: "Cozy gray queen-size duvet cover set that gives your bedroom a clean, modern hotel-inspired look.",
    sizes: {
      small: 'S',
      medium: 'M',
      large: 'L',
      xl: 'XL',
      xxl: 'XXL',
      defaultSize: 'M',
    },
    rating: {
      stars: 4,
      count: 90,
    },
    priceCents: 6999,
    quantity: 1,
  },
  {
    id: 15,
    image: "/images/products/electric-steel-hot-water-kettle-white.jpg",
    name: "Electric Steel Hot Water Kettle (White)",
    slug: "electric-steel-hot-water-kettle-white-j3k4l5m6",
    description: "Electric steel hot water kettle in white that quickly boils water for tea, coffee, and instant meals.",
    sizes: {
      small: 'S',
      medium: 'M',
      large: 'L',
      xl: 'XL',
      xxl: 'XXL',
      defaultSize: 'M',
    },
    rating: {
      stars: 4,
      count: 112,
    },
    priceCents: 4299,
    quantity: 1,
  },
  {
    id: 16,
    image: "/images/products/elegant-white-dinner-plate-set.jpg",
    name: "Elegant White Dinner Plate Set",
    slug: "elegant-white-dinner-plate-set-n7p8q9r0",
    description: "Classic white dinner plate set with a refined design, perfect for both everyday meals and special occasions.",
    sizes: {
      small: 'S',
      medium: 'M',
      large: 'L',
      xl: 'XL',
      xxl: 'XXL',
      defaultSize: 'M',
    },
    rating: {
      stars: 5,
      count: 77,
    },
    priceCents: 3899,
    quantity: 1,
  },
];
