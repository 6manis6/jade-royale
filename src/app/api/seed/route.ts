import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';

const sampleProducts = [
  // Skincare
  {
    name: "Golden Glow Face Oil",
    price: 38.50,
    originalPrice: 45.00,
    category: "Skincare",
    images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop"],
    description: "Our signature face oil crafted with 24k gold flakes and pure argan oil. This luxurious treatment deeply hydrates, reduces fine lines, and leaves your skin with an ethereal radiance. Perfect for all skin types, especially during dry seasons in Birtamod.",
    stock: 25,
    badge: "SALE",
    rating: 4.9,
    reviewCount: 342
  },
  {
    name: "Rose Quartz Hydrating Mist",
    price: 24.00,
    category: "Skincare",
    images: ["https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=800&auto=format&fit=crop"],
    description: "Infused with real rose quartz crystals and Bulgarian rose water. This refreshing mist sets makeup and provides an instant burst of hydration throughout the day. A must-have for the modern woman on the go.",
    stock: 60,
    badge: "NEW",
    rating: 4.7,
    reviewCount: 156
  },
  {
    name: "Vitamin C Brightening Serum",
    price: 52.00,
    originalPrice: 65.00,
    category: "Skincare",
    images: ["https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=800&auto=format&fit=crop"],
    description: "Concentrated 15% Pure Vitamin C to even skin tone and protect against environmental pollutants. Witness a visible difference in skin clarity and texture within just 7 days of regular use.",
    stock: 15,
    badge: "HOT",
    rating: 5.0,
    reviewCount: 512
  },
  
  // Makeup
  {
    name: "Velvet Royale Liquid Lipstick",
    price: 18.00,
    category: "Makeup",
    images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop"],
    description: "Highly pigmented, long-wearing liquid lipstick with a comfortable matte finish. The 'Jade Red' shade is specifically formulated to compliment South Asian skin tones perfectly.",
    stock: 120,
    badge: "",
    rating: 4.8,
    reviewCount: 890
  },
  {
    name: "Silk Glow Foundation",
    price: 42.00,
    category: "Makeup",
    images: ["https://images.unsplash.com/photo-1512496115841-db0aaf528c1c?q=80&w=800&auto=format&fit=crop"],
    description: "Weightless, medium-to-full coverage foundation that mimics the texture of real skin. Breathable formula that lasts for 16 hours without oxidizing or settling into fine lines.",
    stock: 45,
    badge: "",
    rating: 4.6,
    reviewCount: 234
  },

  // Haircare
  {
    name: "Lustrous Mane Hair Mask",
    price: 35.00,
    originalPrice: 48.00,
    category: "Haircare",
    images: ["https://images.unsplash.com/photo-1629198688000-71e23ceb11ab?q=80&w=800&auto=format&fit=crop"],
    description: "Deep conditioning treatment with Shea Butter and Hibiscus extracts. Repairs heat damage and restores salon-like shine and bounce to dull, brittle hair.",
    stock: 30,
    badge: "SALE",
    rating: 4.9,
    reviewCount: 187
  },

  // Fragrance
  {
    name: "Midnight in Birtamod EDP",
    price: 95.00,
    category: "Fragrance",
    images: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop"],
    description: "A mysterious blend of night-blooming jasmine, warm sandalwood, and a hint of Himalayan cedar. Our most premium fragrance that lingers beautifully all night long.",
    stock: 10,
    badge: "NEW",
    rating: 5.0,
    reviewCount: 64
  },
  {
    name: "Jade Royale Signature Set",
    price: 150.00,
    originalPrice: 180.00,
    category: "Fragrance",
    images: ["https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=800&auto=format&fit=crop"],
    description: "The ultimate luxury gift box containing our signature perfume, a travel-size face oil, and a limited edition scented candle. The perfect gift for the queen in your life.",
    stock: 5,
    badge: "HOT",
    rating: 4.8,
    reviewCount: 42
  },

  // Clothing
  {
    name: "Silk Royale Saree",
    price: 120.00,
    originalPrice: 150.00,
    category: "Clothing",
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop"],
    description: "Premium hand-woven silk saree with intricate gold embroidery. Perfect for special occasions and weddings, bringing traditional elegance to your wardrobe.",
    stock: 12,
    badge: "NEW",
    rating: 4.9,
    reviewCount: 28
  },
  {
    name: "Embroidered Kurta Set",
    price: 45.00,
    category: "Clothing",
    images: ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=800&auto=format&fit=crop"],
    description: "Breathable cotton kurta set with delicate hand embroidery. Designed for comfort and style in the warm Birtamod afternoons.",
    stock: 35,
    badge: "SALE",
    rating: 4.7,
    reviewCount: 56
  }
];

export async function POST() {
  try {
    await connectToDatabase();
    
    // Clear existing products
    await Product.deleteMany({});
    
    // Insert samples
    const inserted = await Product.insertMany(sampleProducts);
    
    return NextResponse.json({ success: true, count: inserted.length, message: "Database seeded with detailed products successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
