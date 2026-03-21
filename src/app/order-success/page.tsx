"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { Suspense } from 'react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4">
      <div className="bg-[var(--jade-card)] p-10 md:p-16 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl max-w-2xl w-full text-center relative overflow-hidden">
        
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--color-jade-blush)] rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 shadow-inner border border-green-100">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          
          <h1 className="font-serif text-4xl md:text-5xl text-[var(--jade-text)] mb-4">Thank You!</h1>
          <h2 className="text-xl text-[var(--jade-muted)] dark:text-[var(--jade-muted)] font-medium mb-8">Your order has been placed successfully.</h2>
          
          <div className="bg-[var(--jade-bg)] border border-gray-100 dark:border-gray-800 rounded-xl p-6 mb-10 w-full max-w-md">
            <p className="text-sm text-[var(--jade-muted)] uppercase tracking-widest mb-2 font-semibold">Order Reference Number</p>
            <p className="font-mono text-xl text-[var(--color-jade-pink)] font-bold">{orderId || "JDE-PENDING"}</p>
          </div>

          <p className="text-[var(--jade-muted)] mb-10 leading-relaxed max-w-md">
            We've sent a confirmation email to your provided address. Our team is processing your beautiful products right now to dispatch them to Birtamod quickly!
          </p>

          <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag size={20} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-jade-pink)]"></div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
