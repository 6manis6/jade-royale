import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
import TrendingProducts from "@/components/TrendingProducts";
import PromoBanner from "@/components/PromoBanner";
import ScrollToTop from "@/components/ScrollToTop";

export default function Home() {
  return (
    <>
      <ScrollToTop />
      <Hero />
      <CategorySection />
      <TrendingProducts />
      <PromoBanner />
    </>
  );
}
