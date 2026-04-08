import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | Piron Finance",
  description:
    "Understand what information Piron Finance may collect, how it is used, and what choices users retain.",
};

const lastUpdated = "Last updated: April 6, 2026";
const intro = [
  "This Privacy Policy explains how Piron collects, uses, discloses, retains, and protects personal information in connection with the website, documentation, onboarding flows, and public-facing product interface.",
  "Because Piron operates in a digital asset context, some information is collected directly by us, some is collected automatically through the website, and some becomes public by design when you interact with blockchain networks.",
];

const privacySections: LegalSection[] = [
  {
    id: "scope-and-what-this-policy-covers",
    title: "1. Scope and what this Policy covers",
    paragraphs: [
      "This Policy applies to personal information processed by Piron in connection with the public website, documentation, support interactions, onboarding or waitlist flows, and public-facing product interfaces.",
      "For the personal information described in this Policy, Piron Finance determines how and why the information is processed unless a separate notice, agreement, or service-specific disclosure states otherwise.",
      "It does not necessarily describe information handling by independent third parties such as wallet providers, blockchain networks, custodians, payment partners, identity-verification vendors, analytics providers, or any issuer, SPV, or partner entity that may provide a separate privacy notice.",
    ],
  },
  {
    id: "categories-of-information-we-collect",
    title: "2. Categories of information we collect",
    paragraphs: [
      "Depending on how you interact with Piron, we may collect identifiers and contact details you choose to provide, wallet addresses, transaction-related information, device and browser information, IP-derived data, usage and interaction data, communications, and information submitted during onboarding, support, waitlist, or business development interactions.",
      "Where a product or service requires identity checks, eligibility review, sanctions screening, or enhanced onboarding, additional information may be collected either by Piron or by an authorized service provider acting on Piron’s behalf or under its own separate notice.",
    ],
  },
  {
    id: "sources-of-information",
    title: "3. Sources of information",
    paragraphs: [
      "We may collect personal information directly from you, automatically from your browser or device, from your use of the website or interface, from blockchain networks and public ledgers, and from third-party service providers such as analytics, onboarding, fraud-prevention, sanctions-screening, infrastructure, support, or communications vendors.",
      "We may also receive information from counterparties, issuers, SPVs, custodians, or professional advisers where needed to support a transaction, onboarding process, legal requirement, or operational workflow.",
    ],
  },
  {
    id: "how-we-use-information",
    title: "4. How we use information",
    paragraphs: [
      "We may use personal information to operate and improve the website and interface, authenticate access, maintain security, review eligibility, manage onboarding and support, provide requested services, investigate abuse or fraud, comply with law, enforce our Terms, and communicate with you about product or account-related matters.",
      "We may also use information to analyze platform performance, understand usage patterns, troubleshoot issues, monitor incidents, and improve the quality, safety, and reliability of the service.",
      "Where required by applicable law, we rely on an appropriate legal basis for processing, such as your consent, performance of a contract, compliance with legal obligations, or our legitimate interests in operating and protecting the platform.",
    ],
  },
  {
    id: "cookies-analytics-and-similar-technologies",
    title: "5. Cookies, analytics, and similar technologies",
    paragraphs: [
      "Piron may use cookies, local storage, pixels, log files, software development kits, and similar technologies to keep the site functional, remember settings, measure performance, understand usage, and support security and fraud prevention.",
      "You may be able to manage certain cookies or browser-based tracking through your device or browser settings. Disabling some technologies may affect how the website or interface functions.",
    ],
  },
  {
    id: "on-chain-and-public-ledger-data",
    title: "6. On-chain and public ledger data",
    paragraphs: [
      "Public blockchain networks record wallet addresses, transaction hashes, token transfers, smart contract interactions, and related metadata in a transparent and persistent manner.",
      "Even if Piron limits the personal information it collects directly, your blockchain activity may still be visible to validators, node operators, indexers, analytics providers, counterparties, and the public. Piron cannot alter, erase, or make private data that has already been written to a public blockchain.",
    ],
  },
  {
    id: "when-we-disclose-information",
    title: "7. When we disclose information",
    paragraphs: [
      "We may disclose personal information to service providers and infrastructure partners that help us host, secure, operate, monitor, support, or improve the website or platform.",
      "We may disclose information to onboarding, compliance, legal, accounting, audit, sanctions-screening, fraud-prevention, analytics, and communications providers where reasonably necessary for our operations or obligations.",
      "We may also disclose information where required to comply with law, regulation, court order, lawful request, sanctions obligations, or good-faith legal process, or where necessary to establish, exercise, or defend legal claims.",
      "If Piron undergoes a merger, financing, acquisition, reorganization, sale of assets, or similar transaction, personal information may be disclosed as part of that process subject to appropriate confidentiality and legal protections.",
    ],
  },
  {
    id: "international-transfers",
    title: "8. International transfers",
    paragraphs: [
      "Piron and its service providers may process information in multiple jurisdictions, including jurisdictions that may not offer the same level of legal protection as your home jurisdiction.",
      "Where required by applicable law, Piron will take steps intended to support lawful transfers of personal information, such as contractual measures, organizational safeguards, or other recognized transfer mechanisms.",
    ],
  },
  {
    id: "data-retention",
    title: "9. Data retention",
    paragraphs: [
      "We retain personal information for as long as reasonably necessary for the purposes described in this Policy, including to operate the platform, maintain records, provide support, resolve disputes, enforce agreements, and comply with legal, tax, accounting, or regulatory obligations.",
      "Retention periods vary depending on the type of information, the nature of the relationship, the sensitivity of the data, applicable legal requirements, and whether the information is needed to investigate abuse, fraud, or security incidents.",
      "Because public blockchain records may be permanent, certain on-chain information cannot be deleted or modified by Piron.",
    ],
  },
  {
    id: "data-security",
    title: "10. Data security",
    paragraphs: [
      "Piron uses administrative, technical, and organizational measures designed to protect personal information against unauthorized access, use, alteration, disclosure, or destruction.",
      "No internet-based service, cloud environment, wallet interaction, or blockchain system can be guaranteed to be fully secure. You should use appropriate security practices when interacting with the platform, including protecting your wallet credentials and devices.",
    ],
  },
  {
    id: "your-rights-and-choices",
    title: "11. Your rights and choices",
    paragraphs: [
      "Depending on where you live, you may have legal rights relating to your personal information, such as rights to access, know, correct, delete, restrict, object, or withdraw consent to certain processing, or to request data portability.",
      "Some of these rights may be limited by law, by technical constraints of public blockchain systems, or by our need to comply with legal, security, contractual, or anti-fraud obligations.",
      "You may also choose not to provide certain information, but doing so may limit your ability to use particular features, complete onboarding, or access certain products or services.",
      "Where permitted or required by law, we may ask you for information necessary to verify your identity before responding to a request concerning your personal information.",
      "If you are entitled under applicable law to lodge a complaint with a supervisory or regulatory authority about our handling of personal information, you may do so.",
    ],
  },
  {
    id: "children",
    title: "12. Children",
    paragraphs: [
      "The website and interface are not directed to children, and Piron does not knowingly collect personal information from children in a manner that requires parental consent under applicable law.",
      "If you believe a child has provided personal information to Piron inappropriately, you should contact Piron through an official channel so that the matter can be reviewed.",
    ],
  },
  {
    id: "third-party-links-and-services",
    title: "13. Third-party links and services",
    paragraphs: [
      "The website and interface may contain links to third-party websites, documentation, wallets, block explorers, applications, and services that are not operated by Piron.",
      "Piron is not responsible for the privacy, security, content, or practices of those third parties. You should review their policies separately before interacting with them.",
    ],
  },
  {
    id: "changes-to-this-policy",
    title: "14. Changes to this Policy",
    paragraphs: [
      "Piron may update this Privacy Policy from time to time to reflect product changes, operational updates, or legal and regulatory developments.",
      "When we do, we will post the updated version on this page and revise the effective date or last updated date above. Your continued use of the website or interface after the update means you acknowledge the revised Policy.",
    ],
  },
  {
    id: "contacting-piron",
    title: "15. Contacting Piron",
    paragraphs: [
      "If you have questions about this Privacy Policy or wish to exercise privacy-related rights available to you under applicable law, you should contact Piron through an official support, privacy, or contact channel made available on the website, within the product, or through other official Piron communications.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy Policy"
      title="Privacy Policy"
      description="This policy explains how Piron may collect, use, and disclose information in connection with the public website and product interface."
      lastUpdated={lastUpdated}
      effectiveDate="Effective date: April 6, 2026"
      intro={intro}
      sections={privacySections}
      relatedDocuments={[
        { label: "Terms of Use", href: "/terms" },
        { label: "Risk Disclosure", href: "/risk-disclosure" },
      ]}
    />
  );
}
