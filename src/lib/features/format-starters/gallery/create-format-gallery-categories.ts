import {
  createFormatsGalleryHref,
  normalizeCreateFormatsModeFilter,
  type CreateFormatsGalleryHref,
  type CreateFormatsModeFilterId,
} from "$lib/app/app-links";
import {
  FORMAT_STARTER_INDUSTRY_TAGS,
  isFormatStarterIndustryTagId,
  type FormatStarterGalleryEntry,
  type FormatStarterIndustryTagId,
} from "$lib/features/format-starters/catalog";
import type { CreateFormatGalleryCategoryId } from "$shared/create-format-gallery";

type CreateFormatsIndustryFilterId = "all" | FormatStarterIndustryTagId;

export type { CreateFormatGalleryCategoryId } from "$shared/create-format-gallery";

export type CreateFormatGalleryCategory = {
  id: CreateFormatGalleryCategoryId;
  label: string;
  mode: CreateFormatsModeFilterId;
  industry: CreateFormatsIndustryFilterId;
  infoBar: {
    label: string;
    text: string;
  };
};

export const CREATE_FORMAT_GALLERY_CATEGORIES = [
  {
    id: "public-data",
    label: "Public data",
    mode: "public-data",
    industry: "all",
    infoBar: {
      label: "Tip:",
      text: "These are for testing Overbase with public data - use the dropdown to get starters for your industry",
    },
  },
  ...FORMAT_STARTER_INDUSTRY_TAGS.map((tag) => ({
    id: tag.id,
    label: tag.label,
    mode: "all" as const,
    industry: tag.id,
    infoBar: getIndustryCategoryInfoBar(tag.id),
  })),
] satisfies readonly CreateFormatGalleryCategory[];

export function getCreateFormatGalleryCategoryById(
  categoryId: string | null | undefined,
): CreateFormatGalleryCategory | null {
  return (
    CREATE_FORMAT_GALLERY_CATEGORIES.find(
      (category) => category.id === categoryId,
    ) ?? null
  );
}

export function getCreateFormatGalleryCategoryFromSearchParams(
  searchParams: URLSearchParams,
  fallbackCategoryId?: string | null,
): CreateFormatGalleryCategory {
  const hasExplicitCategoryFilter =
    searchParams.has("mode") || searchParams.has("industry");
  const selectedMode = normalizeCreateFormatsModeFilter(
    searchParams.get("mode"),
  );
  const selectedIndustry = normalizeCreateFormatsIndustryFilter(
    searchParams.get("industry"),
  );
  const selectedCategory =
    CREATE_FORMAT_GALLERY_CATEGORIES.find(
      (category) =>
        category.mode === selectedMode &&
        category.industry === selectedIndustry,
    ) ?? null;

  if (selectedCategory || hasExplicitCategoryFilter) {
    return selectedCategory ?? CREATE_FORMAT_GALLERY_CATEGORIES[0];
  }

  return (
    getCreateFormatGalleryCategoryById(fallbackCategoryId) ??
    CREATE_FORMAT_GALLERY_CATEGORIES[0]
  );
}

export function createFormatGalleryCategoryHref(
  category: CreateFormatGalleryCategory,
): CreateFormatsGalleryHref {
  if (category.id === "public-data") {
    return createFormatsGalleryHref({ mode: "public-data" });
  }

  return createFormatsGalleryHref({
    mode: category.mode,
    industry: category.industry,
  });
}

export function matchesCreateFormatGalleryCategory(
  formatStarter: FormatStarterGalleryEntry,
  category: CreateFormatGalleryCategory,
) {
  if (category.id === "public-data") {
    return formatStarter.mode === "public-data";
  }

  return (
    formatStarter.mode !== "public-data" &&
    formatStarter.industryTags.includes(category.id)
  );
}

function normalizeCreateFormatsIndustryFilter(
  value: string | null | undefined,
): CreateFormatsIndustryFilterId {
  return value && isFormatStarterIndustryTagId(value) ? value : "all";
}

function getIndustryCategoryInfoBar(industryTagId: FormatStarterIndustryTagId) {
  switch (industryTagId) {
    case "law":
      return {
        label: "Next step:",
        text: "Select a starter to design an email format your team will receive",
      };
    case "insurance":
      return {
        label: "Next step:",
        text: "Select a starter to design an email format your team will receive",
      };
    case "consulting":
      return {
        label: "Next step",
        text: "Select a starter to design an email format your team will receive",
      };
  }
}
