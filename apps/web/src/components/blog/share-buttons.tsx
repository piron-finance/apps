"use client";

import { useState } from "react";

type ShareButtonsProps = {
  title: string;
  url: string;
  xCopy?: string;
};

export function ShareButtons({ title, url, xCopy }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedXCopy = encodeURIComponent(xCopy || title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:border-white/20 hover:text-white"
      >
        LinkedIn
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedXCopy}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:border-white/20 hover:text-white"
      >
        X
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:border-white/20 hover:text-white"
      >
        {copied ? "Link copied" : "Copy post link"}
      </button>
    </div>
  );
}
