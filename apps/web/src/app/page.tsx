import { Hero } from "@/components/marketing/hero";
import { PoolTypes } from "@/components/marketing/pool-types";
import { StrategySection } from "@/components/marketing/strategy-section";
import { SecuritySection } from "@/components/marketing/security-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { CTASection } from "@/components/marketing/cta-section";
import { Footer } from "@/components/marketing/footer";
import Header from "@/components/marketing/Header";

export default function MarketingPage() {
  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0, 90, 90, 0.35) 0%, transparent 50%),
          radial-gradient(ellipse 80% 50% at 50% 100%, rgba(0, 90, 90, 0.35) 0%, transparent 50%),
          black
        `,
      }}
    >
      <Header />
      <div className="relative overflow-x-hidden">
        <Hero />
        <PoolTypes />
        <StrategySection />
        <SecuritySection />
        <HowItWorks />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
