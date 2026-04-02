"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function EsewaSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [message, setMessage] = useState("Verifying payment...");
  const data = searchParams.get("data");

  useEffect(() => {
    if (!data) {
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(
          `/api/esewa/verify?data=${encodeURIComponent(data)}`,
        );
        const result = await response.json();

        if (!result.success) {
          setMessage(result.error || "Payment verification failed.");
          return;
        }

        clearCart();
        router.replace(`/order-success?id=${result.data.orderId}`);
      } catch (error: unknown) {
        const nextMessage =
          error instanceof Error
            ? error.message
            : "Payment verification failed.";
        setMessage(nextMessage);
      }
    };

    verify();
  }, [clearCart, data, router]);

  const displayMessage = data
    ? message
    : "Missing eSewa response. Please try again.";

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-(--jade-card) border border-gray-100 dark:border-gray-800 rounded-2xl p-8 max-w-xl w-full text-center">
        <h1 className="font-serif text-3xl text-(--jade-text) mb-3">
          eSewa Payment
        </h1>
        <p className="text-(--jade-muted) mb-6">{displayMessage}</p>
        <Link href="/checkout" className="btn-primary">
          Back to Checkout
        </Link>
      </div>
    </div>
  );
}
