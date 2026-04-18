import Link from "next/link";
import Header from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/footer";

type Action = {
  label: string;
  href: string;
  tone?: "primary" | "secondary";
};

type MarketingPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  meta?: string;
  actions?: Action[];
  children: React.ReactNode;
};

type MarketingSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

type MarketingCardProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

type MarketingBulletListProps = {
  items: string[];
};

export function MarketingPageShell({
  eyebrow,
  title,
  description,
  meta,
  actions = [],
  children,
}: MarketingPageShellProps) {
  return (
    <div className="relative min-h-screen w-full bg-surface-warm pt-16">
      <Header />
      <div className="relative overflow-x-hidden">
        <section data-header-theme="dark" className="relative bg-[#0a0a0b] pt-12 pb-16 md:pt-16 md:pb-20">
          <div className="relative mx-auto max-w-7xl px-6">
            <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-white/40">
              {eyebrow}
            </p>

            <div className="mt-4 max-w-4xl">
              <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
                {title}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">
                {description}
              </p>

              {meta ? (
                <p className="mt-4 text-sm text-white/30">{meta}</p>
              ) : null}

              {actions.length > 0 ? (
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  {actions.map((action) => (
                    <Link
                      key={`${action.label}-${action.href}`}
                      href={action.href}
                      className={
                        action.tone === "secondary"
                          ? "rounded-full border border-white/[0.08] bg-white/[0.04] px-6 py-3 text-sm font-medium text-white/60 transition-colors hover:text-white"
                          : "rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-text transition-colors hover:bg-accent-hover"
                      }
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section data-header-theme="light" className="bg-surface-warm pb-20">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6">
            {children}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

export function MarketingSection({
  eyebrow,
  title,
  description,
  children,
}: MarketingSectionProps) {
  return (
    <section className="rounded-2xl bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:p-10">
      {eyebrow ? (
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-content-tertiary">
          {eyebrow}
        </p>
      ) : null}

      <div className="max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight text-content-primary md:text-4xl">
          {title}
        </h2>

        {description ? (
          <p className="mt-4 text-base leading-relaxed text-content-secondary">
            {description}
          </p>
        ) : null}
      </div>

      <div className="mt-8">{children}</div>
    </section>
  );
}

export function MarketingCard({
  title,
  description,
  children,
}: MarketingCardProps) {
  return (
    <div className="rounded-xl bg-surface-warm p-6">
      <h3 className="text-xl font-semibold tracking-tight text-content-primary">{title}</h3>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-content-secondary">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

export function MarketingBulletList({ items }: MarketingBulletListProps) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-content-secondary">
          <span className="mt-1.5 h-2 w-2 rounded-full bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
