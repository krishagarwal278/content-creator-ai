import type { SlideData, SlideshowStyle } from "@/api/slideshow-service";

export function normalizeSlideshowSlides(slidesRaw: unknown): SlideData[] {
  if (!Array.isArray(slidesRaw)) {
    return [];
  }

  return slidesRaw.map((slide: unknown, idx: number) => {
    const s = slide as Record<string, unknown>;

    const rawSlideNumber = s?.slideNumber ?? s?.slide_number ?? s?.slideNum;
    const slideNumber =
      typeof rawSlideNumber === "number" ? rawSlideNumber : Number(rawSlideNumber ?? idx + 1);

    const rawTitle = s?.title ?? s?.slideTitle ?? s?.heading;
    const title =
      typeof rawTitle === "string" && String(rawTitle).trim().length > 0
        ? String(rawTitle).trim()
        : `Slide ${idx + 1}`;

    const rawBullets = s?.bulletPoints ?? s?.bullet_points ?? s?.bullets ?? [];
    const bulletPoints = Array.isArray(rawBullets)
      ? rawBullets.map((b: unknown) => String(b)).filter((b: string) => b.trim().length > 0)
      : [];

    const rawNarration = s?.narration ?? s?.narration_text;
    const narration = typeof rawNarration === "string" ? rawNarration : "";

    const rawImageUrl =
      s?.imageUrl ??
      s?.image_url ??
      s?.image ??
      (s?.imageUrl as Record<string, string>)?.url ??
      (s?.image_url as Record<string, string>)?.url ??
      (s?.image as Record<string, string>)?.url ??
      s?.imageLink ??
      s?.image_link;
    const imageUrl =
      typeof rawImageUrl === "string" && rawImageUrl.trim().length > 0 ? rawImageUrl.trim() : "";

    const rawKeyStat = s?.keyStat ?? s?.key_stat;
    const keyStat =
      typeof rawKeyStat === "string" && rawKeyStat.trim().length > 0
        ? rawKeyStat.trim()
        : undefined;

    const rawSubtitle = s?.subtitle ?? s?.sub_title;
    const subtitle =
      typeof rawSubtitle === "string" && rawSubtitle.trim().length > 0
        ? rawSubtitle.trim()
        : undefined;

    return {
      slideNumber: Number.isFinite(slideNumber) && slideNumber > 0 ? slideNumber : idx + 1,
      title,
      bulletPoints,
      narration,
      imageUrl: imageUrl || undefined,
      keyStat,
      subtitle,
      image_url: imageUrl || undefined,
      bullet_points: bulletPoints,
      narration_text: narration || undefined,
      slide_number: Number.isFinite(slideNumber) && slideNumber > 0 ? slideNumber : idx + 1,
      ...s,
    } as SlideData;
  });
}

export function normalizeSlideshowDesignStyle(styleRaw: unknown): SlideshowStyle {
  switch (styleRaw) {
    case "modern":
    case "minimal":
    case "corporate":
    case "creative":
      return styleRaw;
    default:
      return "modern";
  }
}
