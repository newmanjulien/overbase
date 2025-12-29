import type { FunctionReturnType } from "convex/server";
import type { api } from "@convex/_generated/api";
import type { GradientKey } from "./gradients";
import { GRADIENTS, DEFAULT_GRADIENT } from "./gradients";

/**
 * Raw template type as returned from Convex query.
 * The gradient field is a string that may or may not be a valid GradientKey.
 */
export type TemplateFromConvex = FunctionReturnType<
  typeof api.features.templates.getAllTemplates
>[number];

/**
 * Template with validated gradient key.
 * Use this type in presentational components.
 */
export interface Template {
  _id: TemplateFromConvex["_id"];
  title: string;
  description: string;
  content: string;
  gradient: GradientKey;
  imageUrl: string | null;
  tags: string[];
}

/**
 * Validates and normalizes a gradient string to a GradientKey.
 * Returns DEFAULT_GRADIENT if the value is not a valid gradient key.
 */
export function validateGradient(gradient: string): GradientKey {
  if (gradient in GRADIENTS) {
    return gradient as GradientKey;
  }
  return DEFAULT_GRADIENT;
}

/**
 * Transforms a raw Convex template to a Template with validated gradient.
 */
export function normalizeTemplate(template: TemplateFromConvex): Template {
  return {
    _id: template._id,
    title: template.title,
    description: template.description,
    content: template.content,
    gradient: validateGradient(template.gradient),
    imageUrl: template.imageUrl,
    tags: template.tags,
  };
}
