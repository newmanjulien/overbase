export interface PreviewImage {
  id: string;
  src: string;
  alt: string;
}

export interface Integration {
  id: string;
  title: string;
  subtitle: string;
  logo: string;
  status?: string;
  badge?: string;
  lastUpdated?: string;
  previewImages?: PreviewImage[];
}

export const integrations: Integration[] = [
  {
    id: "docs",
    title: "Google Docs",
    subtitle: "Read, create and share Google Docs",
    logo: "/images/docs.png",
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
      {
        id: "fifth",
        src: "/images/slack.png",
        alt: "Analytics Dashboard",
      },
    ],
  },
  {
    id: "gmail",
    title: "Gmail read only",
    subtitle: "Access your email and create drafts (cannot send)",
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
    id: "slack",
    title: "Slack public",
    subtitle: "Access public Slack channels (not DMs)",
    logo: "/images/slack.png",
  },
  {
    id: "gong",
    title: "Gong",
    subtitle: "Get recordings and transcripts from Gong",
    logo: "/images/gong.png",
  },
  {
    id: "pipedrive",
    title: "Pipedrive",
    subtitle: "Full access to your Pipedrive CRM",
    logo: "/images/pipedrive.png",
  },
  {
    id: "notion",
    title: "Notion",
    subtitle: "Full access to your Notion docs",
    logo: "/images/notion.png",
  },
  {
    id: "salesforce",
    title: "Salesforce",
    subtitle: "Full access to your Salesforce CRM",
    logo: "/images/salesforce.png",
  },
];
