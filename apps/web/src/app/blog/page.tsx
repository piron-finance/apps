import type { Metadata } from "next";
import {
  MarketingCard,
  MarketingPageShell,
  MarketingSection,
} from "@/components/marketing/page-shell";
import { APP_URL } from "@/components/marketing/links";

export const metadata: Metadata = {
  title: "Blog | Piron Finance",
  description:
    "Read Piron’s perspective on fixed income, risk framing, and why better yield products need better disclosure.",
};

const coverage = [
  {
    title: "Product notes",
    description:
      "Updates on how Piron thinks about pool design, disclosure, reporting, and user experience.",
  },
  {
    title: "Market explainers",
    description:
      "Plain-language breakdowns of fixed-income products, duration, liquidity, and emerging market context.",
  },
  {
    title: "Risk memos",
    description:
      "Writing that explains why serious yield products need serious framing, especially when they sit behind an easy interface.",
  },
];

const essays = [
  {
    title: "Why fixed income is a natural fit for on-chain distribution",
    summary:
      "Some products become clearer when moved on-chain. Fixed income is one of them, because users care about cash flow timing, duration, and asset quality in ways that map well to transparent product rails.",
    body: [
      "The appeal is not that fixed income becomes magically risk-free on-chain. It does not. The appeal is that a well-designed interface can expose more of the product shape than traditional wrappers usually do. A user can inspect hold periods, pool status, historical distributions, and operating mechanics before capital moves.",
      "That matters because fixed income is fundamentally about structure. When the structure is visible, the product gets easier to compare and harder to misunderstand. That does not eliminate due diligence, but it makes the due diligence surface better.",
    ],
  },
  {
    title: "What a serious yield page should disclose",
    summary:
      "Headline APY is not enough. Users need to see where yield comes from, when liquidity is available, and what can go wrong if the underlying assumptions break.",
    body: [
      "A serious yield interface should make it obvious whether capital is locked, how returns are generated, what fees apply, and whether distributions depend on issuer, manager, or market performance. It should explain the downside case with the same energy it explains the upside case.",
      "This is not just a legal or compliance problem. It is a product design problem. Good disclosure improves decisions, reduces support friction, and builds a healthier relationship with users who are committing real capital.",
    ],
  },
  {
    title: "Why emerging market access needs cleaner infrastructure",
    summary:
      "Emerging market fixed-income opportunities can be compelling, but access is often gated by distribution friction, fragmented information, and trust gaps between local opportunity and global capital.",
    body: [
      "Cleaner infrastructure helps by making allocation pathways easier to inspect. Users should be able to see what a pool targets, how funds are routed, and what time horizons or risk concentrations matter before they deposit. Distribution without visibility is not enough.",
      "The long-term opportunity is not just moving more assets on-chain. It is building interfaces and operating models that make cross-border yield products easier to understand, easier to monitor, and easier to compare against alternatives.",
    ],
  },
];

export default function BlogPage() {
  return (
    <MarketingPageShell
      eyebrow="Piron Journal"
      title="Notes on yield, structure, and clearer capital markets."
      description="The Piron blog is where we explain the thinking behind the product: why fixed income belongs on better rails, why disclosure matters, and what we think serious yield interfaces should make legible."
      actions={[
        { label: "Launch app", href: APP_URL },
        { label: "How it works", href: "/how-it-works", tone: "secondary" },
      ]}
    >
      <MarketingSection
        eyebrow="Coverage"
        title="What we write about"
        description="This page is meant to be useful even before it becomes a traditional post archive. The focus is the substance behind the product, not content for its own sake."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {coverage.map((item) => (
            <MarketingCard
              key={item.title}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Featured essays"
        title="Three ideas behind the platform"
        description="These notes capture the tone we want from the journal: practical, risk-aware, and grounded in the mechanics that sit beneath any yield product."
      >
        <div className="grid gap-4 xl:grid-cols-3">
          {essays.map((essay) => (
            <MarketingCard
              key={essay.title}
              title={essay.title}
              description={essay.summary}
            >
              <div className="space-y-4 text-sm leading-relaxed text-white/60">
                {essay.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>
    </MarketingPageShell>
  );
}
