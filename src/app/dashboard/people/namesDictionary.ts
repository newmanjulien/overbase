/**
 * Dictionary of names for adding new people.
 */

export const NAMES = [
  "Alex Johnson",
  "Maria Garcia",
  "James Chen",
  "Sarah Patel",
  "Michael Brown",
  "Emily Wong",
  "David Kim",
  "Lisa Taylor",
  "Robert Martinez",
  "Jennifer Lee",
  "Daniel Wilson",
  "Amanda Nguyen",
  "Christopher Davis",
  "Michelle Thompson",
  "Kevin Anderson",
  "Rachel White",
  "Brandon Harris",
  "Jessica Clark",
  "Tyler Robinson",
  "Samantha Lewis",
];

export function getRandomName(): string {
  return NAMES[Math.floor(Math.random() * NAMES.length)];
}
