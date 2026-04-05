"use client";

import { useState, useEffect } from "react";
import { Save, Image as ImageIcon, Plus, Trash2 } from "lucide-react";

type HeroSlide = {
  title: string;
  subtitle: string;
  image: string;
  link: string;
};
type ShopBanner = {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  category: string;
};

const shopBannerCategories = [
  "Skincare",
  "Makeup",
  "Haircare",
  "Fragrance",
  "Clothing",
];

export default function AdminSettings() {
  const [slider, setSlider] = useState<HeroSlide[]>([]);
  const [shopBanners, setShopBanners] = useState<ShopBanner[]>([]);
  const [shopBannerInterval, setShopBannerInterval] = useState(6);
  const [uploadingShopBanner, setUploadingShopBanner] = useState<number | null>(
    null,
  );
  const [adminEmail, setAdminEmail] = useState("");
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [adminActionMessage, setAdminActionMessage] = useState("");
  const [canManageAdmins, setCanManageAdmins] = useState(false);
  const [promoBanner, setPromoBanner] = useState({
    subtitle: "A nature's touch",
    titleHighlight: "Get 20%",
    title: "off on all \ncosmetic cream \npacks",
    description: "Start from",
    priceHighlight: "Rs 80.00",
    link: "/shop",
    image:
      "https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=800&auto=format&fit=crop",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/access")
      .then((res) => res.json())
      .then((data) => {
        setCanManageAdmins(Boolean(data?.isSuperuser));
      })
      .catch(() => {
        setCanManageAdmins(false);
      });

    fetch("/api/settings?key=hero_slider")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setSlider(data.data);
        else setSlider([{ title: "", subtitle: "", image: "", link: "/shop" }]);
      });

    fetch("/api/settings?key=promo_banner")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setPromoBanner(data.data);
      });

    fetch("/api/settings?key=shop_banners")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setShopBanners(data.data);
        else
          setShopBanners([
            {
              title: "",
              subtitle: "",
              image: "",
              link: "/shop",
              category: "Skincare",
            },
          ]);
      });

    fetch("/api/settings?key=shop_banner_interval")
      .then((res) => res.json())
      .then((data) => {
        const value = Number(data?.data);
        if (Number.isFinite(value) && value > 0) {
          setShopBannerInterval(value);
        }
      });
  }, []);

  const handleAdminAccess = async (action: "grant" | "revoke") => {
    if (!adminEmail.trim()) {
      setAdminActionMessage("Please enter an email address.");
      return;
    }

    setAdminActionLoading(true);
    setAdminActionMessage("");
    try {
      const res = await fetch("/api/admin/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail.trim(), action }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAdminActionMessage(data?.error || "Unable to update access.");
      } else {
        setAdminActionMessage(
          action === "grant"
            ? "Admin access granted."
            : "Admin access revoked.",
        );
        setAdminEmail("");
      }
    } catch (err) {
      console.error(err);
      setAdminActionMessage("Unable to update access.");
    }
    setAdminActionLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "hero_slider", value: slider }),
        }),
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "promo_banner", value: promoBanner }),
        }),
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "shop_banners", value: shopBanners }),
        }),
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "shop_banner_interval",
            value: shopBannerInterval,
          }),
        }),
      ]);
      alert("Settings saved successfully!");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const updateSlide = (index: number, field: string, value: string) => {
    const newSlider = [...slider];
    (newSlider[index] as any)[field] = value;
    setSlider(newSlider);
  };

  const updateShopBanner = (index: number, field: string, value: string) => {
    const nextBanners = [...shopBanners];
    (nextBanners[index] as any)[field] = value;
    setShopBanners(nextBanners);
  };

  const handleShopBannerUpload = async (index: number, file: File) => {
    if (!file) return;
    setUploadingShopBanner(index);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.success && data.url) {
        updateShopBanner(index, "image", data.url);
      } else {
        alert(data.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Shop banner upload failed", error);
      alert("Failed to upload image");
    } finally {
      setUploadingShopBanner(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {canManageAdmins && (
        <div className="bg-[var(--jade-card)] p-8 rounded-2xl border border-[var(--jade-border)] shadow-sm space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--jade-muted)] font-semibold">
              Admin Access
            </p>
            <h2 className="text-2xl font-serif text-[var(--jade-text)] mt-2">
              Manage Admin Permissions
            </h2>
            <p className="text-sm text-[var(--jade-muted)] mt-2">
              Grant or revoke admin panel access by email.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="user@example.com"
              className="flex-1 px-4 py-2 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
            />
            <button
              onClick={() => handleAdminAccess("grant")}
              disabled={adminActionLoading}
              className="px-4 py-2 rounded-xl bg-[var(--color-jade-pink)] text-white font-semibold disabled:bg-[var(--jade-border)]"
            >
              Grant Access
            </button>
            <button
              onClick={() => handleAdminAccess("revoke")}
              disabled={adminActionLoading}
              className="px-4 py-2 rounded-xl border border-[var(--jade-border)] text-[var(--jade-text)] font-semibold disabled:text-[var(--jade-muted)]"
            >
              Revoke Access
            </button>
          </div>

          {adminActionMessage && (
            <p className="text-sm text-[var(--jade-muted)]">
              {adminActionMessage}
            </p>
          )}
        </div>
      )}
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--jade-muted)] font-semibold">
          Homepage
        </p>
        <h2 className="text-3xl font-serif text-[var(--jade-text)] mt-2">
          Slider Settings
        </h2>
        <p className="text-[var(--jade-muted)] font-medium tracking-tight mt-2">
          Curate the hero carousel that appears on your storefront.
        </p>
      </div>

      <div className="bg-[var(--jade-card)] p-8 rounded-2xl border border-[var(--jade-border)] shadow-sm space-y-8">
        {slider.length === 0 ? (
          <div className="border border-dashed border-[var(--jade-border)] rounded-2xl p-8 text-center text-[var(--jade-muted)]">
            No slides yet. Add the first slide to get started.
          </div>
        ) : (
          <div className="space-y-6">
            {slider.map((slide, idx) => (
              <div
                key={idx}
                className="p-6 border border-[var(--jade-border)] rounded-2xl bg-[var(--jade-bg)] space-y-4 relative"
              >
                <button
                  onClick={() => setSlider(slider.filter((_, i) => i !== idx))}
                  className="absolute top-4 right-4 text-red-400 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--jade-text)] uppercase tracking-widest">
                      Slide Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
                      value={slide.title}
                      onChange={(e) =>
                        updateSlide(idx, "title", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--jade-text)] uppercase tracking-widest">
                      Subtitle / Badge
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
                      value={slide.subtitle}
                      onChange={(e) =>
                        updateSlide(idx, "subtitle", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-[var(--jade-text)] uppercase tracking-widest">
                      Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://..."
                        className="flex-grow px-4 py-2 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
                        value={slide.image}
                        onChange={(e) =>
                          updateSlide(idx, "image", e.target.value)
                        }
                      />
                      <div className="w-12 h-12 bg-[var(--jade-bg)] border border-[var(--jade-border)] rounded-xl flex items-center justify-center overflow-hidden">
                        {slide.image ? (
                          <img
                            src={slide.image}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon
                            size={20}
                            className="text-[var(--jade-muted)]"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() =>
            setSlider([
              ...slider,
              { title: "", subtitle: "", image: "", link: "/shop" },
            ])
          }
          className="w-full py-3 border-2 border-dashed border-[var(--jade-border)] text-[var(--jade-text)] font-bold uppercase tracking-widest rounded-2xl hover:bg-[var(--jade-bg)] hover:border-[var(--color-jade-pink)] hover:text-[var(--color-jade-pink)] transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add Another Slide
        </button>

        {/* Shop Banner Settings Section */}
        <div className="pt-8 border-t border-[var(--jade-border)]">
          <h3 className="text-xl font-serif text-[var(--jade-text)] mb-6">
            Shop Banner Settings
          </h3>
          <p className="text-[var(--jade-muted)] font-medium tracking-tight mb-6">
            Banners shown on the shop page. "All" shows every banner, while
            category pages only show matching banners.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--jade-text)] uppercase tracking-widest">
                Slide Interval (seconds)
              </label>
              <input
                type="number"
                min={2}
                className="w-full px-4 py-2 bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
                value={shopBannerInterval}
                onChange={(e) =>
                  setShopBannerInterval(
                    Number.isFinite(Number(e.target.value))
                      ? Number(e.target.value)
                      : 6,
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-6">
            {shopBanners.length === 0 ? (
              <div className="border border-dashed border-[var(--jade-border)] rounded-2xl p-8 text-center text-[var(--jade-muted)]">
                No shop banners yet. Add the first banner to get started.
              </div>
            ) : (
              shopBanners.map((banner, idx) => (
                <div
                  key={idx}
                  className="p-6 border border-[var(--jade-border)] rounded-2xl bg-[var(--jade-bg)] space-y-4 relative"
                >
                  <button
                    onClick={() =>
                      setShopBanners(shopBanners.filter((_, i) => i !== idx))
                    }
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--jade-text)] uppercase tracking-widest">
                        Category
                      </label>
                      <select
                        className="w-full px-4 py-2 bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
                        value={banner.category}
                        onChange={(e) =>
                          updateShopBanner(idx, "category", e.target.value)
                        }
                      >
                        {shopBannerCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--jade-text)] uppercase tracking-widest">
                        Link
                      </label>
                      <input
                        type="text"
                        placeholder="/shop"
                        className="w-full px-4 py-2 bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
                        value={banner.link}
                        onChange={(e) =>
                          updateShopBanner(idx, "link", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-[var(--jade-text)] uppercase tracking-widest">
                        Image URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://..."
                          className="flex-grow px-4 py-2 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
                          value={banner.image}
                          onChange={(e) =>
                            updateShopBanner(idx, "image", e.target.value)
                          }
                        />
                        <div className="w-12 h-12 bg-[var(--jade-bg)] border border-[var(--jade-border)] rounded-xl flex items-center justify-center overflow-hidden">
                          {banner.image ? (
                            <img
                              src={banner.image}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon
                              size={20}
                              className="text-[var(--jade-muted)]"
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl border border-dashed border-[var(--jade-border)] text-[var(--jade-text)] cursor-pointer hover:border-[var(--color-jade-pink)] hover:text-[var(--color-jade-pink)] transition">
                          Upload Image
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleShopBannerUpload(idx, file);
                              }
                              e.currentTarget.value = "";
                            }}
                          />
                        </label>
                        {uploadingShopBanner === idx && (
                          <span className="text-xs text-[var(--jade-muted)]">
                            Uploading...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() =>
              setShopBanners([
                ...shopBanners,
                {
                  title: "",
                  subtitle: "",
                  image: "",
                  link: "/shop",
                  category: "Skincare",
                },
              ])
            }
            className="w-full py-3 border-2 border-dashed border-[var(--jade-border)] text-[var(--jade-text)] font-bold uppercase tracking-widest rounded-2xl hover:bg-[var(--jade-bg)] hover:border-[var(--color-jade-pink)] hover:text-[var(--color-jade-pink)] transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Shop Banner
          </button>
        </div>

        {/* Promo Banner Settings Section */}
        <div className="pt-8 border-t border-[var(--jade-border)]">
          <h3 className="text-xl font-serif text-[var(--jade-text)] mb-6">
            Promo Banner Settings
          </h3>
          <div className="p-6 border border-[var(--jade-border)] rounded-2xl bg-[var(--jade-bg)] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--jade-text)] uppercase tracking-widest">
                  Subtitle (Top text)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
                  value={promoBanner.subtitle}
                  onChange={(e) =>
                    setPromoBanner({ ...promoBanner, subtitle: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--jade-text)] uppercase tracking-widest">
                  Title Highlight (Pink text)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
                  value={promoBanner.titleHighlight}
                  onChange={(e) =>
                    setPromoBanner({
                      ...promoBanner,
                      titleHighlight: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-[var(--jade-text)] uppercase tracking-widest">
                  Main Title (You can use \n for breaks)
                </label>
                <textarea
                  className="w-full px-4 py-2 bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
                  value={promoBanner.title}
                  rows={2}
                  onChange={(e) =>
                    setPromoBanner({ ...promoBanner, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--jade-text)] uppercase tracking-widest">
                  Description
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
                  value={promoBanner.description}
                  onChange={(e) =>
                    setPromoBanner({
                      ...promoBanner,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--jade-text)] uppercase tracking-widest">
                  Price Highlight
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
                  value={promoBanner.priceHighlight}
                  onChange={(e) =>
                    setPromoBanner({
                      ...promoBanner,
                      priceHighlight: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-[var(--jade-text)] uppercase tracking-widest">
                  Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-grow px-4 py-2 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
                    value={promoBanner.image}
                    onChange={(e) =>
                      setPromoBanner({ ...promoBanner, image: e.target.value })
                    }
                  />
                  <div className="w-12 h-12 bg-[var(--jade-bg)] border border-[var(--jade-border)] rounded-xl flex items-center justify-center overflow-hidden">
                    {promoBanner.image ? (
                      <img
                        src={promoBanner.image}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon
                        size={20}
                        className="text-[var(--jade-muted)]"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[var(--color-jade-pink)] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-pink-200 flex items-center justify-center gap-3 disabled:bg-[var(--jade-border)] disabled:text-[var(--jade-muted)]"
        >
          <Save size={20} />
          {loading ? "Saving Settings..." : "Save All Settings"}
        </button>
      </div>
    </div>
  );
}
