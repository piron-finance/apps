import { SiteHeader } from "@/components/dashboard/site-header";
import { SiteFooter } from "@/components/dashboard/site-footer";
import { TestTokenAnnouncement } from "@/components/dashboard/test-token-announcement";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <TestTokenAnnouncement />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
