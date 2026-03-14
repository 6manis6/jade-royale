"use client";

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Hero() {
  const [slides, setSlides] = useState([
    {
      title: "Nature's touch to your skin",
      subtitle: "Natural Skin Care",
      image: "/Jade Royale.gif",
      link: "/shop"
    }
  ]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch('/api/settings?key=hero_slider', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          setSlides(data.data);
        }
      })
      .catch(err => console.error("Slider fetch failed", err));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-[85vh] overflow-hidden bg-[var(--jade-bg)]">
      <AnimatePresence mode="wait">
        <motion.div 
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {/* Main Slide Image */}
          <div className="absolute inset-0">
            <img 
              src={slides[current].image} 
              alt="Hero Banner" 
              className="w-full h-full object-cover"
            />
            {/* Dark Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
          </div>
          
          <div className="container mx-auto h-full px-4 md:px-8 flex flex-col items-center justify-center relative z-10 text-center">
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="font-serif text-5xl md:text-8xl text-white leading-[1.1] max-w-4xl"
            >
              {slides[current].title}
            </motion.h1>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="pt-10"
            >
              <Link href={slides[current].link} className="bg-[var(--color-jade-pink)] text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest hover:bg-[var(--color-jade-pink-hover)] transition-all shadow-xl hover:scale-105 inline-block">
                Shop Our Collection
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-20">
        {slides.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition-all ${i === current ? 'bg-[var(--color-jade-pink)] w-8' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </section>
  );
}
