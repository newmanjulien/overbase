export interface PreviewImage {
  id: string;
  src: string;
  alt: string;
}

export interface ResourceLink {
  label: string;
  href: string;
}

export interface Connectors {
  id: string;
  title: string;
  subtitle: string;
  logo: string;
  status: "active" | "inactive"; // ✅ strict type
  badge?: string;
  lastUpdated?: string;
  previewImages?: PreviewImage[];
  installs?: string;
  categories?: string[];
  type?: string;
  resources?: ResourceLink[];
}

export const connectors: Connectors[] = [
  {
    id: "docs",
    title: "Google Docs",
    subtitle: "Get data from your docs",
    logo: "/images/docs.png",
    status: "inactive",
    installs: "<500 installs",
    categories: ["Productivity", "Docs"],
    type: "API",
    resources: [
      { label: "Docs", href: "https://docs.google.com" },
      { label: "Support", href: "https://support.google.com/docs" },
    ],
    previewImages: [
      { id: "first", src: "/images/slack.png", alt: "Dashboard Overview" },
      { id: "second", src: "/images/slack.png", alt: "Experiment Results" },
      { id: "third", src: "/images/slack.png", alt: "Feature Flags" },
      { id: "fourth", src: "/images/slack.png", alt: "Analytics Dashboard" },
      { id: "fifth", src: "/images/slack.png", alt: "Analytics Dashboard" },
    ],
  },
  {
    id: "gmail",
    title: "Gmail single",
    subtitle: "Pull data from your inbox (not from colleagues)",
    logo: "/images/gmail.png",
    status: "inactive",
    installs: "1,200 installs",
    categories: ["Communication", "Email"],
    type: "OAuth",
    resources: [
      { label: "Docs", href: "https://mail.google.com" },
      { label: "Support", href: "https://support.google.com/mail" },
    ],
    previewImages: [
      { id: "first", src: "/placeholder-uhyqz.png", alt: "Authentication UI" },
    ],
  },
  {
    id: "slack",
    title: "Slack public",
    subtitle: "Access public channels (not DMs)",
    logo: "/images/slack.png",
    status: "active",
    installs: "5,000 installs",
    categories: ["Communication", "Collaboration"],
    type: "API",
    resources: [
      { label: "Docs", href: "https://api.slack.com" },
      { label: "Support", href: "https://slack.com/help" },
    ],
  },
  {
    id: "gong",
    title: "Gong",
    subtitle: "Get recordings and transcripts",
    logo: "/images/gong.png",
    status: "inactive",
    installs: "300 installs",
    categories: ["Sales", "Analytics"],
    type: "API",
    resources: [{ label: "Docs", href: "https://gong.io" }],
  },
  {
    id: "docusign",
    title: "Docusign",
    subtitle: "Search customer agreements",
    logo: "/images/docusign.png",
    status: "inactive",
    installs: "800 installs",
    categories: ["CRM", "Sales"],
    type: "OAuth",
    resources: [{ label: "Docs", href: "https://pipedrive.com" }],
  },
  {
    id: "notion",
    title: "Notion",
    subtitle: "Access data from Notion",
    logo: "/images/notion.png",
    status: "inactive",
    installs: "2,500 installs",
    categories: ["Productivity", "Docs"],
    type: "API",
    resources: [{ label: "Docs", href: "https://developers.notion.com" }],
  },
  {
    id: "salesforce",
    title: "Salesforce",
    subtitle: "Access data from your CRM",
    logo: "/images/salesforce.png",
    status: "inactive",
    installs: "4,200 installs",
    categories: ["CRM", "Sales"],
    type: "OAuth",
    resources: [{ label: "Docs", href: "https://developer.salesforce.com" }],
  },
];
