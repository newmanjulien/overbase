export interface PreviewImage {
  id: number;
  src: string;
  alt: string;
}

export interface Integration {
  id: number;
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
    id: 1,
    title: "GrowthBook",
    subtitle: "Open source feature flags and A/B tests",
    logo: "/images/gmail.png",
    badge: "Billed Via Vercel",
    lastUpdated: "just now",
    previewImages: [
      {
        id: 1,
        src: "/images/slack.png",
        alt: "Dashboard Overview",
      },
      {
        id: 2,
        src: "/images/slack.png",
        alt: "Experiment Results",
      },
      {
        id: 3,
        src: "/images/slack.png",
        alt: "Feature Flags",
      },
      {
        id: 4,
        src: "/images/slack.png",
        alt: "Analytics Dashboard",
      },
      // {
      //   id: 5,
      //   src: "/images/slack.png",
      //   alt: "Analytics Dashboard",
      // },
    ],
  },
  {
    id: 2,
    title: "Clerk",
    subtitle: "Drop-in authentication for React",
    logo: "/images/gmail.png",
    previewImages: [
      {
        id: 1,
        src: "/placeholder-uhyqz.png",
        alt: "Authentication UI",
      },
    ],
  },
  {
    id: 3,
    title: "Inngest",
    subtitle: "Reliable & powerful background functions",
    logo: "/images/gmail.png",
  },
  {
    id: 4,
    title: "Upstash",
    subtitle: "Serverless DB (Redis, Vector, Queue)",
    logo: "/images/gmail.png",
  },
  {
    id: 5,
    title: "Turso Cloud",
    subtitle: "SQLite for the age of AI",
    logo: "/images/gmail.png",
  },
  {
    id: 6,
    title: "PlanetScale",
    subtitle: "The world's most advanced serverless MySQL platform",
    logo: "/images/gmail.png",
  },
  {
    id: 7,
    title: "Stripe",
    subtitle: "Online payment processing for internet businesses",
    logo: "/images/gmail.png",
  },
];
