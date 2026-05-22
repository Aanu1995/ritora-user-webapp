"use client";

import Image, { type ImageProps } from "next/image";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type SmoothImageProps = {
  src: string;
  alt: string;
  className: string;
  imageClassName?: string;
  fallback?: ReactNode;
  sizes?: ImageProps["sizes"];
  loading?: ImageProps["loading"];
  fetchPriority?: ImageProps["fetchPriority"];
  priority?: ImageProps["priority"];
  unoptimized?: ImageProps["unoptimized"];
};

export function SmoothImage({ src, ...props }: SmoothImageProps) {
  return <SmoothImageFrame key={src} src={src} {...props} />;
}

function SmoothImageFrame({
  src,
  alt,
  className,
  imageClassName,
  fallback,
  sizes,
  loading,
  fetchPriority,
  priority,
  unoptimized = true,
}: SmoothImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={cn(
        "relative block overflow-hidden bg-surface-muted",
        className,
      )}
      data-image-loaded={loaded ? "true" : "false"}
    >
      {!loaded && !failed ? (
        <span
          aria-hidden
          className="absolute inset-0 animate-pulse bg-surface-muted"
        />
      ) : null}

      {failed ? (
        fallback
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading={loading}
          fetchPriority={fetchPriority}
          priority={priority}
          unoptimized={unoptimized}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "object-cover opacity-0 transition-opacity duration-200 ease-out",
            loaded && "opacity-100",
            imageClassName,
          )}
        />
      )}
    </span>
  );
}
