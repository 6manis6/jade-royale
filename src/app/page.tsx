import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
import TrendingProducts from "@/components/TrendingProducts";
import PromoBanner from "@/components/PromoBanner";

// Diagnostic comment to trigger dev reload - Phase 14
export default function Home() {
  return (
    <>
      <Hero />
      <CategorySection />
      <TrendingProducts />
      <PromoBanner />
    </>
  );
}
