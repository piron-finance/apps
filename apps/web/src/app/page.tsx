import { Hero } from "@/components/marketing/hero";
import { PoolTypes } from "@/components/marketing/pool-types";
import { UserJourney } from "@/components/marketing/user-journey";
import { StrategySection } from "@/components/marketing/strategy-section";
import { SecuritySection } from "@/components/marketing/security-section";
import { Footer } from "@/components/marketing/footer";
import Header from "@/components/marketing/Header";

export default function MarketingPage() {
  return (
    <div 
      className="min-h-screen w-full"
      style={{
        background: `
          radial-gradient(80% 60% at 50% -10%, rgba(0, 255, 200, 0.12), transparent 60%),
          radial-gradient(50% 40% at 70% 20%, rgba(0, 100, 255, 0.08), transparent 70%),
          linear-gradient(180deg, #031b1f 0%, #041417 50%, #02090b 100%)
        `,
        backgroundAttachment: 'fixed',
      }}
    >
      <Header />
      <Hero />
      <PoolTypes />
      <UserJourney />
      <StrategySection />
      <SecuritySection />
      <Footer />
    </div>
  );
}
