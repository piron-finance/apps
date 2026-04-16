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
    <section className="rounded-2xl bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:p-10">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-content-tertiary">
            Start with Piron
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-content-primary md:text-4xl">
            {settings.ctaTitle}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-content-secondary">
            {settings.ctaDescription}
          </p>
        </div>

        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-text transition-colors hover:bg-accent-hover"
        >
          {settings.ctaLabel}
        </Link>
      </div>
    </section>
  );
}
