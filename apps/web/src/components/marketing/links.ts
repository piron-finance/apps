export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NODE_ENV === "production" ? "app.piron.finance" : "http://localhost:3001");

export const DOCS_URL = "https://piron.gitbook.io/piron-finance/";

export const X_URL =
  process.env.NEXT_PUBLIC_X_URL || "https://x.com/pironfinance";

export const LINKEDIN_URL = process.env.NEXT_PUBLIC_LINKEDIN_URL || "";

export const SOCIAL_LINKS = [
  { label: "X", href: X_URL, icon: "x" as const },
  ...(LINKEDIN_URL
    ? [{ label: "LinkedIn", href: LINKEDIN_URL, icon: "linkedin" as const }]
    : []),
];
