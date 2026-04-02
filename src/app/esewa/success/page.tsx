import { Suspense } from "react";
import Link from "next/link";

import SuccessContent from "./SuccessContent";

export default function EsewaSuccessPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      <Suspense fallback={<SuccessFallback />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}

function SuccessFallback() {
  return (
    <div className="bg-(--jade-card) border border-gray-100 dark:border-gray-800 rounded-2xl p-8 max-w-xl w-full text-center">
      <h1 className="font-serif text-3xl text-(--jade-text) mb-3">
        eSewa Payment
      </h1>
      <p className="text-(--jade-muted) mb-6">Verifying payment...</p>
      <Link href="/checkout" className="btn-primary">
        Back to Checkout
      </Link>
    </div>
  );
}
