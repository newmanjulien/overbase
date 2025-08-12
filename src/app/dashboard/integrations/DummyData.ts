export interface PreviewImage {
  id: string;
  src: string;
  alt: string;
}

export interface Integration {
  id: string;
  title: string;
  subtitle: string; // required
  logo: string;
  status?: string;
  badge?: string;
  lastUpdated?: string;
  previewImages?: PreviewImage[]; // optional now
}

export const integrations: Integration[] = [
  {
    id: "growthbook",
    title: "GrowthBook",
    subtitle: "Open source feature flags and A/B tests",
    logo: "/images/gmail.png",
    badge: "Billed Via Vercel",
    lastUpdated: "just now",
    previewImages: [
      {
        id: "first",
        src: "/images/slack.png",
        alt: "Dashboard Overview",
      },
      {
        id: "second",
        src: "/images/slack.png",
        alt: "Experiment Results",
      },
      {
        id: "third",
        src: "/images/slack.png",
        alt: "Feature Flags",
      },
      {
        id: "fourth",
        src: "/images/slack.png",
        alt: "Analytics Dashboard",
      },
    ],
  },
  {
    id: "clerk",
    title: "Clerk",
    subtitle: "Drop-in authentication for React",
    logo: "/images/gmail.png",
    previewImages: [
      {
        id: "first",
        src: "/placeholder-uhyqz.png",
        alt: "Authentication UI",
      },
    ],
  },
  {
    id: "inngest",
    title: "Inngest",
    subtitle: "Reliable & powerful background functions",
    logo: "/images/gmail.png",
  },
  {
    id: "upstash",
    title: "Upstash",
    subtitle: "Serverless DB (Redis, Vector, Queue)",
    logo: "/images/gmail.png",
  },
  {
    id: "turso",
    title: "Turso Cloud",
    subtitle: "SQLite for the age of AI",
    logo: "/images/gmail.png",
  },
  {
    id: "planetscale",
    title: "PlanetScale",
    subtitle: "The world's most advanced serverless MySQL platform",
    logo: "/images/gmail.png",
  },
  {
    id: "stripe",
    title: "Stripe",
    subtitle: "Online payment processing for internet businesses",
    logo: "/images/gmail.png",
  },
];
