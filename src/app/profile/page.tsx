"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { User, Package, Heart, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { formatPrice } from "@/lib/currency";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "profile">(
    "orders",
  );
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setProfileData(data.data);
            setProfileForm({
              name: data.data.profile?.name || "",
              email: data.data.profile?.email || "",
              phone: data.data.profile?.phone || "",
              address: data.data.profile?.defaultShippingAddress?.address || "",
              city: data.data.profile?.defaultShippingAddress?.city || "",
            });
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center bg-[var(--jade-bg)] text-[var(--jade-text)]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[var(--color-jade-pink)] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 font-semibold text-[var(--jade-muted)]">
            Loading Profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center bg-[var(--jade-bg)] text-[var(--jade-text)]">
        <p>Failed to load profile data.</p>
      </div>
    );
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: profileForm.phone,
          address: profileForm.address,
          city: profileForm.city,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        alert(data.error || "Failed to update profile");
      } else {
        setProfileData((prev: any) => ({
          ...prev,
          profile: {
            ...prev.profile,
            phone: data.data?.phone || profileForm.phone,
            defaultShippingAddress: {
              address:
                data.data?.defaultShippingAddress?.address ||
                profileForm.address,
              city: data.data?.defaultShippingAddress?.city || profileForm.city,
            },
          },
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[var(--jade-bg)] text-[var(--jade-text)]">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-[var(--jade-card)] rounded-2xl p-6 border border-[var(--jade-border)] shadow-sm sticky top-28">
              <div className="flex flex-col items-center mb-6 pb-6 border-b border-[var(--jade-border)] text-center">
                <div className="w-20 h-20 bg-[var(--color-jade-pink)] text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4">
                  {profileData.profile.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-serif text-[var(--jade-text)] font-semibold mb-1">
                  {profileData.profile.name}
                </h2>
                <p className="text-sm text-[var(--jade-muted)] truncate max-w-full">
                  {profileData.profile.email}
                </p>
              </div>

              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "orders" ? "bg-[var(--color-jade-pink)]/10 text-[var(--color-jade-pink)]" : "text-[var(--jade-text)] hover:bg-[var(--jade-bg)]"}`}
                >
                  <Package size={20} /> My Orders
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "profile" ? "bg-[var(--color-jade-pink)]/10 text-[var(--color-jade-pink)]" : "text-[var(--jade-text)] hover:bg-[var(--jade-bg)]"}`}
                >
                  <User size={20} /> Profile
                </button>
                <button
                  onClick={() => setActiveTab("wishlist")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "wishlist" ? "bg-[var(--color-jade-pink)]/10 text-[var(--color-jade-pink)]" : "text-[var(--jade-text)] hover:bg-[var(--jade-bg)]"}`}
                >
                  <Heart size={20} /> Wishlist
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-4"
                >
                  <LogOut size={20} /> Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:w-3/4">
            <div className="bg-[var(--jade-card)] rounded-2xl p-6 md:p-8 border border-[var(--jade-border)] shadow-sm min-h-[500px]">
              {activeTab === "orders" && (
                <div>
                  <h3 className="text-2xl font-serif text-[var(--jade-text)] font-semibold mb-6">
                    My Last Orders
                  </h3>

                  {profileData.orders.length === 0 ? (
                    <div className="text-center py-12 flex flex-col items-center bg-[var(--jade-bg)] rounded-xl border border-dashed border-[var(--jade-border)]">
                      <Package
                        size={48}
                        className="text-[var(--jade-muted-strong)] mb-4"
                      />
                      <p className="text-[var(--jade-muted)] font-medium">
                        You haven't placed any orders yet.
                      </p>
                      <button
                        onClick={() => router.push("/shop")}
                        className="mt-4 px-6 py-2 bg-[var(--color-jade-pink)] text-white font-medium rounded-lg hover:bg-black transition-colors"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {profileData.orders.map((order: any, idx: number) => (
                        <div
                          key={idx}
                          className="border border-[var(--jade-border)] rounded-xl overflow-hidden"
                        >
                          <div className="bg-[var(--jade-bg)] px-4 py-3 md:px-6 md:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--jade-border)]">
                            <div>
                              <p className="text-xs font-semibold text-[var(--jade-muted)] uppercase tracking-wider mb-1">
                                Order Placed
                              </p>
                              <p className="text-sm font-medium text-[var(--jade-text)]">
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-[var(--jade-muted)] uppercase tracking-wider mb-1">
                                Total Amount
                              </p>
                              <p className="text-sm font-medium text-[var(--color-jade-pink)]">
                                {formatPrice(order.totalAmount)}
                              </p>
                            </div>
                            <div className="sm:text-right">
                              <p className="text-xs font-semibold text-[var(--jade-muted)] uppercase tracking-wider mb-1">
                                Status
                              </p>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                  order.status === "Delivered"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : order.status === "Pending"
                                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                      : order.status === "Cancelled"
                                        ? "bg-red-100 text-red-800 border-red-200"
                                        : "bg-blue-100 text-blue-800 border-blue-200"
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                          </div>

                          <div className="p-4 md:p-6 bg-[var(--jade-card)]">
                            <div className="space-y-4">
                              {order.items.map((item: any, iIdx: number) => (
                                <div
                                  key={iIdx}
                                  className="flex gap-4 items-center"
                                >
                                  <div className="w-16 h-16 bg-[var(--jade-bg)] rounded-lg overflow-hidden border border-[var(--jade-border)] shrink-0 p-1 flex items-center justify-center">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  </div>
                                  <div className="flex-grow">
                                    <p className="text-sm font-semibold text-[var(--jade-text)] line-clamp-1">
                                      {item.name}
                                    </p>
                                    <p className="text-sm text-[var(--jade-muted)]">
                                      Qty: {item.qty}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-[var(--jade-text)]">
                                      {formatPrice(item.price)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "profile" && (
                <div>
                  <h3 className="text-2xl font-serif text-[var(--jade-text)] font-semibold mb-6">
                    Default Shipping Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-sm font-medium text-[var(--jade-text)]">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profileForm.name}
                        readOnly
                        className="w-full bg-[var(--jade-bg)] border border-[var(--jade-border)] rounded px-4 py-3 text-[var(--jade-text)] opacity-70"
                      />
                    </div>
                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-sm font-medium text-[var(--jade-text)]">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileForm.email}
                        readOnly
                        className="w-full bg-[var(--jade-bg)] border border-[var(--jade-border)] rounded px-4 py-3 text-[var(--jade-text)] opacity-70"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--jade-text)]">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        className="w-full bg-[var(--jade-bg)] border border-[var(--jade-border)] rounded px-4 py-3 text-[var(--jade-text)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--jade-text)]">
                        City / District
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={profileForm.city}
                        onChange={handleProfileChange}
                        className="w-full bg-[var(--jade-bg)] border border-[var(--jade-border)] rounded px-4 py-3 text-[var(--jade-text)]"
                      />
                    </div>
                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-sm font-medium text-[var(--jade-text)]">
                        Detailed Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={profileForm.address}
                        onChange={handleProfileChange}
                        className="w-full bg-[var(--jade-bg)] border border-[var(--jade-border)] rounded px-4 py-3 text-[var(--jade-text)]"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleProfileSave}
                    disabled={savingProfile}
                    className="mt-6 px-6 py-3 bg-[var(--color-jade-pink)] text-white font-semibold rounded-xl hover:bg-black transition-colors disabled:opacity-60"
                  >
                    {savingProfile ? "Saving..." : "Save Default Address"}
                  </button>
                </div>
              )}

              {activeTab === "wishlist" && (
                <div>
                  <h3 className="text-2xl font-serif text-[var(--jade-text)] font-semibold mb-6">
                    My Wishlist
                  </h3>

                  {profileData.wishlist.length === 0 ? (
                    <div className="text-center py-12 flex flex-col items-center bg-[var(--jade-bg)] rounded-xl border border-dashed border-[var(--jade-border)]">
                      <Heart
                        size={48}
                        className="text-[var(--jade-muted-strong)] mb-4"
                      />
                      <p className="text-[var(--jade-muted)] font-medium">
                        Your wishlist is empty.
                      </p>
                      <button
                        onClick={() => router.push("/shop")}
                        className="mt-4 px-6 py-2 bg-[var(--color-jade-pink)] text-white font-medium rounded-lg hover:bg-black transition-colors"
                      >
                        Browse Products
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {profileData.wishlist.map((product: any) => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
