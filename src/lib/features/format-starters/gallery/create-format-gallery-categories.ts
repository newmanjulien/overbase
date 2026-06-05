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
import type { CreateFormatGalleryCategoryId } from "$domain/format-starters/gallery-categories";

type CreateFormatsIndustryFilterId = "all" | FormatStarterIndustryTagId;

export type { CreateFormatGalleryCategoryId } from "$domain/format-starters/gallery-categories";

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

const INDUSTRY_CATEGORY_INFO_BAR = {
  label: "Next step:",
  text: "Select a starter to design an email format your team will receive",
};

const DEFAULT_CREATE_FORMAT_GALLERY_CATEGORY_ID = "public-data";

const PUBLIC_DATA_CREATE_FORMAT_GALLERY_CATEGORY = {
  id: DEFAULT_CREATE_FORMAT_GALLERY_CATEGORY_ID,
  label: "Public data",
  mode: "public-data",
  industry: "all",
  infoBar: {
    label: "Tip:",
    text: "These are for testing Overbase with public data - use the dropdown to see starters for your industry",
  },
} satisfies CreateFormatGalleryCategory;

const CREATE_FORMAT_GALLERY_INDUSTRY_CATEGORIES = FORMAT_STARTER_INDUSTRY_TAGS.map((tag) => ({
  id: tag.id,
  label: tag.label,
  mode: "all" as const,
  industry: tag.id,
  infoBar: INDUSTRY_CATEGORY_INFO_BAR,
})) satisfies readonly CreateFormatGalleryCategory[];

export const CREATE_FORMAT_GALLERY_CATEGORIES = [
  PUBLIC_DATA_CREATE_FORMAT_GALLERY_CATEGORY,
  ...CREATE_FORMAT_GALLERY_INDUSTRY_CATEGORIES,
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

export function getCreateFormatGalleryDropdownCategories(
  workspaceIndustryId: string | null | undefined,
): readonly CreateFormatGalleryCategory[] {
  return [
    ...CREATE_FORMAT_GALLERY_INDUSTRY_CATEGORIES.filter(
      (category) => category.id === workspaceIndustryId,
    ),
    ...CREATE_FORMAT_GALLERY_INDUSTRY_CATEGORIES.filter(
      (category) => category.id !== workspaceIndustryId,
    ),
    PUBLIC_DATA_CREATE_FORMAT_GALLERY_CATEGORY,
  ];
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
    return selectedCategory ?? PUBLIC_DATA_CREATE_FORMAT_GALLERY_CATEGORY;
  }

  return (
    getCreateFormatGalleryCategoryById(fallbackCategoryId) ??
    PUBLIC_DATA_CREATE_FORMAT_GALLERY_CATEGORY
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
