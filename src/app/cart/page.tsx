"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { Minus, Plus, X, ArrowRight, ShieldCheck } from "lucide-react";

export default function CartPage() {
  const { cart, removeFromCart, updateQty, cartTotal } = useCart();

  return (
    <div className="container mx-auto px-4 md:px-8 py-16 min-h-[70vh]">
      <h1 className="font-serif text-4xl md:text-5xl text-[var(--jade-text)] mb-12 text-center md:text-left">
        Shopping Cart
      </h1>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-[var(--jade-card)] rounded-2xl max-w-2xl mx-auto border border-transparent dark:border-gray-800">
          <p className="font-serif text-2xl text-[var(--jade-muted)] dark:text-[var(--jade-muted)] mb-6">
            Your cart is currently empty.
          </p>
          <Link href="/shop" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="flex-1 w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-sm tracking-wider uppercase text-[var(--jade-muted)] dark:text-[var(--jade-muted)]">
                  <th className="pb-4 font-medium">Product</th>
                  <th className="pb-4 font-medium">Price</th>
                  <th className="pb-4 font-medium">Quantity</th>
                  <th className="pb-4 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr
                    key={item.productId}
                    className="border-b border-gray-100 dark:border-gray-800 group"
                  >
                    <td className="py-6">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className=\"text-[var(--jade-text)] hover:text-red-500 transition-colors p-2\"
                        >
                          <X size={18} />
                        </button>
                        <div className="w-20 h-24 bg-[var(--jade-bg)] rounded overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Link
                          href={`/products/${item.productId}`}
                          className="font-medium text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] transition-colors"
                        >
                          {item.name}
                        </Link>
                      </div>
                    </td>
                    <td className="py-6 text-[var(--jade-muted)] font-medium">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="py-6">
                      <div className="inline-flex items-center border border-gray-200 dark:border-gray-700 rounded bg-[var(--jade-card)]">
                        <button
                          onClick={() =>
                            updateQty(item.productId, item.qty - 1)
                          }
                          className="p-2 hover:bg-[var(--jade-bg)] text-[var(--jade-muted)] transition-colors"
                          disabled={item.qty <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-medium text-[var(--jade-text)]">
                          {item.qty}
                        </span>
                        <button
                          onClick={() =>
                            updateQty(item.productId, item.qty + 1)
                          }
                          className="p-2 hover:bg-[var(--jade-bg)] text-[var(--jade-muted)] transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="py-6 text-right font-semibold text-[var(--color-jade-pink)]">
                      ${(item.price * item.qty).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 flex justify-between items-center">
              <Link
                href="/shop"
                className="text-sm font-medium uppercase tracking-wide text-[var(--jade-muted)] hover:text-[var(--color-jade-pink)] transition-colors underline underline-offset-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-[var(--jade-card)] p-8 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm sticky top-24">
              <h2 className="font-serif text-2xl mb-6 border-b border-gray-200 dark:border-gray-700 pb-4 text-[var(--jade-text)]">
                Order Summary
              </h2>

              <div className="flex justify-between items-center mb-4 text-[var(--jade-muted)] dark:text-[var(--jade-muted)]">
                <span>Subtotal</span>
                <span className="font-medium">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-6 text-[var(--jade-muted)] dark:text-[var(--jade-muted)]">
                <span>Shipping</span>
                <span>Calculated next step</span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-8 flex justify-between items-end">
                <span className="font-medium uppercase tracking-widest text-sm text-[var(--jade-text)]">
                  Total
                </span>
                <span className="font-serif text-3xl font-semibold text-[var(--color-jade-pink)]">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm shadow-xl shadow-[var(--color-jade-pink)]/20"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </Link>

              <div className="mt-6 flex items-start gap-3 bg-blue-50/50 dark:bg-blue-900/20 p-4 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                <ShieldCheck
                  className="text-blue-500 shrink-0 mt-0.5"
                  size={18}
                />
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  Secure checkout process. We do not store your payment
                  information on our servers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
