/**
 * TAILWIND SAFELIST
 *
 * This file exists solely to ensure Tailwind includes these classes in the build.
 * These classes are used dynamically (loaded from Convex database) so Tailwind's
 * JIT compiler doesn't see them in the source code.
 *
 * DO NOT DELETE THIS FILE.
 */

// Gradient FROM classes
const gradientFrom = [
  "from-yellow-400",
  "from-green-400",
  "from-blue-400",
  "from-purple-400",
  "from-rose-400",
  "from-orange-400",
  "from-emerald-400",
  "from-fuchsia-400",
  "from-cyan-400",
  "from-teal-400",
  "from-pink-400",
  "from-indigo-400",
  "from-red-400",
];

// Gradient VIA classes
const gradientVia = [
  "via-yellow-500",
  "via-lime-500",
  "via-indigo-500",
  "via-fuchsia-500",
  "via-red-500",
  "via-amber-500",
  "via-green-500",
  "via-purple-500",
  "via-sky-500",
  "via-emerald-500",
  "via-rose-500",
  "via-violet-500",
  "via-cyan-500",
];

// Gradient TO classes
const gradientTo = [
  "to-orange-600",
  "to-teal-600",
  "to-violet-600",
  "to-pink-600",
  "to-rose-600",
  "to-red-600",
  "to-indigo-600",
  "to-blue-600",
  "to-green-600",
  "to-purple-600",
  "to-teal-500",
];

export { gradientFrom, gradientVia, gradientTo };
