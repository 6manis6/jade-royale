"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type ShopBanner = {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  category: string;
};

interface ShopBannersProps {
  activeCategory: string;
}

export default function ShopBanners({ activeCategory }: ShopBannersProps) {
  const [banners, setBanners] = useState<ShopBanner[]>([]);
  const [current, setCurrent] = useState(0);
  const [intervalSeconds, setIntervalSeconds] = useState(6);

  useEffect(() => {
    fetch("/api/settings?key=shop_banners", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setBanners(data.data);
        }
      })
      .catch((err) => console.error("Shop banner fetch failed", err));
  }, []);

  useEffect(() => {
    fetch("/api/settings?key=shop_banner_interval", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const value = Number(data?.data);
        if (Number.isFinite(value) && value > 0) {
          setIntervalSeconds(value);
        }
      })
      .catch((err) => console.error("Shop banner interval fetch failed", err));
  }, []);

  const filteredBanners = useMemo(() => {
    if (activeCategory === "All") return banners;
    return banners.filter((banner) => banner.category === activeCategory);
  }, [activeCategory, banners]);

  useEffect(() => {
    const timer = setTimeout(() => setCurrent(0), 0);
    return () => clearTimeout(timer);
  }, [activeCategory, filteredBanners.length]);

  useEffect(() => {
    if (filteredBanners.length <= 1) return;
    const safeInterval = Math.max(intervalSeconds, 2) * 1000;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % filteredBanners.length);
    }, safeInterval);
    return () => clearInterval(timer);
  }, [filteredBanners.length, intervalSeconds]);

  const activeBanner = filteredBanners[current];

  if (!activeBanner || !activeBanner.image) return null;

  const bannerLayer = (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${activeBanner.image}-${current}`}
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.01 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.01 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{
          backgroundImage: `url(${activeBanner.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </AnimatePresence>
  );

  const goPrev = () => {
    setCurrent((prev) => (prev === 0 ? filteredBanners.length - 1 : prev - 1));
  };

  const goNext = () => {
    setCurrent((prev) => (prev + 1) % filteredBanners.length);
  };

  return (
    <section className="mb-12">
      <div className="relative w-full aspect-32/9 overflow-hidden rounded-3xl border border-(--jade-border) bg-(--jade-bg)">
        {activeBanner.link ? (
          <a href={activeBanner.link} className="absolute inset-0 z-10">
            {bannerLayer}
          </a>
        ) : (
          bannerLayer
        )}

        {filteredBanners.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white transition hover:bg-black/60"
              aria-label="Previous banner"
            >
              {"<"}
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white transition hover:bg-black/60"
              aria-label="Next banner"
            >
              {">"}
            </button>
          </>
        )}

        {filteredBanners.length > 1 && (
          <div className="absolute bottom-6 right-6 z-20 flex gap-2">
            {filteredBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2 w-2 rounded-full transition-all ${
                  idx === current ? "bg-jade-pink w-6" : "bg-white/70"
                }`}
                aria-label={`Show banner ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
