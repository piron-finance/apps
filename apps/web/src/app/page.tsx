import { Hero } from "@/components/marketing/hero";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { PoolsSection } from "@/components/marketing/pools-section";
import { ArchitectureSection } from "@/components/marketing/architecture-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { CTASection } from "@/components/marketing/cta-section";
import { Footer } from "@/components/marketing/footer";
import Header from "@/components/marketing/Header";

export default function MarketingPage() {
  return (
    <div className="relative min-h-screen w-full">
      <Header transparent />
      <Hero />
      <ProductShowcase />
      <PoolsSection />
      <ArchitectureSection />
      <HowItWorks />
      <CTASection />
      <Footer />
    </div>
  );
}
