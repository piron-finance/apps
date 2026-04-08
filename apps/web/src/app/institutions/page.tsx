import type { Metadata } from "next";
import {
  MarketingBulletList,
  MarketingCard,
  MarketingPageShell,
  MarketingSection,
} from "@/components/marketing/page-shell";
import { DOCS_URL } from "@/components/marketing/links";

export const metadata: Metadata = {
  title: "Institutions | Piron Finance",
  description:
    "Institutional workflows at Piron Finance are in development. See what is planned for treasury, reporting, and allocation support.",
};

const capabilities = [
  {
    title: "Treasury workflows",
    description:
      "Structured access for teams that need clearer approvals, repeatable allocation processes, and a more deliberate operating model than retail flows.",
  },
  {
    title: "Reporting and visibility",
    description:
      "Product-grade summaries, position context, and supporting views designed to make treasury review and stakeholder communication easier.",
  },
  {
    title: "Policy-aligned onboarding",
    description:
      "A path toward onboarding and operational controls that fit organizations with compliance, mandate, or committee requirements.",
  },
];

const audience = [
  "Corporate and startup treasuries managing idle stablecoin balances.",
  "Crypto-native funds and allocators who want clearer fixed-income access.",
  "Fintech platforms exploring yield infrastructure for customer or treasury balances.",
  "Family offices and investment teams seeking a more structured way into emerging market and fixed-income opportunities.",
];

const milestones = [
  "Institution-ready pool discovery and clearer product segmentation.",
  "Reporting views that make internal review and record-keeping more practical.",
  "Operational and onboarding layers for teams that cannot use a purely self-serve flow.",
];

export default function InstitutionsPage() {
  return (
    <MarketingPageShell
      eyebrow="Institutions"
      title="Institutional access is in development."
      description="Piron’s institutional surface is not live yet, but it is part of the roadmap. The goal is to give treasuries and professional allocators a cleaner operational layer around the same core idea: disciplined access to fixed income with better visibility into how capital moves."
      meta="Coming soon"
      actions={[
        { label: "How it works", href: "/how-it-works" },
        { label: "Read the docs", href: DOCS_URL, tone: "secondary" },
      ]}
    >
      <MarketingSection
        eyebrow="What is coming"
        title="A more formal operating layer for teams that need one."
        description="The public app is designed to be straightforward. Institutional access needs more than that. It needs reporting, approvals, and workflows that fit the way professional capital is actually managed."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {capabilities.map((capability) => (
            <MarketingCard
              key={capability.title}
              title={capability.title}
              description={capability.description}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Who it is for"
        title="Designed for capital that cannot move on vibes alone."
        description="We are building this page and product area with more operationally constrained users in mind."
      >
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
              Target users
            </p>
            <div className="mt-5">
              <MarketingBulletList items={audience} />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
              What to expect next
            </p>
            <div className="mt-5">
              <MarketingBulletList items={milestones} />
            </div>
            <p className="mt-6 text-sm leading-relaxed text-white/55">
              This page will evolve as institutional onboarding, reporting, and
              allocation support move closer to public release. For now, it is
              the canonical place to signal that this track is planned and being
              designed intentionally rather than treated as an afterthought.
            </p>
          </div>
        </div>
      </MarketingSection>
    </MarketingPageShell>
  );
}
