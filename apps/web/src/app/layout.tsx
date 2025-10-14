import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-screen bg-black text-white relative overflow-x-hidden antialiased">
        {/* <BackgroundEffects /> */}
        <div className="relative z-10">
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
