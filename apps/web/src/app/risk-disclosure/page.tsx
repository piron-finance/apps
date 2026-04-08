import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Risk Disclosure | Piron Finance",
  description:
    "Review the main categories of risk that can affect use of Piron Finance, including smart contract, liquidity, market, and regulatory risk.",
};

const lastUpdated = "Last updated: April 6, 2026";
const intro = [
  "This Risk Disclosure summarizes major categories of risk that may affect use of Piron and any products accessed through the platform. It is intended to support better decision-making, not to replace independent diligence or professional advice.",
  "Risk in this category is multi-layered. It can arise from smart contracts, market conditions, legal structure, service providers, stablecoin settlement, and the underlying assets themselves.",
];

const risks: LegalSection[] = [
  {
    id: "smart-contract-and-technical-risk",
    title: "1. Smart contract and technical risk",
    paragraphs: [
      "Bugs, exploits, design flaws, oracle failures, wallet compromises, chain reorganizations, RPC outages, or other technical incidents could result in loss, delay, inaccurate balances, or inability to access funds.",
      "Audits, reviews, and testing can reduce risk, but they do not eliminate it.",
    ],
  },
  {
    id: "stablecoin-settlement-and-custody-risk",
    title: "2. Stablecoin, settlement, and custody risk",
    paragraphs: [
      "Pools may depend on stablecoins, banking rails, custodians, payment providers, or settlement intermediaries.",
      "A depeg, freeze, transfer failure, sanctions event, operational outage, or custodian issue could impair access to funds, redemptions, or distributions.",
    ],
  },
  {
    id: "underlying-asset-and-issuer-risk",
    title: "3. Underlying asset and issuer risk",
    paragraphs: [
      "Returns may depend on the credit quality, repayment behavior, market value, and operational performance of borrowers, issuers, funds, or other underlying assets.",
      "Defaults, restructurings, downgrades, valuation shifts, or servicing failures may reduce expected returns or principal.",
    ],
  },
  {
    id: "liquidity-and-duration-risk",
    title: "4. Liquidity and duration risk",
    paragraphs: [
      "Some products may be illiquid or subject to fixed hold periods, redemption timing, queueing, or limited secondary transferability.",
      "Even where a pool has a stated duration, real-world settlement and asset recovery timelines may extend beyond user expectations.",
    ],
  },
  {
    id: "emerging-market-macro-and-fx-risk",
    title: "5. Emerging market, macro, and FX risk",
    paragraphs: [
      "Where underlying exposure touches emerging markets, users may be affected by political instability, currency volatility, local legal change, capital controls, inflation, sovereign stress, or weaker market infrastructure.",
      "Macro shocks can materially alter repayment conditions, liquidity, and realized returns.",
    ],
  },
  {
    id: "regulatory-and-legal-risk",
    title: "6. Regulatory and legal risk",
    paragraphs: [
      "Laws, regulations, tax rules, licensing expectations, and enforcement positions may change over time.",
      "Those changes can affect product availability, onboarding requirements, redemption mechanics, reporting obligations, and the economic viability of a pool or structure.",
    ],
  },
  {
    id: "data-and-disclosure-risk",
    title: "7. Data and disclosure risk",
    paragraphs: [
      "Yield figures, pool data, and supporting metrics may be delayed, estimated, incomplete, or revised over time.",
      "Users should not rely on a single dashboard figure as a substitute for understanding the product disclosures, structure, and operational assumptions beneath the interface.",
    ],
  },
  {
    id: "user-responsibility",
    title: "8. User responsibility",
    paragraphs: [
      "You are responsible for evaluating whether a product fits your objectives, liquidity needs, tax position, and risk tolerance.",
      "You are also responsible for wallet security, transaction review, address verification, and understanding the applicable product terms before committing capital.",
    ],
  },
];

export default function RiskDisclosurePage() {
  return (
    <LegalPage
      eyebrow="Risk Disclosure"
      title="Risk Disclosure"
      description="This page summarizes the principal risks users should consider before interacting with Piron or allocating capital through the platform."
      lastUpdated={lastUpdated}
      effectiveDate="Effective date: April 6, 2026"
      intro={intro}
      sections={risks}
      relatedDocuments={[
        { label: "Terms of Use", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
      ]}
    />
  );
}
