"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type FailureContentProps = {
  reason: string | null;
};

export default function FailureContent({ reason }: FailureContentProps) {
  const searchParams = useSearchParams();
  const message = reason ?? searchParams.get("reason");

  return (
    <div className="bg-(--jade-card) border border-gray-100 dark:border-gray-800 rounded-2xl p-8 max-w-xl w-full text-center">
      <h1 className="font-serif text-3xl text-(--jade-text) mb-3">
        Payment Not Completed
      </h1>
      <p className="text-(--jade-muted) mb-6">
        {message ||
          "Your eSewa payment was not completed. Please try again or choose another method."}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/checkout" className="btn-primary">
          Try Again
        </Link>
        <Link
          href="/shop"
          className="px-6 py-3 rounded-full border border-gray-300 dark:border-gray-700 text-(--jade-text)"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
