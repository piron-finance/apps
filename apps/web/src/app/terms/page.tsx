import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Terms of Use | Piron Finance",
  description:
    "Review the terms that govern access to Piron Finance’s public website and platform interface.",
};

const lastUpdated = "Last updated: April 6, 2026";
const intro = [
  "These Terms of Use govern your access to and use of the Piron website, documentation, and public-facing product interface. By accessing or using them, you agree to these Terms and to any additional notices or disclosures made available in connection with the services.",
  "These Terms are written for the website and public interface. They do not replace fund documents, onboarding documents, subscription materials, or other product-specific agreements that may apply when you access a particular pool, structure, or service.",
];

const terms: LegalSection[] = [
  {
    id: "acceptance-and-scope",
    title: "1. Acceptance and scope",
    paragraphs: [
      "These Terms apply to your access to and use of the Piron website, documentation, and any public-facing interface or content made available by Piron, unless separate written terms expressly apply to a specific service or relationship.",
      "If you do not agree to these Terms, you should not access or use the website or interface.",
    ],
  },
  {
    id: "eligibility-and-compliance",
    title: "2. Eligibility and compliance",
    paragraphs: [
      "You are responsible for ensuring that your use of Piron is lawful in your jurisdiction and appropriate for your circumstances.",
      "Piron may apply geographic, eligibility, compliance, onboarding, or access restrictions to particular products or users at any time.",
    ],
    bullets: [
      "You may not use the site or interface where applicable law, sanctions restrictions, or internal policy prohibits you from doing so.",
      "You are responsible for evaluating whether you meet any onboarding, eligibility, suitability, KYC, or accreditation requirements tied to a product or service.",
      "Piron may restrict or suspend access where legal, operational, or compliance considerations require it.",
    ],
  },
  {
    id: "no-offer-no-advice",
    title: "3. No offer, recommendation, or advice",
    paragraphs: [
      "Nothing on the website or interface constitutes legal, tax, accounting, financial, or investment advice, or a recommendation to buy, sell, hold, or participate in any asset, product, or strategy.",
      "Any references to yield, APY, target returns, pool data, asset exposure, portfolio composition, or strategy characteristics are provided for general information only and may change without notice.",
      "No content on the site should be treated as an offer, solicitation, promise of performance, or guarantee of return.",
      "Your use of the website or interface does not by itself create any fiduciary, advisory, agency, or similar relationship between you and Piron.",
    ],
  },
  {
    id: "product-specific-documentation",
    title: "4. Product-specific documentation",
    paragraphs: [
      "Certain products or services may be accompanied by pool documents, investment terms, SPV disclosures, subscription materials, onboarding documents, or other supplemental notices.",
      "Where those materials apply, you are responsible for reviewing them carefully before committing capital or providing information. If those materials conflict with these Terms, the more specific materials will control for that product or service.",
    ],
  },
  {
    id: "wallets-blockchain-and-third-party-services",
    title: "5. Wallets, blockchain systems, and third-party services",
    paragraphs: [
      "You are solely responsible for your wallets, private keys, credentials, token approvals, transaction review, and any blockchain transactions you authorize.",
      "Unless expressly stated otherwise in product-specific documentation, Piron does not control your self-custodied wallet or private keys and cannot reverse blockchain transactions once they have been submitted.",
      "Piron does not control wallet providers, node operators, bridges, custodians, data providers, payment partners, KYC vendors, or other third-party systems, and is not responsible for their outages, delays, failures, security incidents, or acts.",
    ],
  },
  {
    id: "platform-availability",
    title: "6. Platform changes and availability",
    paragraphs: [
      "Piron may update, modify, suspend, restrict, or discontinue any part of the website, interface, or related content at any time, with or without notice.",
      "Access may be interrupted by maintenance, technical incidents, smart contract issues, chain congestion, data delays, third-party outages, or changes to legal and operational requirements.",
    ],
  },
  {
    id: "acceptable-use",
    title: "7. Acceptable use",
    paragraphs: [
      "You may not misuse the site, interfere with its operation, or attempt to access systems or data without authorization.",
    ],
    bullets: [
      "Do not use the service in a misleading, unlawful, abusive, or fraudulent manner.",
      "Do not attempt to disrupt platform security, availability, or normal operation.",
      "Do not reverse engineer protected systems except where applicable law expressly permits it.",
      "Do not misuse Piron branding, documentation, or site content.",
    ],
  },
  {
    id: "intellectual-property",
    title: "8. Intellectual property",
    paragraphs: [
      "Unless otherwise stated, the website, interface, branding, text, graphics, documents, software, and related content are owned by Piron or its licensors and are protected by applicable intellectual property laws.",
      "These Terms grant you a limited, non-exclusive, revocable, non-transferable right to access and use the website and interface for their intended purpose. No other rights are granted to you.",
    ],
  },
  {
    id: "disclaimers",
    title: "9. Disclaimers",
    paragraphs: [
      "The website, interface, and all related content are provided on an 'as is' and 'as available' basis to the fullest extent permitted by applicable law.",
      "Piron disclaims all warranties, whether express, implied, statutory, or otherwise, including any implied warranties of merchantability, fitness for a particular purpose, title, non-infringement, accuracy, availability, or uninterrupted operation.",
      "Without limiting the foregoing, Piron does not warrant that the website or interface will be error-free, continuously available, secure, or free from delay, omission, malware, or other harmful components.",
    ],
  },
  {
    id: "limitation-of-liability",
    title: "10. Limitation of liability",
    paragraphs: [
      "To the fullest extent permitted by law, Piron and its affiliates, directors, officers, employees, contractors, and service providers will not be liable for any indirect, incidental, consequential, exemplary, punitive, or special damages, or for any loss of profits, revenue, business, opportunity, goodwill, data, or digital assets arising out of or in connection with your use of, or inability to use, the website or interface.",
      "To the fullest extent permitted by law, Piron will not be responsible for losses caused by blockchain network events, smart contract issues, third-party failures, market conditions, asset performance, wallet compromise, user error, unauthorized access, or force majeure events.",
    ],
  },
  {
    id: "indemnification",
    title: "11. Indemnification",
    paragraphs: [
      "You agree to defend, indemnify, and hold harmless Piron and its affiliates, directors, officers, employees, contractors, and agents from and against any claims, liabilities, damages, judgments, losses, costs, and expenses, including reasonable legal fees, arising out of or related to your breach of these Terms, your misuse of the website or interface, your violation of applicable law, or your infringement of any rights of another person or entity.",
    ],
  },
  {
    id: "suspension-and-termination",
    title: "12. Suspension and termination",
    paragraphs: [
      "Piron may suspend, limit, or terminate your access to the website or interface at any time if it reasonably believes you have breached these Terms, created legal or security risk, or if suspension is otherwise necessary for operational, legal, or compliance reasons.",
      "Sections of these Terms that by their nature should survive termination will survive, including provisions relating to intellectual property, disclaimers, limitation of liability, indemnification, and general legal effect.",
    ],
  },
  {
    id: "changes-to-these-terms",
    title: "13. Changes to these Terms",
    paragraphs: [
      "Piron may revise these Terms from time to time. Updated Terms become effective when posted on this page unless a later effective date is stated.",
      "Your continued use of the website or interface after an update means you accept the revised Terms.",
    ],
  },
  {
    id: "general",
    title: "14. General",
    paragraphs: [
      "If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.",
      "A failure by Piron to enforce any provision of these Terms will not constitute a waiver of that provision or of any other provision.",
      "These Terms should be read together with the Privacy Policy, Risk Disclosure, and any applicable product-specific documentation.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms of Use"
      title="Terms of Use"
      description="These terms outline the conditions that apply when you access or use the Piron website and public interface."
      lastUpdated={lastUpdated}
      effectiveDate="Effective date: April 6, 2026"
      intro={intro}
      sections={terms}
      relatedDocuments={[
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Risk Disclosure", href: "/risk-disclosure" },
      ]}
    />
  );
}
