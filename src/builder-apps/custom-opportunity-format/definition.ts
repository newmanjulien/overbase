import type { BuilderAppManifest } from "./types";
import { CUSTOM_OPPORTUNITY_FORMAT_APP_SLUG } from "../ids";

export const customEmailBuilderManifest = {
  slug: CUSTOM_OPPORTUNITY_FORMAT_APP_SLUG,
  title: "Custom opportunity format",
  description: "Explain the format of the emails you want your team to receive",
  details: {
    paragraphs: [
      "Overbase lets you share sales data with your ecosystem partners. You connect your company's data and your partners connect their data",
      "We then analyze this data, find revenue opportunities, and send them to you by email. This builder lets you design the emails you want to receive",
    ],
  },
  mode: "custom",
  guide: null,
} satisfies BuilderAppManifest;
