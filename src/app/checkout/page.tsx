"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { CheckCircle, Truck, Wallet, Info } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { useSession } from "next-auth/react";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { status } = useSession();
  const shippingFee = 180;
  const totalWithShipping = cartTotal + shippingFee;
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });
  const [profileEmail, setProfileEmail] = useState("");
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "esewa">("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout");
    }
  }, [router, status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const profile = data.data?.profile || {};
          const defaultAddress = profile.defaultShippingAddress || {};
          setFormData({
            name: profile.name || "",
            phone: profile.phone || "",
            address: defaultAddress.address || "",
            city: defaultAddress.city || "",
          });
          setProfileEmail(profile.email || "");

          const missingDefaults =
            !profile.phone || !defaultAddress.address || !defaultAddress.city;
          setSaveAsDefault(missingDefaults);
        }
        setProfileLoaded(true);
      })
      .catch((err) => {
        console.error(err);
        setProfileLoaded(true);
      });
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-(--jade-bg) text-(--jade-text)">
        Loading...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-(--jade-bg)">
        <h1 className="font-serif text-3xl mb-4 text-(--jade-text)">
          Your cart is empty
        </h1>
        <p className="text-(--jade-muted) mb-8">
          Please add products to your cart before proceeding to checkout.
        </p>
        <button onClick={() => router.push("/shop")} className="btn-primary">
          Go to Shop
        </button>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (saveAsDefault) {
        const profileRes = await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
          }),
        });
        const profileData = await profileRes.json();
        if (!profileData.success) {
          setError(profileData.error || "Failed to save default address");
          setLoading(false);
          return;
        }
      }

      if (paymentMethod === "esewa") {
        const response = await fetch("/api/esewa/init", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: cart,
            customer: formData,
            totalAmount: totalWithShipping,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          setError(data.error || "Failed to initiate eSewa payment");
          setLoading(false);
          return;
        }

        const { formUrl, payload } = data.data;
        const form = document.createElement("form");
        form.method = "POST";
        form.action = formUrl;

        Object.entries(payload).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        return;
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          customer: formData,
          paymentMethod,
          totalAmount: totalWithShipping,
        }),
      });

      const data = await response.json();

      if (data.success) {
        clearCart();
        router.push(`/order-success?id=${data.data._id}`);
      } else {
        setError(data.error || "Failed to place order");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during checkout");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 bg-(--jade-bg)">
      <h1 className="font-serif text-4xl text-(--jade-text) mb-10">Checkout</h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-8 flex items-center gap-3 border border-red-100 dark:border-red-900/30">
          <Info size={20} />
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 order-2 lg:order-1">
          <form onSubmit={handlePlaceOrder} className="space-y-10">
            {/* Shipping Info */}
            <div className="bg-(--jade-card) p-8 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="font-serif text-2xl mb-6 text-(--jade-text)">
                Delivery Information
              </h2>

              {profileLoaded &&
                (!formData.phone || !formData.address || !formData.city) && (
                  <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    Set your default shipping address and phone to speed up
                    checkout next time.
                  </div>
                )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-sm font-medium text-(--jade-text)">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-(--jade-bg) border border-gray-300 dark:border-gray-700 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-jade-pink focus:border-jade-pink transition-all text-(--jade-text)"
                  />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-sm font-medium text-(--jade-text)">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    readOnly
                    className="w-full bg-(--jade-bg) border border-gray-300 dark:border-gray-700 rounded px-4 py-3 text-(--jade-text) opacity-70"
                  />
                </div>
                <div className="space-y-2 col-span-1">
                  <label className="text-sm font-medium text-(--jade-text)">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-(--jade-bg) border border-gray-300 dark:border-gray-700 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-jade-pink focus:border-jade-pink transition-all text-(--jade-text)"
                  />
                </div>
                <div className="space-y-2 col-span-1">
                  <label className="text-sm font-medium text-(--jade-text)">
                    City / District *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-(--jade-bg) border border-gray-300 dark:border-gray-700 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-jade-pink focus:border-jade-pink transition-all text-(--jade-text)"
                  />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-sm font-medium text-(--jade-text)">
                    Detailed Address (House No, Street) *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-(--jade-bg) border border-gray-300 dark:border-gray-700 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-jade-pink focus:border-jade-pink transition-all text-(--jade-text)"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="inline-flex items-center gap-3 text-sm text-(--jade-text)">
                    <input
                      type="checkbox"
                      checked={saveAsDefault}
                      onChange={() => setSaveAsDefault((prev) => !prev)}
                      className="h-4 w-4 rounded border-gray-300 text-jade-pink focus:ring-jade-pink"
                    />
                    Save as default shipping address and phone
                  </label>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-(--jade-card) p-8 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="font-serif text-2xl mb-6 text-(--jade-text)">
                Payment Method
              </h2>

              <div className="space-y-4">
                <label
                  className={`block border ${paymentMethod === "cod" ? "border-jade-pink bg-pink-50/30 dark:bg-pink-900/10" : "border-gray-200 dark:border-gray-800"} rounded-lg p-5 cursor-pointer transition-colors relative`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="text-jade-pink focus:ring-jade-pink w-5 h-5"
                    />
                    <Truck
                      className={
                        paymentMethod === "cod"
                          ? "text-jade-pink"
                          : "text-(--jade-muted-strong)"
                      }
                      size={24}
                    />
                    <div>
                      <h3 className="font-semibold text-(--jade-text)">
                        Cash on Delivery (COD)
                      </h3>
                      <p className="text-sm text-(--jade-muted) mt-1">
                        Pay when you receive the product at your doorstep.
                      </p>
                    </div>
                  </div>
                  {paymentMethod === "cod" && (
                    <div className="absolute top-1/2 right-6 -translate-y-1/2 text-jade-pink">
                      <CheckCircle size={20} />
                    </div>
                  )}
                </label>

                <label
                  className={`block border ${paymentMethod === "esewa" ? "border-green-500 bg-green-50/20 dark:bg-green-900/10" : "border-gray-200 dark:border-gray-800"} rounded-lg p-5 cursor-pointer transition-colors relative`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="esewa"
                      checked={paymentMethod === "esewa"}
                      onChange={() => setPaymentMethod("esewa")}
                      className="text-green-600 focus:ring-green-500 w-5 h-5"
                    />
                    <Wallet
                      className={
                        paymentMethod === "esewa"
                          ? "text-green-600"
                          : "text-(--jade-muted-strong)"
                      }
                      size={24}
                    />
                    <div>
                      <h3 className="font-semibold text-(--jade-text)">
                        Pay via eSewa
                      </h3>
                      <p className="text-sm text-(--jade-muted) mt-1">
                        Send payment securely using your eSewa mobile wallet.
                      </p>
                    </div>
                  </div>
                  {paymentMethod === "esewa" && (
                    <div className="absolute top-1/2 right-6 -translate-y-1/2 text-green-600">
                      <CheckCircle size={20} />
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-center py-4 font-semibold uppercase tracking-widest transition-all ${loading ? "bg-gray-300 text-black cursor-not-allowed" : "bg-jade-pink text-white hover:bg-black shadow-lg shadow-(--color-jade-pink)/30"}`}
            >
              {loading ? "Processing Order..." : "Place Order Now"}
            </button>
          </form>
        </div>

        {/* Order Summary sidebar */}
        <div className="w-full lg:w-112.5 shrink-0 order-1 lg:order-2">
          <div className="bg-(--jade-card) p-8 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm sticky top-24">
            <h2 className="font-serif text-2xl mb-6 border-b border-gray-200 dark:border-gray-800 pb-4 text-(--jade-text)">
              Order Summary
            </h2>

            <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.productId} className="flex gap-4 items-center">
                  <div className="relative w-16 h-20 bg-(--jade-bg) border border-gray-200 dark:border-gray-700 rounded overflow-hidden shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full leading-none shadow-sm">
                      {item.qty}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-(--jade-text) text-sm">
                      {item.name}
                    </h4>
                  </div>
                  <div className="text-sm font-medium text-(--jade-muted)">
                    {formatPrice(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mb-4 text-(--jade-muted) text-sm">
              <span>Subtotal</span>
              <span className="font-medium text-(--jade-text)">
                {formatPrice(cartTotal)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-6 text-(--jade-muted) text-sm">
              <span>Shipping</span>
              <span className="text-(--jade-text)">
                {formatPrice(shippingFee)}
              </span>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-6 flex justify-between items-end">
              <span className="font-medium uppercase tracking-widest text-sm text-(--jade-text)">
                Total
              </span>
              <div className="text-right">
                <p className="text-xs text-(--jade-muted) mb-1">NPR</p>
                <span className="font-serif text-3xl font-semibold text-jade-pink">
                  {formatPrice(totalWithShipping)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
