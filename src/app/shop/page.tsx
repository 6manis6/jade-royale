"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  badge?: string;
}

const categories = [
  "All",
  "Skincare",
  "Makeup",
  "Haircare",
  "Fragrance",
  "Clothing",
];

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categoryParam || "All");

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    setLoading(true);
    const querySearch = searchParams.get("q");

    let url = "/api/products?";
    if (activeCategory !== "All") {
      url += `category=${activeCategory}&`;
    }
    if (querySearch) {
      url += `q=${querySearch}&`;
    }

    fetch(url)
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
  }, [activeCategory]);

  return (
    <div className="container mx-auto px-4 md:px-8 py-16 bg-[var(--jade-bg)]">
      {/* Page Header */}
      <div className="text-center mb-16">
        <h1 className="font-serif text-5xl text-[var(--jade-text)] mb-4">
          Our Collection
        </h1>
        <p className="text-[var(--jade-muted)] max-w-2xl mx-auto font-medium">
          Discover premium beauty products designed to enhance your natural
          glow.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 rounded-full border transition-all duration-300 font-medium tracking-wide text-sm ${
              activeCategory === cat
                ? "bg-[var(--color-jade-pink)] border-[var(--color-jade-pink)] text-white shadow-md"
                : "bg-[var(--jade-card)] border-gray-200 dark:border-gray-700 text-[var(--jade-muted)] hover:border-[var(--color-jade-pink)] hover:text-[var(--color-jade-pink)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="animate-pulse flex flex-col items-center p-6 bg-[var(--jade-card)] shrink border border-transparent dark:border-gray-800"
            >
              <div className="w-full h-64 bg-gray-200 dark:bg-gray-800 mb-4 rounded-md"></div>
              <div className="w-3/4 h-6 bg-gray-200 mb-2 rounded"></div>
              <div className="w-1/4 h-5 bg-gray-200 rounded"></div>
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
        <div className="text-center py-20 bg-[var(--jade-card)] rounded-2xl border border-transparent dark:border-gray-800">
          <p className="font-serif text-2xl text-[var(--jade-text)] mb-2 font-bold">
            No products found
          </p>
          <p className="text-[var(--jade-muted)] font-medium">
            Try selecting a different category.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-serif text-2xl text-[var(--color-jade-pink)] animate-pulse">
          Loading Collection...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
