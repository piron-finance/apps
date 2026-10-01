import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
// Editorial serif — used for long-form article reading (blog posts).
const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Piron Finance",
  description:
    "The future of global money markets. Earn yield on fixed income from anywhere in the world.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${serif.variable} min-h-screen bg-surface-primary text-content-primary relative overflow-x-hidden antialiased`}>
        <div className="relative z-10">
          <main>{children}</main>
          <Analytics/>
        </div>
      </body>
    </html>
  );
}
