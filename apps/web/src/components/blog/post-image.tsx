import Image from "next/image";
import type { BlogImage } from "@/lib/blog/types";

type PostImageProps = {
  image?: BlogImage;
  title: string;
  category?: string;
  priority?: boolean;
  className?: string;
  intrinsic?: boolean;
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
      className={`relative overflow-hidden rounded-3xl border border-border bg-[linear-gradient(135deg,rgba(0,196,140,0.18),rgba(15,23,42,0.95)_55%,rgba(14,165,233,0.16))] ${className}`}
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
        <span className="inline-flex w-fit rounded-full border border-border bg-surface-secondary px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-content-secondary">
          {category || "Piron"}
        </span>
        <div>
          <p className="max-w-sm text-2xl font-semibold leading-tight tracking-tight text-content-primary md:text-3xl">
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
  intrinsic = false,
}: PostImageProps) {
  const url = image?.asset?.url;
  const width = image?.asset?.metadata?.dimensions?.width || 1200;
  const height = image?.asset?.metadata?.dimensions?.height || 800;
  const aspectRatio = width / height;
  const isWideBanner = aspectRatio >= 2;

  if (!url) {
    if (intrinsic) {
      return (
        <div className={`aspect-[16/9] ${className}`}>
          <FallbackArt title={title} category={category} className="h-full w-full" />
        </div>
      );
    }

    return <FallbackArt title={title} category={category} className={className} />;
  }

  if (intrinsic) {
    return (
      <div
        className={`overflow-hidden rounded-3xl border border-border ${
          isWideBanner ? "bg-black/30" : "bg-surface-card"
        } ${className}`}
      >
        <Image
          src={url}
          alt={image?.alt || title}
          width={width}
          height={height}
          priority={priority}
          className="h-auto w-full"
          sizes="(max-width: 1280px) 100vw, 1100px"
          placeholder={image?.asset?.metadata?.lqip ? "blur" : "empty"}
          blurDataURL={image?.asset?.metadata?.lqip}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-border ${
        isWideBanner ? "bg-black/30" : "bg-surface-card"
      } ${className}`}
    >
      <Image
        src={url}
        alt={image?.alt || title}
        fill
        priority={priority}
        className={isWideBanner ? "object-contain" : "object-cover"}
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
