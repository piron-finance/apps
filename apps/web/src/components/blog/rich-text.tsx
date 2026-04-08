"use client";

import Image from "next/image";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { urlFor } from "@/lib/sanity/image";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-base leading-8 text-white/65">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-semibold tracking-tight text-white">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-[#00C48C]/50 pl-5 text-lg leading-8 text-white/75">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="space-y-3 pl-5 text-base leading-8 text-white/65">
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
          className="text-[#8CF6D3] underline decoration-[#8CF6D3]/30 underline-offset-4 hover:text-white"
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
      const imageUrl = value?.asset?._ref ? urlFor(value).width(1600).fit("max").url() : null;

      if (!imageUrl) {
        return null;
      }

      return (
        <figure className="space-y-3">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03]">
            <Image
              src={imageUrl}
              alt={value?.alt || ""}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 900px"
            />
          </div>
          {value?.caption ? (
            <figcaption className="text-sm leading-relaxed text-white/45">
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
            ? "border-[#00C48C]/30 bg-[#00C48C]/10"
            : "border-white/10 bg-white/[0.04]";

      return (
        <div className={`rounded-[1.5rem] border p-5 ${tone}`}>
          {value?.title ? (
            <h4 className="text-lg font-semibold text-white">{value.title}</h4>
          ) : null}
          {value?.body ? (
            <p className="mt-2 text-sm leading-7 text-white/65">{value.body}</p>
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
