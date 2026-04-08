export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:3001");

export const DOCS_URL = "https://piron.gitbook.io/piron-finance/";
