import Link from "next/link";
import type { BlogSettings } from "@/lib/blog/types";
import { APP_URL } from "@/components/marketing/links";

type BlogCTAProps = {
  settings: BlogSettings;
};

export function BlogCTA({ settings }: BlogCTAProps) {
  const href =
    settings.ctaHref === "/" || !settings.ctaHref ? APP_URL : settings.ctaHref;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,196,140,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.14),transparent_30%)]" />
      <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
            Start with Piron
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {settings.ctaTitle}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/55">
            {settings.ctaDescription}
          </p>
        </div>

        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-full bg-[#00C48C] px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-[#00D99A]"
        >
          {settings.ctaLabel}
        </Link>
      </div>
    </section>
  );
}
