import Link from "next/link";
import Header from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/footer";

type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated: string;
  effectiveDate?: string;
  intro: string[];
  sections: LegalSection[];
  relatedDocuments: Array<{ label: string; href: string }>;
};

export function LegalPage({
  eyebrow,
  title,
  description,
  lastUpdated,
  effectiveDate,
  intro,
  sections,
  relatedDocuments,
}: LegalPageProps) {
  return (
    <div className="page-shell-gradient relative min-h-screen w-full">
      <Header />

      <div className="relative overflow-x-hidden">
        <section className="relative overflow-hidden pt-28 pb-10">
          <div className="page-shell-hero-glow pointer-events-none absolute inset-0" />

          <div className="relative mx-auto max-w-6xl px-6">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-content-tertiary">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {eyebrow}
            </div>

            <div className="max-w-3xl">
              <p className="text-sm text-content-tertiary">{lastUpdated}</p>
              <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-content-primary md:text-5xl">
                {title}
              </h1>
              {effectiveDate ? (
                <p className="mt-4 text-sm font-medium text-content-secondary">
                  {effectiveDate}
                </p>
              ) : null}
              <p className="mt-5 text-base leading-relaxed text-content-secondary md:text-lg">
                {description}
              </p>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
              <aside className="lg:sticky lg:top-24 lg:self-start lg:border-r lg:border-border lg:pr-8">
                <p className="text-[11px] uppercase tracking-[0.22em] text-content-tertiary">
                  On this page
                </p>
                <nav className="mt-4 space-y-2">
                  {sections.map((section) => (
                    <Link
                      key={section.id}
                      href={`#${section.id}`}
                      className="block text-sm leading-relaxed text-content-secondary transition-colors hover:text-content-primary"
                    >
                      {section.title}
                    </Link>
                  ))}
                </nav>

                <div className="mt-6 border-t border-border pt-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-content-tertiary">
                    Related documents
                  </p>
                  <div className="mt-4 space-y-2">
                    {relatedDocuments.map((document) => (
                      <Link
                        key={document.href}
                        href={document.href}
                        className="block text-sm text-content-secondary transition-colors hover:text-content-primary"
                      >
                        {document.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </aside>

              <article className="lg:pl-2">
                <div className="max-w-3xl">
                  {intro.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mb-5 text-base leading-relaxed text-content-secondary"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-10 space-y-10">
                  {sections.map((section) => (
                    <section
                      key={section.id}
                      id={section.id}
                      className="scroll-mt-28 border-t border-border pt-8 first:border-t-0 first:pt-0"
                    >
                      <h2 className="text-2xl font-semibold tracking-tight text-content-primary md:text-3xl">
                        {section.title}
                      </h2>

                      <div className="mt-4 space-y-4">
                        {section.paragraphs.map((paragraph) => (
                          <p
                            key={paragraph}
                            className="text-sm leading-relaxed text-content-secondary md:text-base"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>

                      {section.bullets && section.bullets.length > 0 ? (
                        <ul className="mt-5 space-y-3">
                          {section.bullets.map((bullet) => (
                            <li
                              key={bullet}
                              className="flex items-start gap-3 text-sm leading-relaxed text-content-secondary md:text-base"
                            >
                              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </section>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

export type { LegalSection };
