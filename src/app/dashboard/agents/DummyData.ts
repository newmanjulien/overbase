// DummyData.ts

// === Category Definitions ===
export const categoriesConfig = [
  {
    key: "installed",
    name: "Installed",
    header: "Installed Agents",
    subheader: "These are the agents you've already installed.",
  },
  {
    key: "email",
    name: "Email & Slack",
    header: "Email & Slack Agents",
    subheader: "Automate your email and Slack workflows.",
  },
  {
    key: "sales",
    name: "After Sales Calls",
    header: "After Sales Calls",
    subheader: "Support your post-call workflow and CRM updates.",
  },
  {
    key: "customer",
    name: "Customer Success",
    header: "Customer Success Agents",
    subheader: "Take care of your customers with automated tasks.",
  },
];

// === Agents Data ===
export interface Agent {
  id: number;
  title: string;
  description: string;
  categories: string[];
  gradientFrom: string;
  gradientTo: string;
  image?: string;
}

export const initialAgents: Agent[] = [
  {
    id: 1,
    title: "Highlight success",
    description:
      "Find emails and Slacks where you can highlight your team's success",
    categories: ["email", "installed"],
    gradientFrom: "from-yellow-300",
    gradientTo: "to-yellow-500",
    image: "/images/slack.png",
  },
  {
    id: 2,
    title: "Call to CRM",
    description: "Update your CRM after your call with a prospect",
    categories: ["sales"],
    gradientFrom: "from-purple-700",
    gradientTo: "to-pink-400",
    image: "/images/gong-bg.png",
  },
  {
    id: 3,
    title: "Action CRM to-dos",
    description: "Take the to-dos assigned to you in your CRM and action them",
    categories: ["sales"],
    gradientFrom: "from-green-900",
    gradientTo: "to-green-500",
    image: "/images/pipedrive-bg.png",
  },
  {
    id: 4,
    title: "Prep quarterly call",
    description: "Prepare the data for your quarterly calls with customers",
    categories: ["customer"],
    gradientFrom: "from-blue-400",
    gradientTo: "to-indigo-500",
    image: "/images/notion.png",
  },
  {
    id: 5,
    title: "Archive all useless emails",
    description:
      "Archive all emails which should be ignored every Friday evening",
    categories: ["email"],
    gradientFrom: "from-emerald-400",
    gradientTo: "to-blue-600",
    image: "/images/gmail.png",
  },
];
