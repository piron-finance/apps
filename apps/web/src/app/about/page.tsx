import type { Metadata } from "next";
import {
  MarketingBulletList,
  MarketingCard,
  MarketingPageShell,
  MarketingSection,
} from "@/components/marketing/page-shell";
import { APP_URL, DOCS_URL } from "@/components/marketing/links";

export const metadata: Metadata = {
  title: "About Piron Finance",
  description:
    "Learn what Piron Finance is building, why it exists, and how the platform approaches fixed income access on-chain.",
};

const principles = [
  {
    title: "Clarity over hype",
    description:
      "We want users to understand duration, lockups, underlying assets, and downside cases before they deposit. Better disclosure is part of the product.",
  },
  {
    title: "Structure matters",
    description:
      "The bridge between wallets and real-world credit needs legal structure, operational controls, and visible asset flows. We treat that plumbing as core infrastructure.",
  },
  {
    title: "Access should scale",
    description:
      "Global fixed income should not be reserved for large institutions with legacy rails. Piron is designed to make disciplined access feel simpler and more legible.",
  },
];

const operatingPrinciples = [
  "On-chain entry, tracking, and investor visibility where the product allows it.",
  "Risk-aware pool design with clear hold periods, disclosures, and expected behavior.",
  "A product experience that is usable for individuals today and extensible to treasury and institutional workflows over time.",
  "Documentation that explains both the opportunity and the operational constraints around it.",
];

export default function AboutPage() {
  return (
    <MarketingPageShell
      eyebrow="About Piron"
      title="Building a clearer path into global fixed income."
      description="Piron Finance is designing an access layer for fixed income products that feel transparent enough for on-chain users and disciplined enough for serious capital. The goal is not to make risk disappear. It is to make the path into yield more structured, more legible, and easier to evaluate."
      actions={[
        { label: "How it works", href: "/how-it-works" },
        { label: "Launch app", href: APP_URL },
        { label: "Read the docs", href: DOCS_URL, tone: "secondary" },
      ]}
    >
      <MarketingSection
        eyebrow="What we build"
        title="A platform for fixed-income access that starts with disclosure."
        description="Piron brings together wallet-native access, smart contract rails, and real-world asset pathways in a way that gives users a clearer picture of where yield is coming from and what conditions sit underneath it."
      >
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4 text-sm leading-relaxed text-white/60 md:text-base">
            <p>
              We think the next generation of yield products needs more than a
              good headline APY. It needs cleaner product structure, better
              context around underlying assets, and interfaces that make
              duration, liquidity, and distribution mechanics easy to inspect.
            </p>
            <p>
              That is the lens behind Piron. We are building toward a system
              where the experience is simple at the surface, but the substance
              underneath is robust enough for users who care how capital is
              actually deployed.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
              Operating principles
            </p>
            <div className="mt-5">
              <MarketingBulletList items={operatingPrinciples} />
            </div>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Why Piron exists"
        title="The product thesis is simple: serious yield deserves serious framing."
        description="We believe fixed income is a natural category for better on-chain distribution, especially when users can inspect the pool design, understand the capital path, and see the risk story before they commit."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {principles.map((principle) => (
            <MarketingCard
              key={principle.title}
              title={principle.title}
              description={principle.description}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Who it is for"
        title="Built first for disciplined users, then outward from there."
        description="Piron is intended for people and teams who want more structure than generic DeFi yield pages usually provide."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <MarketingCard
            title="Individual allocators"
            description="Users who want a cleaner way to evaluate yield products, hold periods, and asset-backed opportunities without guessing what sits beneath the interface."
          />
          <MarketingCard
            title="Crypto-native treasuries"
            description="DAOs, fintech teams, and operators looking for more disciplined fixed-income style exposure than idle stablecoin balances usually offer."
          />
          <MarketingCard
            title="Institutional capital"
            description="Treasuries and funds that want reporting, clearer controls, and a more formal operating model as institutional workflows come online."
          />
        </div>
      </MarketingSection>
    </MarketingPageShell>
  );
}
