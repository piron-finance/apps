import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

/**
 * Renders a post body stored as Markdown. Safe by design — react-markdown only
 * emits a known set of elements and rehype-sanitize strips anything unexpected,
 * so untrusted, DB-authored content can never inject markup/scripts. (Add
 * rehype-raw before rehype-sanitize if inline HTML is ever needed.)
 */

const components = {
  h2: ({ node, ...props }: any) => (
    <h2
      className="mt-12 text-3xl font-semibold tracking-tight text-content-primary md:text-4xl"
      {...props}
    />
  ),
  h3: ({ node, ...props }: any) => (
    <h3
      className="mt-10 text-2xl font-semibold tracking-tight text-content-primary"
      {...props}
    />
  ),
  h4: ({ node, ...props }: any) => (
    <h4 className="mt-8 text-lg font-semibold text-content-primary" {...props} />
  ),
  p: ({ node, ...props }: any) => (
    <p className="text-base leading-8 text-content-secondary" {...props} />
  ),
  a: ({ node, href = "#", children, ...rest }: any) => {
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className="text-accent underline decoration-accent underline-offset-4 transition-colors hover:text-content-primary"
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        {...rest}
      >
        {children}
      </a>
    );
  },
  ul: ({ node, ...props }: any) => (
    <ul
      className="list-disc space-y-2 pl-5 text-base leading-8 text-content-secondary marker:text-content-tertiary"
      {...props}
    />
  ),
  ol: ({ node, ...props }: any) => (
    <ol
      className="list-decimal space-y-2 pl-5 text-base leading-8 text-content-secondary marker:text-content-tertiary"
      {...props}
    />
  ),
  li: ({ node, ...props }: any) => <li className="pl-1" {...props} />,
  blockquote: ({ node, ...props }: any) => (
    <blockquote
      className="rounded-r-lg border-l-2 border-accent bg-accent-subtle/40 py-1 pl-5 text-lg leading-8 text-content-secondary [&>p]:m-0"
      {...props}
    />
  ),
  hr: () => <hr className="border-border" />,
  img: ({ node, src, alt }: any) => (
    <figure className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt || ""} loading="lazy" decoding="async" className="h-auto w-full" />
      </div>
      {alt ? (
        <figcaption className="text-sm leading-relaxed text-content-tertiary">{alt}</figcaption>
      ) : null}
    </figure>
  ),
  code: ({ node, ...props }: any) => (
    <code
      className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.85em] text-content-primary"
      {...props}
    />
  ),
  pre: ({ node, ...props }: any) => (
    <pre
      className="overflow-x-auto rounded-2xl border border-border bg-[#0d0d0f] p-4 text-sm leading-6 text-content-secondary [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-content-secondary"
      {...props}
    />
  ),
  table: ({ node, ...props }: any) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm text-content-secondary" {...props} />
    </div>
  ),
  th: ({ node, ...props }: any) => (
    <th className="border-b border-border px-3 py-2 font-semibold text-content-primary" {...props} />
  ),
  td: ({ node, ...props }: any) => <td className="border-b border-border/60 px-3 py-2" {...props} />,
};

export function MarkdownContent({ source }: { source: string }) {
  return (
    <div className="space-y-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
