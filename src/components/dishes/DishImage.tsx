"use client";

import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { sizedImageUrl } from "@/lib/imageUrl";

interface DishImageProps {
  src?: string;
  alt: string;
  /** Sets the size, for example "aspect-[4/3] w-full". */
  className?: string;
  /** Largest width the photo is shown at, in CSS pixels. Hosts that can resize send a smaller file. */
  width?: number;
}

/** Dish photo in a debossed frame. Shows a placeholder when there is no photo or it fails to load. */
export function DishImage({ src, alt, className, width = 600 }: DishImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <span
      className={cn(
        "block rounded-2xl bg-(--tactile-bg) p-2 tactile-sunken",
        className,
      )}
    >
      <span className="relative block size-full overflow-hidden rounded-xl bg-black/5 dark:bg-white/5">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src ? sizedImageUrl(src, width * 2) : undefined}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailedSrc(src ?? null)}
            className="size-full object-cover"
          />
        ) : (
          <span
            role="img"
            aria-label={`Geen foto van ${alt}`}
            className="flex size-full items-center justify-center text-muted-foreground"
          >
            <UtensilsCrossed className="size-8 opacity-50" aria-hidden />
          </span>
        )}
      </span>
    </span>
  );
}