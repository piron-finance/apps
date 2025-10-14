import { Hero } from "@/components/marketing/hero";
import { WhyPironPools } from "@/components/marketing/why-piron-pools";
import PironScrollSections from "@/components/marketing/PironScrollSections";
import InvestmentNetwork from "@/components/marketing/investment-network";
import { CrossBorder } from "@/components/marketing/cross-border";
import { GetStarted } from "@/components/marketing/get-started";
import { Footer } from "@/components/marketing/footer";
import Header from "@/components/marketing/Header";

export default function MarketingPage() {
  return (
    <div className="bg-black min-h-screen w-full">
      <Header />
      <Hero />
      <WhyPironPools />
      <PironScrollSections />
      <InvestmentNetwork />
      <CrossBorder />
      <GetStarted />
      <Footer />
    </div>
  );
}
