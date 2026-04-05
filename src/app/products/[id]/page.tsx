"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Minus,
  Plus,
  ShoppingBag,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatPrice } from "@/lib/currency";

export default function ProductDetail() {
  const params = useParams();
  const slug = params.id as string;
  const { addToCart } = useCart();
  const router = useRouter();

  type WishlistItem = string | { _id: string };
  type ProductVariant = {
    images?: string[];
    price: number;
    shadeName?: string;
    colorName?: string;
    colorHex?: string;
    stock?: number;
  };
  type Product = {
    _id: string;
    slug?: string;
    name: string;
    category?: string;
    images?: string[];
    price: number;
    stock: number;
    originalPrice?: number;
    badge?: string;
    description?: string;
    variantType?: "color" | "shade";
    variants?: ProductVariant[];
  };
  type ProfileResponse = {
    success: boolean;
    data?: {
      wishlist?: WishlistItem[];
    };
  };
  type ProductResponse = { success: boolean; data?: Product };
  type ProductsResponse = { success: boolean; data?: Product[] };

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number | null>(
    null,
  );
  const { data: session } = useSession();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [suggestedWishlistIds, setSuggestedWishlistIds] = useState(
    new Set<string>(),
  );
  const [suggestedWishlistLoadingIds, setSuggestedWishlistLoadingIds] =
    useState<Set<string>>(new Set());

  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isMagnifierVisible, setIsMagnifierVisible] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const [imageBounds, setImageBounds] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const magnifierBoxSize = 120;
  const zoomLevel = 3.2;
  const zoomPreviewSize = 520;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((res) => res.json() as Promise<ProductResponse>)
      .then((data) => {
        if (data.success && data.data) {
          setProduct(data.data);
          if (data.data.variants && data.data.variants.length > 0) {
            setSelectedVariantIdx(0);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch product", err);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (!session) {
      queueMicrotask(() => {
        setIsWishlisted(false);
        setSuggestedWishlistIds(new Set());
      });
      return;
    }

    fetch("/api/user/profile")
      .then((res) => res.json() as Promise<ProfileResponse>)
      .then((data) => {
        if (data.success && data.data?.wishlist) {
          const wishlistIds = new Set<string>(
            data.data.wishlist.map((item) =>
              typeof item === "string" ? item : String(item._id),
            ),
          );
          setSuggestedWishlistIds(wishlistIds);
        }
      });
  }, [session]);

  useEffect(() => {
    if (!product) {
      setIsWishlisted(false);
      return;
    }
    setIsWishlisted(suggestedWishlistIds.has(product._id));
  }, [product, suggestedWishlistIds]);

  const currentProductId = product?._id;

  useEffect(() => {
    fetch("/api/products?limit=30")
      .then((res) => res.json() as Promise<ProductsResponse>)
      .then((data) => {
        if (!data.success || !Array.isArray(data.data)) return;

        const filtered = currentProductId
          ? data.data.filter((p) => p._id !== currentProductId)
          : data.data;
        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        setSuggestedProducts(shuffled.slice(0, 4));
      })
      .catch((err) => console.error("Failed to fetch suggested products", err));
  }, [currentProductId]);

  const variants = product?.variants || [];
  const variantMode: "color" | "shade" =
    product?.variantType ||
    (variants.some((v) => Boolean(v.shadeName)) ? "shade" : "color");

  const currentVariant =
    selectedVariantIdx !== null ? variants[selectedVariantIdx] : null;
  const displayImages =
    currentVariant?.images && currentVariant.images.length > 0
      ? currentVariant.images
      : product?.images || [];
  const displayPrice = currentVariant?.price ?? product?.price ?? 0;
  const originalPrice = product?.originalPrice ?? 0;
  const availableStock =
    typeof currentVariant?.stock === "number"
      ? currentVariant.stock
      : (product?.stock ?? 0);
  const isAtStockLimit = availableStock > 0 && qty >= availableStock;
  const isOutOfStock = availableStock <= 0;
  const discountPercent =
    originalPrice > displayPrice
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : 0;

  useEffect(() => {
    if (availableStock > 0) {
      setQty((prev) => Math.min(prev, availableStock));
    }
  }, [availableStock]);

  if (loading)
    return (
      <div className="min-h-[80vh] flex items-center justify-center font-serif text-2xl text-jade-pink animate-pulse bg-(--jade-bg)">
        Loading Details...
      </div>
    );
  if (!product)
    return (
      <div className="min-h-[80vh] flex items-center justify-center font-serif text-2xl text-(--jade-text) bg-(--jade-bg)">
        Product not found.
      </div>
    );

  const handleAddToCart = () => {
    const selectedVariantLabel =
      currentVariant &&
      (variantMode === "shade"
        ? currentVariant.shadeName || currentVariant.colorName
        : currentVariant.colorName || currentVariant.shadeName);

    const finalProductId = currentVariant
      ? `${product._id}-${selectedVariantLabel || "variant"}`.replace(
          /\s+/g,
          "-",
        )
      : product._id;
    const finalName = currentVariant
      ? `${product.name} - ${selectedVariantLabel}`
      : product.name;
    const finalImage = displayImages[0] || "";

    addToCart({
      productId: finalProductId,
      slug: product.slug,
      name: finalName,
      price: displayPrice,
      qty: qty,
      image: finalImage,
      stock: availableStock,
      variantLabel: selectedVariantLabel || undefined,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const toggleWishlist = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await fetch(`/api/user/wishlist?productId=${product._id}`, {
          method: "DELETE",
        });
        setIsWishlisted(false);
      } else {
        await fetch("/api/user/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product._id }),
        });
        setIsWishlisted(true);
      }
    } catch (e) {
      console.error(e);
    }
    setWishlistLoading(false);
  };

  const toggleSuggestedWishlist = async (productId: string) => {
    if (!session) {
      router.push("/login");
      return;
    }

    setSuggestedWishlistLoadingIds((prev) => new Set(prev).add(productId));
    const currentlyWishlisted = suggestedWishlistIds.has(productId);

    try {
      if (currentlyWishlisted) {
        await fetch(`/api/user/wishlist?productId=${productId}`, {
          method: "DELETE",
        });
        setSuggestedWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        await fetch("/api/user/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        setSuggestedWishlistIds((prev) => {
          const next = new Set(prev);
          next.add(productId);
          return next;
        });
      }

      if (productId === product._id) {
        setIsWishlisted(!currentlyWishlisted);
      }
    } catch (e) {
      console.error(e);
    }

    setSuggestedWishlistLoadingIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  const nextImage = () => {
    setCurrentImageIdx((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1,
    );
  };

  const prevImage = () => {
    setCurrentImageIdx((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1,
    );
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Images Selection Gallery */}
        <div className="flex flex-col gap-8">
          <div className="relative flex gap-4 items-start">
            {/* Gallery Thumbnails */}
            {displayImages.length > 1 && (
              <div className="flex flex-col gap-3 h-112.5 md:h-150 overflow-y-auto pr-1 scrollbar-none">
                {displayImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIdx(idx)}
                    className={`w-16 md:w-20 h-20 md:h-24 shrink-0 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border-2 transition-all ${currentImageIdx === idx ? "border-jade-pink brightness-100" : "border-transparent brightness-75 hover:brightness-100"}`}
                  >
                    <img
                      src={img}
                      alt="thumbnail"
                      className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                    />
                  </button>
                ))}
              </div>
            )}

            <div
              ref={imageContainerRef}
              className="relative flex-1 bg-gray-50 dark:bg-white rounded-2xl flex items-center justify-center p-10 h-112.5 md:h-150 border border-transparent overflow-hidden group"
              onMouseEnter={() => setIsMagnifierVisible(true)}
              onMouseLeave={() => setIsMagnifierVisible(false)}
              onMouseMove={(e) => {
                const container = imageContainerRef.current;
                const imageEl = imageRef.current;
                if (!container || !imageEl) return;
                const containerRect = container.getBoundingClientRect();
                const imageRect = imageEl.getBoundingClientRect();
                const elementWidth = imageRect.width;
                const elementHeight = imageRect.height;
                const naturalWidth = imageEl.naturalWidth || elementWidth;
                const naturalHeight = imageEl.naturalHeight || elementHeight;
                const elementRatio = elementWidth / elementHeight;
                const imageRatio = naturalWidth / naturalHeight;

                let displayWidth = elementWidth;
                let displayHeight = elementHeight;
                if (imageRatio > elementRatio) {
                  displayWidth = elementWidth;
                  displayHeight = elementWidth / imageRatio;
                } else {
                  displayHeight = elementHeight;
                  displayWidth = elementHeight * imageRatio;
                }

                const offsetX = (elementWidth - displayWidth) / 2;
                const offsetY = (elementHeight - displayHeight) / 2;
                const boundsLeft =
                  imageRect.left - containerRect.left + offsetX;
                const boundsTop = imageRect.top - containerRect.top + offsetY;

                const x = e.clientX - containerRect.left;
                const y = e.clientY - containerRect.top;
                const clampedX = Math.max(
                  boundsLeft,
                  Math.min(x, boundsLeft + displayWidth),
                );
                const clampedY = Math.max(
                  boundsTop,
                  Math.min(y, boundsTop + displayHeight),
                );

                setImageBounds({
                  left: boundsLeft,
                  top: boundsTop,
                  width: displayWidth,
                  height: displayHeight,
                });
                setMagnifierPos({ x: clampedX, y: clampedY });
              }}
            >
              {product.badge && (
                <span
                  className={`absolute top-6 left-6 text-sm font-bold text-white px-3 py-1 rounded-sm z-10 ${product.badge === "SALE" ? "bg-red-500" : product.badge === "NEW" ? "bg-gray-900" : "bg-jade-pink"}`}
                >
                  {product.badge}
                </span>
              )}

              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 bg-white/80 dark:bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 text-black dark:text-white shadow-xl hover:bg-white"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 bg-white/80 dark:bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 text-black dark:text-white shadow-xl hover:bg-white"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {displayImages[currentImageIdx] ? (
                <>
                  <img
                    ref={imageRef}
                    src={displayImages[currentImageIdx]}
                    alt={`${product.name} preview`}
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-all duration-300 select-none"
                    draggable={false}
                    style={{ pointerEvents: "none" }}
                  />
                  {/* Magnifier box overlay */}
                  {isMagnifierVisible && imageBounds && (
                    <div
                      style={{
                        position: "absolute",
                        left: Math.max(
                          imageBounds.left,
                          Math.min(
                            magnifierPos.x - magnifierBoxSize / 2,
                            imageBounds.left +
                              imageBounds.width -
                              magnifierBoxSize,
                          ),
                        ),
                        top: Math.max(
                          imageBounds.top,
                          Math.min(
                            magnifierPos.y - magnifierBoxSize / 2,
                            imageBounds.top +
                              imageBounds.height -
                              magnifierBoxSize,
                          ),
                        ),
                        width: magnifierBoxSize,
                        height: magnifierBoxSize,
                        border: "2px solid #e91e8c",
                        background: "rgba(255,255,255,0.15)",
                        pointerEvents: "none",
                        zIndex: 20,
                        borderRadius: 8,
                        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
                        transition: "border-color 0.2s",
                      }}
                    />
                  )}
                  {/* Floating zoomed image */}
                </>
              ) : (
                <div className="text-(--jade-muted)">No image available</div>
              )}
            </div>

            {/* Floating zoomed preview (outside overflow-hidden image container) */}
            {isMagnifierVisible && displayImages[currentImageIdx] && (
              <div
                className="hidden lg:block absolute top-0 left-full ml-6 z-30 rounded-xl border"
                style={{
                  width: `min(${zoomPreviewSize}px, 55vw)`,
                  height: `min(${zoomPreviewSize}px, 55vw)`,
                  borderColor: "#e91e8c",
                  backgroundColor: "#fff",
                  backgroundImage: `url(${displayImages[currentImageIdx]})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: `${zoomLevel * 100}%`,
                  backgroundPosition: `${Math.max(0, Math.min(((magnifierPos.x - (imageBounds?.left || 0)) / (imageBounds?.width || 1)) * 100, 100))}% ${Math.max(0, Math.min(((magnifierPos.y - (imageBounds?.top || 0)) / (imageBounds?.height || 1)) * 100, 100))}%`,
                  boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)",
                }}
              />
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <nav className="text-sm text-(--jade-muted) font-medium mb-6">
            Home / {product.category || "Products"} /{" "}
            <span className="text-(--jade-text)">{product.name}</span>
          </nav>

          <h1 className="font-serif text-4xl md:text-5xl text-(--jade-text) mb-4">
            {product.name}
          </h1>

          <div className="flex items-end gap-3 mb-8">
            <span className="text-4xl font-semibold text-jade-pink">
              {formatPrice(displayPrice)}
            </span>
            {originalPrice > 0 && originalPrice > displayPrice && (
              <>
                <span className="text-2xl text-(--jade-muted-strong) line-through mb-1 opacity-70">
                  {formatPrice(originalPrice)}
                </span>
                <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded ml-2 mb-1">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          {/* Product Variants */}
          {variants.length > 0 && (
            <div className="mb-8">
              <h4 className="text-sm font-semibold uppercase tracking-widest text-(--jade-text) mb-4">
                {variantMode === "shade"
                  ? "Shade"
                  : `Color: ${currentVariant?.colorName || currentVariant?.shadeName || ""}`}
              </h4>
              {variantMode === "shade" ? (
                <div className="flex flex-wrap gap-5">
                  {variants.map((variant, idx: number) => {
                    const shadeLabel = variant.shadeName || variant.colorName;
                    const shadeColor = variant.colorHex || "#d1d5db";

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedVariantIdx(idx);
                          setCurrentImageIdx(0);
                        }}
                        className="flex flex-col items-center gap-2 group w-18"
                        title={shadeLabel}
                        type="button"
                      >
                        <div
                          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 transition-all flex items-center justify-center bg-(--jade-bg) ${selectedVariantIdx === idx ? "border-jade-pink shadow-md scale-110" : "border-(--jade-border) group-hover:border-jade-pink"}`}
                          style={{ backgroundColor: shadeColor }}
                        >
                          <span className="absolute inset-0 bg-linear-to-tr from-black/10 to-transparent"></span>
                        </div>
                        <p
                          className={`text-xs font-medium text-center line-clamp-2 mt-1 ${selectedVariantIdx === idx ? "text-jade-pink" : "text-(--jade-text) group-hover:text-jade-pink"}`}
                        >
                          {shadeLabel}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex gap-3 flex-wrap">
                  {variants.map((variant, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedVariantIdx(idx);
                        setCurrentImageIdx(0);
                      }}
                      className={`relative w-12 h-12 rounded-full border-2 transition-all overflow-hidden flex items-center justify-center ${selectedVariantIdx === idx ? "border-black dark:border-white scale-110 shadow-lg" : "border-transparent hover:scale-105 shadow-sm"}`}
                      style={{ backgroundColor: variant.colorHex || "#ccc" }}
                      title={variant.colorName || variant.shadeName}
                      type="button"
                    >
                      <span className="absolute inset-0 bg-linear-to-tr from-black/20 to-transparent"></span>
                      <span className="absolute top-1 right-2 w-3 h-3 bg-white/40 rounded-full blur-[1px]"></span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-6 max-w-md">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-xl h-14 bg-(--jade-card)">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-5 text-(--jade-text) hover:text-jade-pink transition-colors h-full"
                >
                  <Minus size={18} />
                </button>
                <span className="w-8 text-center font-medium text-lg text-(--jade-text)">
                  {qty}
                </span>
                <button
                  onClick={() =>
                    setQty((q) =>
                      availableStock > 0
                        ? Math.min(q + 1, availableStock)
                        : q + 1,
                    )
                  }
                  disabled={isAtStockLimit || isOutOfStock}
                  className={`px-5 text-(--jade-text) transition-colors h-full ${
                    isAtStockLimit || isOutOfStock
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:text-jade-pink"
                  }`}
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="text-sm text-(--jade-muted)">
                {isOutOfStock ? "Out of stock" : `Stock: ${availableStock}`}
              </div>
              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className={`w-14 h-14 flex items-center justify-center border rounded-xl transition-all font-medium bg-(--jade-card) group ${isWishlisted ? "border-red-500 text-red-500" : "border-gray-200 dark:border-gray-800 text-(--jade-text) hover:text-red-500 hover:border-red-500"}`}
              >
                <Heart
                  size={22}
                  className={
                    isWishlisted ? "fill-current" : "group-hover:fill-current"
                  }
                />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-4 border-2 border-jade-pink rounded-xl text-jade-pink font-semibold uppercase tracking-widest hover:bg-jade-pink hover:text-white transition-all shadow-xl shadow-pink-200 flex items-center justify-center gap-3"
            >
              <ShoppingBag size={20} />
              Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              className="w-full py-4 bg-gray-900 rounded-xl border-2 border-gray-900 text-white font-semibold uppercase tracking-widest hover:bg-black hover:border-black transition-all shadow-xl shadow-gray-900/30"
            >
              Buy it Now
            </button>
          </div>
        </div>
      </div>

      <section className="mt-14 pt-8 border-t border-(--jade-border) w-full max-w-full">
        <h3 className="text-2xl font-serif font-semibold text-(--jade-text) mb-5">
          Product Description
        </h3>
        <p className="text-(--jade-muted) leading-relaxed text-sm md:text-base whitespace-pre-wrap wrap-anywhere">
          {product.description || ""}
        </p>
      </section>

      {suggestedProducts.length > 0 && (
        <section className="mt-12">
          <h3 className="font-serif text-2xl text-(--jade-text) mb-4">
            You May Also Like
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {suggestedProducts.map((item) => {
              const itemOriginalPrice = item.originalPrice ?? 0;
              const itemDiscount =
                itemOriginalPrice > 0 && itemOriginalPrice > item.price
                  ? Math.round(
                      ((itemOriginalPrice - item.price) / itemOriginalPrice) *
                        100,
                    )
                  : 0;
              const isItemWishlisted = suggestedWishlistIds.has(item._id);
              const isItemWishlistLoading = suggestedWishlistLoadingIds.has(
                item._id,
              );

              return (
                <Link
                  key={item._id}
                  href={`/products/${item.slug || item._id}`}
                  className="group relative border border-(--jade-border) rounded-xl p-3 bg-(--jade-card) hover:shadow-md transition-shadow"
                >
                  {itemDiscount > 0 && (
                    <span className="absolute top-2 left-2 z-10 rounded-full bg-jade-pink px-3.5 py-1.5 text-xs font-semibold text-white">
                      {itemDiscount}% OFF
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void toggleSuggestedWishlist(item._id);
                    }}
                    className={`absolute top-2 right-2 z-10 h-12 w-12 rounded-full border flex items-center justify-center transition-colors ${
                      isItemWishlisted
                        ? "bg-jade-pink text-white border-jade-pink"
                        : "bg-(--jade-card) text-(--jade-text) border-(--jade-border) hover:border-jade-pink"
                    }`}
                    aria-label={
                      isItemWishlisted
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                    }
                    disabled={isItemWishlistLoading}
                  >
                    <Heart
                      className="w-6 h-6"
                      fill={isItemWishlisted ? "currentColor" : "none"}
                    />
                  </button>

                  <div className="w-full aspect-square bg-(--jade-bg) rounded-lg overflow-hidden flex items-center justify-center mb-3">
                    <img
                      src={item.images?.[0] || ""}
                      alt={item.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-sm font-medium text-(--jade-text) line-clamp-2 mb-1">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2">
                    {itemOriginalPrice > 0 &&
                      itemOriginalPrice > item.price && (
                        <span className="text-(--jade-muted) line-through text-xs font-medium opacity-70">
                          {formatPrice(itemOriginalPrice)}
                        </span>
                      )}
                    <span className="text-sm font-semibold text-jade-pink">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
