"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  badge?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.images[0],
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.images[0],
    });
    router.push("/checkout");
  };

  return (
    <Link
      href={`/products/${product._id}`}
      className="group relative block bg-[var(--jade-card)] hover:shadow-xl transition-all duration-300 border border-transparent dark:border-gray-800"
    >
      {/* Product Image Area */}
      <div className="relative h-80 bg-[var(--jade-bg)] dark:bg-gray-900/50 overflow-hidden flex items-center justify-center p-6">
        {product.badge && (
          <span
            className={`absolute top-4 left-4 text-xs font-bold text-white px-2 py-1 rounded-sm z-10 ${product.badge === "SALE" ? "bg-red-500" : product.badge === "NEW" ? "bg-gray-900" : "bg-[var(--color-jade-pink)]"}`}
          >
            {product.badge}
          </span>
        )}

        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />

        {/* Hover Actions overlay */}
        <div className="absolute bottom-[-100px] left-0 w-full p-4 flex gap-2 group-hover:bottom-0 transition-all duration-300 bg-gradient-to-t from-[var(--jade-card)]/90 to-transparent">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-[var(--jade-card)] border border-[var(--color-jade-pink)] text-[var(--color-jade-pink)] py-2 text-sm font-medium uppercase tracking-wider hover:bg-[var(--color-jade-pink)] hover:text-white transition-colors"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-[var(--color-jade-pink)] text-white py-2 text-sm font-medium uppercase tracking-wider hover:bg-black transition-colors"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="text-center p-6">
        <h3 className="font-serif text-lg text-[var(--jade-text)] group-hover:text-[var(--color-jade-pink)] transition-colors mb-1">
          {product.name}
        </h3>
        <div className="flex items-center justify-center gap-2">
          {product.originalPrice && (
            <span className="text-[var(--jade-muted)] line-through text-sm font-medium opacity-60">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
          <span className="text-[var(--color-jade-pink)] font-semibold">
            ${product.price.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
