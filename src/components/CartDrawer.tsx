"use client";

import { useCart } from "@/context/CartContext";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/currency";

export default function CartDrawer() {
  const {
    cart,
    removeFromCart,
    updateQty,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
  } = useCart();
  const router = useRouter();

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[var(--jade-card)] z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-serif text-2xl">Shopping Cart</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-[var(--jade-bg)] rounded-full transition-colors text-[var(--jade-text)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-black space-y-4">
              <ShoppingBag size={48} strokeWidth={1} />
              <p>Your cart is empty</p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  router.push("/shop");
                }}
                className="mt-4 btn-secondary"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="flex gap-4">
                <div className="w-20 h-24 bg-[var(--jade-bg)] rounded overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between">
                      <h3 className="font-medium text-[var(--jade-text)] line-clamp-1">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-black hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-[var(--color-jade-pink)] font-medium mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded">
                      <button
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                        className="p-1 px-2 hover:bg-[var(--jade-bg)] text-[var(--jade-muted)]"
                        disabled={item.qty <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm w-8 text-center text-[var(--jade-text)]">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        className="p-1 px-2 hover:bg-[var(--jade-bg)] text-[var(--jade-muted)]"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-[var(--jade-bg)]/50">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-[var(--jade-muted)] uppercase tracking-widest text-sm">
                Subtotal
              </span>
              <span className="font-serif text-2xl font-medium">
                {formatPrice(cartTotal)}
              </span>
            </div>
            <p className="text-xs text-[var(--jade-muted)] mb-6 font-mono">
              Shipping and taxes calculated at checkout.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/cart"
                onClick={() => setIsCartOpen(false)}
                className="btn-secondary w-full text-center"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="btn-primary w-full text-center"
              >
                Checkout Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
