"use client";

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter, useParams } from 'next/navigation';
import { Minus, Plus, ShoppingBag, Truck, ShieldCheck, Heart } from 'lucide-react';

export default function ProductDetail() {
  const params = useParams();
  const id = params.id as string;
  const { addToCart } = useCart();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProduct(data.data);
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

  const handleAddToCart = () => {
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      qty: qty,
      image: product.images[0]
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        
        {/* Images */}
        <div className="relative bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center p-10 h-[500px] md:h-[700px] border border-transparent dark:border-gray-800">
          {product.badge && (
            <span className={`absolute top-6 left-6 text-sm font-bold text-white px-3 py-1 rounded-sm z-10 ${product.badge === 'SALE' ? 'bg-red-500' : product.badge === 'NEW' ? 'bg-gray-900' : 'bg-[var(--color-jade-pink)]'}`}>
              {product.badge}
            </span>
          )}
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <nav className="text-sm text-[var(--jade-muted)] dark:text-[var(--jade-muted)] mb-6 font-medium">
            Home / {product.category} / <span className="text-gray-900 dark:text-white">{product.name}</span>
          </nav>
          
          <h1 className="font-serif text-4xl md:text-5xl text-[var(--jade-text)] mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex text-[var(--color-jade-pink)]">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300 dark:text-gray-700'}`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-[var(--jade-muted)] dark:text-[var(--jade-muted)]">({product.reviewCount} Reviews)</span>
          </div>

          <div className="flex items-end gap-4 mb-8">
            <span className="text-4xl font-semibold text-[var(--color-jade-pink)]">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-2xl text-[var(--jade-muted)] line-through mb-1">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          <p className="text-[var(--jade-text)] dark:text-[var(--jade-text)] leading-relaxed max-w-lg mb-10">
            {product.description}
          </p>

          <div className="space-y-6 max-w-md">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-sm h-14">
                <button 
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-5 text-[var(--jade-muted)] hover:text-[var(--color-jade-pink)] transition-colors h-full"
                >
                  <Minus size={18} />
                </button>
                <span className="w-8 text-center font-medium text-lg text-[var(--jade-text)]">{qty}</span>
                <button 
                  onClick={() => setQty(q => q + 1)}
                  className="px-5 text-[var(--jade-muted)] hover:text-[var(--color-jade-pink)] transition-colors h-full"
                >
                  <Plus size={18} />
                </button>
              </div>
              <button 
                className="w-14 h-14 flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-sm text-[var(--jade-text)] hover:text-red-500 hover:border-red-500 transition-all font-medium"
              >
                <Heart size={22} className="hover:fill-current" />
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              className="w-full py-4 border-2 border-[var(--color-jade-pink)] text-[var(--color-jade-pink)] font-semibold uppercase tracking-widest hover:bg-[var(--color-jade-pink)] hover:text-white transition-colors flex items-center justify-center gap-3"
            >
              <ShoppingBag size={20} />
              Add to Cart
            </button>
            
            <button 
              onClick={handleBuyNow}
              className="w-full py-4 bg-gray-900 border-2 border-gray-900 text-white font-semibold uppercase tracking-widest hover:bg-black hover:border-black transition-colors shadow-lg shadow-gray-900/20"
            >
              Buy it Now
            </button>
          </div>

          {/* Guarantees */}
          <div className="mt-12 border-t border-gray-100 pt-8 grid grid-cols-2 gap-6">
            <div className="flex gap-4">
              <Truck className="text-[var(--color-jade-pink)]" size={24} />
              <div>
                <h4 className="font-semibold text-sm text-[var(--jade-text)] mb-1 tracking-wide uppercase">Free Shipping</h4>
                <p className="text-xs text-[var(--jade-muted)] dark:text-[var(--jade-muted)]">Over \$100 orders</p>
              </div>
            </div>
            <div className="flex gap-4">
              <ShieldCheck className="text-[var(--color-jade-pink)]" size={24} />
              <div>
                <h4 className="font-semibold text-sm text-[var(--jade-text)] mb-1 tracking-wide uppercase">Original Items</h4>
                <p className="text-xs text-[var(--jade-muted)] dark:text-[var(--jade-muted)]">100% Authentic quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
