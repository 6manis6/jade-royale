"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

interface Product {
  _id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  badge?: string;
  stock: number;
  variantType?: "color" | "shade";
  variants?: Array<{
    colorName?: string;
    shadeName?: string;
    stock?: number;
  }>;
}

export default function TrendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?limit=8")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products", err);
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-24 bg-[var(--jade-bg)]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-[var(--jade-text)] mb-4">
            Trending Product
          </h2>
          <div className="w-24 h-1 bg-[var(--color-jade-pink)] mx-auto rounded-full"></div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="animate-pulse flex flex-col items-center p-6 bg-[var(--jade-card)] shrink"
              >
                <div className="w-full h-64 bg-gray-200 dark:bg-gray-800 mb-4 rounded-md"></div>
                <div className="w-3/4 h-6 bg-gray-200 dark:bg-gray-800 mb-2 rounded"></div>
                <div className="w-1/4 h-5 bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-[var(--jade-text)] font-serif text-xl font-bold">
              No trending products available.
            </p>
            <p className="text-sm text-[var(--jade-muted)] mt-2 font-medium">
              Run the seeder or add products in admin.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
