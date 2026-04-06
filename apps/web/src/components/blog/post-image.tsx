import Image from "next/image";
import type { BlogImage } from "@/lib/blog/types";

type PostImageProps = {
  image?: BlogImage;
  title: string;
  category?: string;
  priority?: boolean;
  className?: string;
};

function FallbackArt({
  title,
  category,
  className = "",
}: {
  title: string;
  category?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(0,196,140,0.18),rgba(15,23,42,0.95)_55%,rgba(14,165,233,0.16))] ${className}`}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_70%)]" />
      <div className="relative flex h-full flex-col justify-between p-6">
        <span className="inline-flex w-fit rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/60">
          {category || "Piron"}
        </span>
        <div>
          <p className="max-w-sm text-2xl font-semibold leading-tight tracking-tight text-white md:text-3xl">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}

export function PostImage({
  image,
  title,
  category,
  priority = false,
  className = "",
}: PostImageProps) {
  const url = image?.asset?.url;
  const width = image?.asset?.metadata?.dimensions?.width || 1200;
  const height = image?.asset?.metadata?.dimensions?.height || 800;

  if (!url) {
    return <FallbackArt title={title} category={category} className={className} />;
  }

  return (
    <div className={`relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] ${className}`}>
      <Image
        src={url}
        alt={image?.alt || title}
        fill
        priority={priority}
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
        placeholder={image?.asset?.metadata?.lqip ? "blur" : "empty"}
        blurDataURL={image?.asset?.metadata?.lqip}
      />
      <Image
        src={url}
        alt=""
        width={width}
        height={height}
        className="invisible h-0 w-0"
      />
    </div>
  );
}
