/**
 * Predefined gradient tokens for templates.
 *
 * Each key is a semantic name, each value is the Tailwind classes.
 * Add new gradients here — they'll automatically be available in Convex.
 */
export const GRADIENTS = {
  sunset: "from-yellow-400 via-orange-500 to-red-600",
  ocean: "from-cyan-400 via-blue-500 to-indigo-600",
  forest: "from-green-400 via-emerald-500 to-teal-600",
  berry: "from-purple-400 via-pink-500 to-rose-600",
  mint: "from-emerald-400 via-teal-500 to-cyan-600",
  fire: "from-orange-400 via-red-500 to-rose-600",
  lavender: "from-indigo-400 via-purple-500 to-fuchsia-600",
  lime: "from-lime-400 via-green-500 to-emerald-600",
} as const;

export type GradientKey = keyof typeof GRADIENTS;

/** Default gradient if none specified or key not found */
export const DEFAULT_GRADIENT: GradientKey = "mint";
