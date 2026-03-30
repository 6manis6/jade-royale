"use client";

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter, useParams } from 'next/navigation';
import { Minus, Plus, ShoppingBag, Truck, ShieldCheck, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

export default function ProductDetail() {
  const params = useParams();
  const id = params.id as string;
  const { addToCart } = useCart();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProduct(data.data);
          if (data.data.variants && data.data.variants.length > 0) {
            setSelectedVariantIdx(0);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch product", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center font-serif text-2xl text-[var(--color-jade-pink)] animate-pulse bg-[var(--jade-bg)]">Loading Details...</div>;
  if (!product) return <div className="min-h-[80vh] flex items-center justify-center font-serif text-2xl text-[var(--jade-text)] bg-[var(--jade-bg)]">Product not found.</div>;

  const currentVariant = selectedVariantIdx !== null ? product.variants[selectedVariantIdx] : null;
  const displayImages = currentVariant?.images && currentVariant.images.length > 0 ? currentVariant.images : product.images;
  const displayPrice = currentVariant ? currentVariant.price : product.price;

  const handleAddToCart = () => {
    const finalProductId = currentVariant ? `${product._id}-${currentVariant.colorName}`.replace(/\s+/g, '-') : product._id;
    const finalName = currentVariant ? `${product.name} - ${currentVariant.colorName}` : product.name;
    const finalImage = displayImages[0] || "";

    addToCart({
      productId: finalProductId,
      name: finalName,
      price: displayPrice,
      qty: qty,
      image: finalImage
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const nextImage = () => {
    setCurrentImageIdx((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIdx((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        
        {/* Images Selection Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center p-10 h-[450px] md:h-[600px] border border-transparent dark:border-gray-800 overflow-hidden group">
            {product.badge && (
              <span className={`absolute top-6 left-6 text-sm font-bold text-white px-3 py-1 rounded-sm z-10 ${product.badge === 'SALE' ? 'bg-red-500' : product.badge === 'NEW' ? 'bg-gray-900' : 'bg-[var(--color-jade-pink)]'}`}>
                {product.badge}
              </span>
            )}
            
            {displayImages.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-4 bg-white/80 dark:bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 text-black dark:text-white shadow-xl hover:bg-white">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={nextImage} className="absolute right-4 bg-white/80 dark:bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 text-black dark:text-white shadow-xl hover:bg-white">
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {displayImages[currentImageIdx] ? (
              <img 
                src={displayImages[currentImageIdx]} 
                alt={`${product.name} preview`} 
                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-all duration-300"
              />
            ) : (
              <div className="text-[var(--jade-muted)]">No image available</div>
            )}
          </div>
          
          {/* Gallery Thumbnails */}
          {displayImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {displayImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIdx(idx)}
                  className={`w-20 h-24 flex-shrink-0 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border-2 transition-all ${currentImageIdx === idx ? 'border-[var(--color-jade-pink)] brightness-100' : 'border-transparent brightness-75 hover:brightness-100'}`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <nav className="text-sm text-[var(--jade-muted)] font-medium mb-6">
            Home / {product.category} / <span className="text-[var(--jade-text)]">{product.name}</span>
          </nav>
          
          <h1 className="font-serif text-4xl md:text-5xl text-[var(--jade-text)] mb-4">{product.name}</h1>
          
          <div className="flex items-end gap-4 mb-8">
            <span className="text-4xl font-semibold text-[var(--color-jade-pink)]">{formatPrice(displayPrice)}</span>
            {product.originalPrice > 0 && product.originalPrice > displayPrice && (
              <span className="text-2xl text-[var(--jade-muted-strong)] line-through mb-1 opacity-70">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <p className="text-[var(--jade-muted-strong)] dark:text-gray-300 leading-relaxed max-w-lg mb-8 text-sm md:text-base">
            {product.description}
          </p>

          {/* Color Variants Swatches */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-10">
              <h4 className="text-sm font-semibold uppercase tracking-widest text-[var(--jade-text)] mb-4">
                Color: <span className="text-[var(--jade-muted)]">{currentVariant?.colorName}</span>
              </h4>
              <div className="flex gap-3 flex-wrap">
                {product.variants.map((variant: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedVariantIdx(idx);
                      setCurrentImageIdx(0); // Reset gallery index when changing variants
                    }}
                    className={`relative w-12 h-12 rounded-full border-2 transition-all overflow-hidden flex items-center justify-center ${selectedVariantIdx === idx ? 'border-black dark:border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105 shadow-sm'}`}
                    style={{ backgroundColor: variant.colorHex || '#ccc' }}
                    title={variant.colorName}
                  >
                    {/* Inner glowing dot effect to simulate cosmetic reflections */}
                    <span className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></span>
                    <span className="absolute top-1 right-2 w-3 h-3 bg-white/40 rounded-full blur-[1px]"></span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6 max-w-md">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-xl h-14 bg-[var(--jade-card)]">
                <button 
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-5 text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] transition-colors h-full"
                >
                  <Minus size={18} />
                </button>
                <span className="w-8 text-center font-medium text-lg text-[var(--jade-text)]">{qty}</span>
                <button 
                  onClick={() => setQty(q => q + 1)}
                  className="px-5 text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] transition-colors h-full"
                >
                  <Plus size={18} />
                </button>
              </div>
              <button 
                className="w-14 h-14 flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-xl text-[var(--jade-text)] hover:text-red-500 hover:border-red-500 transition-all font-medium bg-[var(--jade-card)] group"
              >
                <Heart size={22} className="group-hover:fill-current" />
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

          {/* Guarantees */}
          <div className="mt-12 border-t border-[var(--jade-border)] pt-8 grid grid-cols-2 gap-6">
            <div className="flex gap-4">
              <Truck className="text-[var(--color-jade-pink)]" size={24} />
              <div>
                <h4 className="font-semibold text-sm text-[var(--jade-text)] mb-1 tracking-wide uppercase">Free Shipping</h4>
                <p className="text-xs text-[var(--jade-muted)]">Over Rs 10,000 orders</p>
              </div>
            </div>
            <div className="flex gap-4">
              <ShieldCheck className="text-[var(--color-jade-pink)]" size={24} />
              <div>
                <h4 className="font-semibold text-sm text-[var(--jade-text)] mb-1 tracking-wide uppercase">Original Items</h4>
                <p className="text-xs text-[var(--jade-muted)]">100% Authentic quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
