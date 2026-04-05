"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/currency";

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

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const totalStock = product.variants?.length
    ? product.variants.reduce(
        (sum, variant) => sum + (Number(variant.stock) || 0),
        0,
      )
    : product.stock;
  const variantLabel = product.variantType === "shade" ? "Shades" : "Colors";
  const variantStocks = (product.variants || [])
    .filter((variant) => (variant.shadeName || variant.colorName) && variant)
    .slice(0, 4)
    .map((variant) => {
      const name = variant.shadeName || variant.colorName || "";
      const stock = typeof variant.stock === "number" ? variant.stock : 0;
      return `${name}: ${stock}`;
    });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    addToCart({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.images[0],
      stock: totalStock,
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.images[0],
      stock: totalStock,
    });
    router.push("/checkout");
  };

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  return (
    <Link
      href={`/products/${product.slug || product._id}`}
      className="group relative block bg-(--jade-card) hover:shadow-xl transition-all duration-300 border border-transparent dark:border-gray-800"
    >
      {/* Product Image Area */}
      <div className="relative h-80 bg-(--jade-bg) dark:bg-gray-900/50 overflow-hidden flex items-center justify-center p-6">
        {product.badge && (
          <span
            className={`absolute top-4 left-4 text-xs font-bold text-white px-2 py-1 rounded-sm z-10 ${product.badge === "SALE" ? "bg-red-500" : product.badge === "NEW" ? "bg-gray-900" : "bg-jade-pink"}`}
          >
            {product.badge}
          </span>
        )}

        {discountPercent > 0 && (
          <span className="absolute top-4 right-4 text-xs font-bold bg-red-500 text-white px-2 py-1 rounded-sm z-10">
            {discountPercent}% OFF
          </span>
        )}

        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />

        {/* Hover Actions overlay */}
        <div className="absolute -bottom-25 left-0 w-full p-4 flex gap-2 group-hover:bottom-0 transition-all duration-300 bg-linear-to-t from-(--jade-card)/90 to-transparent">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-(--jade-card) border border-jade-pink text-jade-pink py-2 text-sm font-medium uppercase tracking-wider hover:bg-jade-pink hover:text-white transition-colors"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-jade-pink text-white py-2 text-sm font-medium uppercase tracking-wider hover:bg-black transition-colors"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="text-center p-6">
        <h3 className="font-serif text-lg text-(--jade-text) group-hover:text-jade-pink transition-colors mb-1">
          {product.name}
        </h3>
        <div className="flex items-center justify-center gap-2">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-(--jade-muted) line-through text-sm font-medium opacity-60">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <span className="text-jade-pink font-semibold">
            {formatPrice(product.price)}
          </span>
        </div>
        {variantStocks.length > 0 && (
          <p className="text-xs text-(--jade-muted) mt-2">
            {variantLabel}: {variantStocks.join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}
