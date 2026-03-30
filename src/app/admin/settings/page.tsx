"use client";

import { useState, useEffect } from "react";
import { Save, Image as ImageIcon, Plus, Trash2 } from "lucide-react";

export default function AdminSettings() {
  const [slider, setSlider] = useState<
    { title: string; subtitle: string; image: string; link: string }[]
  >([]);
  const [promoBanner, setPromoBanner] = useState({
    subtitle: "A nature's touch",
    titleHighlight: "Get 20%",
    title: "off on all \ncosmetic cream \npacks",
    description: "Start from",
    priceHighlight: "Rs 80.00",
    link: "/shop",
    image: "https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=800&auto=format&fit=crop",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
  }, []);

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
        })
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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

        {/* Promo Banner Settings Section */}
        <div className="pt-8 border-t border-[var(--jade-border)]">
          <h3 className="text-xl font-serif text-[var(--jade-text)] mb-6">Promo Banner Settings</h3>
          <div className="p-6 border border-[var(--jade-border)] rounded-2xl bg-[var(--jade-bg)] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--jade-text)] uppercase tracking-widest">Subtitle (Top text)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
                  value={promoBanner.subtitle}
                  onChange={(e) => setPromoBanner({ ...promoBanner, subtitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--jade-text)] uppercase tracking-widest">Title Highlight (Pink text)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
                  value={promoBanner.titleHighlight}
                  onChange={(e) => setPromoBanner({ ...promoBanner, titleHighlight: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-[var(--jade-text)] uppercase tracking-widest">Main Title (You can use \n for breaks)</label>
                <textarea
                  className="w-full px-4 py-2 bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
                  value={promoBanner.title}
                  rows={2}
                  onChange={(e) => setPromoBanner({ ...promoBanner, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--jade-text)] uppercase tracking-widest">Description</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
                  value={promoBanner.description}
                  onChange={(e) => setPromoBanner({ ...promoBanner, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--jade-text)] uppercase tracking-widest">Price Highlight</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
                  value={promoBanner.priceHighlight}
                  onChange={(e) => setPromoBanner({ ...promoBanner, priceHighlight: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-[var(--jade-text)] uppercase tracking-widest">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-grow px-4 py-2 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
                    value={promoBanner.image}
                    onChange={(e) => setPromoBanner({ ...promoBanner, image: e.target.value })}
                  />
                  <div className="w-12 h-12 bg-[var(--jade-bg)] border border-[var(--jade-border)] rounded-xl flex items-center justify-center overflow-hidden">
                    {promoBanner.image ? (
                      <img src={promoBanner.image} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={20} className="text-[var(--jade-muted)]" />
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
