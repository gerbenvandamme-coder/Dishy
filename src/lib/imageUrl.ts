/** Thumbnail widths Wikimedia generates on request. */
const WIKIMEDIA_WIDTHS = [120, 250, 330, 500, 960, 1280] as const;

/**
 * Returns a smaller version of a dish photo when the host can resize on request, so a thumbnail
 * never downloads a full-size photo. Unknown hosts (uploads, pasted links) are returned unchanged.
 */
export function sizedImageUrl(src: string, width: number): string {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return src;
  }

  if (url.hostname === "images.unsplash.com") {
    url.searchParams.set("w", String(width));
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("q", url.searchParams.get("q") ?? "75");
    return url.toString();
  }

  // Wikimedia serves thumbnails at fixed widths only; pick the smallest one that is wide enough.
  if (url.hostname === "thumb.wikimedia.org" || url.hostname === "upload.wikimedia.org") {
    const step = WIKIMEDIA_WIDTHS.find((candidate) => candidate >= width) ?? 1280;
    const thumb = url.pathname.match(/^(\/wikipedia\/commons\/thumb\/.+?)\/\d+px-([^/]+)$/);
    if (thumb) return `https://${url.hostname}${thumb[1]}/${step}px-${thumb[2]}`;
    return src;
  }

  if (url.hostname === "images.pexels.com") {
    url.searchParams.set("w", String(width));
    url.searchParams.set("auto", "compress");
    url.searchParams.set("cs", "tinysrgb");
    return url.toString();
  }

  return src;
}
