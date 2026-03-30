"use client";

import { useEffect, useState, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatPrice } from "@/lib/currency";

export default function ProductDetail() {
  const params = useParams();
  const id = params.id as string;
  const { addToCart } = useCart();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number | null>(
    null,
  );
  const { data: session } = useSession();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isMagnifierVisible, setIsMagnifierVisible] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const magnifierBoxSize = 120;
  const zoomLevel = 3.2;
  const zoomPreviewSize = 520;

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
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
      
    if (session) {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data.wishlist) {
            const inWishlist = data.data.wishlist.some((item: any) => 
               typeof item === 'string' ? item === id : item._id === id
            );
            setIsWishlisted(inWishlist);
          }
        });
    }
  }, [id, session]);

  if (loading)
    return (
      <div className="min-h-[80vh] flex items-center justify-center font-serif text-2xl text-[var(--color-jade-pink)] animate-pulse bg-[var(--jade-bg)]">
        Loading Details...
      </div>
    );
  if (!product)
    return (
      <div className="min-h-[80vh] flex items-center justify-center font-serif text-2xl text-[var(--jade-text)] bg-[var(--jade-bg)]">
        Product not found.
      </div>
    );

  const variants = product.variants || [];
  const variantMode: "color" | "shade" =
    product.variantType ||
    (variants.some((v: any) => Boolean(v.shadeName)) ? "shade" : "color");

  const currentVariant =
    selectedVariantIdx !== null ? variants[selectedVariantIdx] : null;
  const displayImages =
    currentVariant?.images && currentVariant.images.length > 0
      ? currentVariant.images
      : product.images;
  const displayPrice = currentVariant ? currentVariant.price : product.price;
  const discountPercent =
    product.originalPrice > displayPrice
      ? Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100)
      : 0;

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
      name: finalName,
      price: displayPrice,
      qty: qty,
      image: finalImage,
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
        await fetch(`/api/user/wishlist?productId=${product._id}`, { method: 'DELETE' });
        setIsWishlisted(false);
      } else {
        await fetch('/api/user/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product._id }),
        });
        setIsWishlisted(true);
      }
    } catch (e) {
      console.error(e);
    }
    setWishlistLoading(false);
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
        <div className="relative flex gap-4 items-start">
          {/* Gallery Thumbnails */}
          {displayImages.length > 1 && (
            <div className="flex flex-col gap-3 h-[450px] md:h-[600px] overflow-y-auto pr-1 scrollbar-none">
              {displayImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIdx(idx)}
                  className={`w-16 md:w-20 h-20 md:h-24 shrink-0 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border-2 transition-all ${currentImageIdx === idx ? "border-[var(--color-jade-pink)] brightness-100" : "border-transparent brightness-75 hover:brightness-100"}`}
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
            className="relative flex-1 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center p-10 h-[450px] md:h-[600px] border border-transparent dark:border-gray-800 overflow-hidden group"
            onMouseEnter={() => setIsMagnifierVisible(true)}
            onMouseLeave={() => setIsMagnifierVisible(false)}
            onMouseMove={(e) => {
              const rect = imageContainerRef.current?.getBoundingClientRect();
              if (!rect) return;
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              setMagnifierPos({ x, y });
            }}
          >
            {product.badge && (
              <span
                className={`absolute top-6 left-6 text-sm font-bold text-white px-3 py-1 rounded-sm z-10 ${product.badge === "SALE" ? "bg-red-500" : product.badge === "NEW" ? "bg-gray-900" : "bg-[var(--color-jade-pink)]"}`}
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
                  src={displayImages[currentImageIdx]}
                  alt={`${product.name} preview`}
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-all duration-300 select-none"
                  draggable={false}
                  style={{ pointerEvents: "none" }}
                />
                {/* Magnifier box overlay */}
                {isMagnifierVisible && (
                  <div
                    style={{
                      position: "absolute",
                      left: Math.max(
                        0,
                        Math.min(
                          magnifierPos.x - magnifierBoxSize / 2,
                          (imageContainerRef.current?.offsetWidth || 0) -
                            magnifierBoxSize,
                        ),
                      ),
                      top: Math.max(
                        0,
                        Math.min(
                          magnifierPos.y - magnifierBoxSize / 2,
                          (imageContainerRef.current?.offsetHeight || 0) -
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
              <div className="text-[var(--jade-muted)]">No image available</div>
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
                backgroundPosition: `${Math.max(0, Math.min((magnifierPos.x / (imageContainerRef.current?.offsetWidth || 1)) * 100, 100))}% ${Math.max(0, Math.min((magnifierPos.y / (imageContainerRef.current?.offsetHeight || 1)) * 100, 100))}%`,
                boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)",
              }}
            />
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <nav className="text-sm text-[var(--jade-muted)] font-medium mb-6">
            Home / {product.category} /{" "}
            <span className="text-[var(--jade-text)]">{product.name}</span>
          </nav>

          <h1 className="font-serif text-4xl md:text-5xl text-[var(--jade-text)] mb-4">
            {product.name}
          </h1>

          <div className="flex items-end gap-3 mb-8">
            <span className="text-4xl font-semibold text-[var(--color-jade-pink)]">
              {formatPrice(displayPrice)}
            </span>
            {product.originalPrice > 0 &&
              product.originalPrice > displayPrice && (
                <>
                  <span className="text-2xl text-[var(--jade-muted-strong)] line-through mb-1 opacity-70">
                    {formatPrice(product.originalPrice)}
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
              <h4 className="text-sm font-semibold uppercase tracking-widest text-[var(--jade-text)] mb-4">
                {variantMode === "shade" ? "Shade" : "Color"}:{" "}
                <span className="text-[var(--jade-muted)]">
                  {variantMode === "shade"
                    ? currentVariant?.shadeName || currentVariant?.colorName
                    : currentVariant?.colorName || currentVariant?.shadeName}
                </span>
              </h4>
              {variantMode === "shade" ? (
                <div className="flex flex-wrap gap-5">
                  {variants.map((variant: any, idx: number) => {
                    const shadeLabel = variant.shadeName || variant.colorName;
                    const shadeImage =
                      variant.images?.[0] || product.images?.[0] || "";

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedVariantIdx(idx);
                          setCurrentImageIdx(0);
                        }}
                        className="flex flex-col items-center gap-2 group w-[72px]"
                        title={shadeLabel}
                        type="button"
                      >
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 transition-all flex items-center justify-center bg-[var(--jade-bg)] ${selectedVariantIdx === idx ? "border-[var(--color-jade-pink)] shadow-md scale-110" : "border-[var(--jade-border)] group-hover:border-[var(--color-jade-pink)]"}`}>
                          {shadeImage ? (
                            <img
                              src={shadeImage}
                              alt={shadeLabel}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-[var(--jade-muted)]">No img</span>
                          )}
                        </div>
                        <p className={`text-xs font-medium text-center line-clamp-2 mt-1 ${selectedVariantIdx === idx ? "text-[var(--color-jade-pink)]" : "text-[var(--jade-text)] group-hover:text-[var(--color-jade-pink)]"}`}>
                          {shadeLabel}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex gap-3 flex-wrap">
                  {variants.map((variant: any, idx: number) => (
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
                      <span className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></span>
                      <span className="absolute top-1 right-2 w-3 h-3 bg-white/40 rounded-full blur-[1px]"></span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}



          <div className="space-y-6 max-w-md">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-xl h-14 bg-[var(--jade-card)]">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-5 text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] transition-colors h-full"
                >
                  <Minus size={18} />
                </button>
                <span className="w-8 text-center font-medium text-lg text-[var(--jade-text)]">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="px-5 text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] transition-colors h-full"
                >
                  <Plus size={18} />
                </button>
              </div>
              <button 
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className={`w-14 h-14 flex items-center justify-center border rounded-xl transition-all font-medium bg-[var(--jade-card)] group ${isWishlisted ? 'border-red-500 text-red-500' : 'border-gray-200 dark:border-gray-800 text-[var(--jade-text)] hover:text-red-500 hover:border-red-500'}`}
              >
                <Heart size={22} className={isWishlisted ? "fill-current" : "group-hover:fill-current"} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-4 border-2 border-[var(--color-jade-pink)] rounded-xl text-[var(--color-jade-pink)] font-semibold uppercase tracking-widest hover:bg-[var(--color-jade-pink)] hover:text-white transition-all shadow-xl shadow-pink-200 flex items-center justify-center gap-3"
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

          <div className="mt-10 pt-8 border-t border-[var(--jade-border)]">
            <h3 className="text-lg font-serif font-semibold text-[var(--jade-text)] mb-4">
              Product Description
            </h3>
            <p className="text-[var(--jade-muted)] leading-relaxed max-w-2xl text-sm md:text-base whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
