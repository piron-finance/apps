"use client";

import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";

function getSanityAssetDimensions(assetRef?: string) {
  const match = assetRef?.match(/-(\d+)x(\d+)-/);

  if (!match) {
    return null;
  }

  return {
    width: Number.parseInt(match[1], 10),
    height: Number.parseInt(match[2], 10),
  };
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-base leading-8 text-content-secondary">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-semibold tracking-tight text-content-primary md:text-4xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-semibold tracking-tight text-content-primary">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-accent pl-5 text-lg leading-8 text-content-secondary">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="space-y-3 pl-5 text-base leading-8 text-content-secondary">
        {children}
      </ul>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="list-disc">{children}</li>,
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href || "#";
      const external = href.startsWith("http");

      return (
        <Link
          href={href}
          className="text-accent underline decoration-accent underline-offset-4 hover:text-content-primary"
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
        >
          {children}
        </Link>
      );
    },
  },
  types: {
    image: ({ value }) => {
      const imageUrl = value?._resolvedUrl || null;
      const dimensions = getSanityAssetDimensions(value?.asset?._ref);

      if (!imageUrl) {
        return null;
      }

      return (
        <figure className="space-y-3">
          <div className="overflow-hidden rounded-3xl border border-border bg-surface-card">
            <img
              src={imageUrl}
              alt={value?.alt || ""}
              width={dimensions?.width || 1600}
              height={dimensions?.height || 900}
              loading="lazy"
              decoding="async"
              className="h-auto w-full"
            />
          </div>
          {value?.caption ? (
            <figcaption className="text-sm leading-relaxed text-content-tertiary">
              {value.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
    callout: ({ value }) => {
      const tone =
        value?.tone === "warning"
          ? "border-amber-400/30 bg-amber-400/10"
          : value?.tone === "success"
            ? "border-accent bg-accent-subtle"
            : "border-border bg-white/[0.04]";

      return (
        <div className={`rounded-[1.5rem] border p-5 ${tone}`}>
          {value?.title ? (
            <h4 className="text-lg font-semibold text-content-primary">{value.title}</h4>
          ) : null}
          {value?.body ? (
            <p className="mt-2 text-sm leading-7 text-content-secondary">{value.body}</p>
          ) : null}
        </div>
      );
    },
  },
};

export function RichText({ value }: { value: any[] }) {
  return (
    <div className="space-y-6">
      <PortableText value={value} components={components} />
    </div>
  );
}
