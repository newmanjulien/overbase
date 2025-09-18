// === Category Definitions ===
export const tagsConfig = [
  {
    key: "onboarding",
    name: "Onboarding",
    header: "Onboarding Tasks",
    subheader:
      "Guide new clients to adopt and start using the platform effectively",
  },
  {
    key: "quarterly",
    name: "Quarterly Reviews",
    header: "Quarterly Reviews",
    subheader: "Prepare and present quarterly business reviews to clients",
  },
  {
    key: "support",
    name: "Support & Troubleshooting",
    header: "Support & Troubleshooting",
    subheader: "Assist clients with technical or product-related issues",
  },
  {
    key: "adoption",
    name: "Product Adoption",
    header: "Product Adoption",
    subheader: "Help clients adopt new features and maximize usage",
  },
  {
    key: "renewals",
    name: "Renewals & Upsell",
    header: "Renewals & Upsell",
    subheader: "Manage subscription renewals and identify upsell opportunities",
  },
  {
    key: "feedback",
    name: "Feedback & Advocacy",
    header: "Feedback & Advocacy",
    subheader: "Collect client feedback and build advocacy programs",
  },
  {
    key: "productFeedback",
    name: "Product Feedback",
    header: "Product Feedback",
    subheader:
      "Communicate customer insights and feature requests to the product team",
  },
];

// === Templates Data ===
export interface Template {
  id: number;
  title: string;
  description: string;
  tags: string[];
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  image?: string;
}

export const initialTemplates: Template[] = [
  // --- ONBOARDING ---
  {
    id: 1,
    title: "Client Kickoff Call",
    description: "Schedule and conduct a kickoff call with a new client",
    tags: ["onboarding"],
    gradientFrom: "from-yellow-400",
    gradientVia: "via-yellow-500",
    gradientTo: "to-orange-600",
  },
  {
    id: 2,
    title: "Setup Client Account",
    description:
      "Configure client account settings, permissions, and integrations",
    tags: ["onboarding"],
    gradientFrom: "from-green-400",
    gradientVia: "via-lime-500",
    gradientTo: "to-teal-600",
  },
  {
    id: 3,
    title: "Data Import & Migration",
    description: "Assist client with importing their data into the platform",
    tags: ["onboarding"],
    gradientFrom: "from-blue-400",
    gradientVia: "via-indigo-500",
    gradientTo: "to-violet-600",
    image: "/images/supabase.png",
  },

  // --- QUARTERLY ---
  {
    id: 4,
    title: "Prepare QBRs",
    description:
      "Analyze usage, metrics, and outcomes to prepare a report for client review",
    tags: ["quarterly"],
    gradientFrom: "from-purple-400",
    gradientVia: "via-fuchsia-500",
    gradientTo: "to-pink-600",
  },
  {
    id: 5,
    title: "Present QBR to Client",
    description:
      "Deliver insights, recommendations, and roadmap in a client meeting",
    tags: ["quarterly"],
    gradientFrom: "from-rose-400",
    gradientVia: "via-red-500",
    gradientTo: "to-rose-600",
  },

  // --- SUPPORT ---
  {
    id: 6,
    title: "Resolve Technical Issue",
    description: "Help client troubleshoot product or integration issues",
    tags: ["support"],
    gradientFrom: "from-orange-400",
    gradientVia: "via-amber-500",
    gradientTo: "to-red-600",
  },
  {
    id: 7,
    title: "Answer Feature Questions",
    description:
      "Respond to client inquiries about platform features and functionality",
    tags: ["support"],
    gradientFrom: "from-emerald-400",
    gradientVia: "via-green-500",
    gradientTo: "to-teal-600",
  },
  {
    id: 8,
    title: "Escalate Critical Issue",
    description:
      "Identify urgent problems and coordinate with engineering team",
    tags: ["support"],
    gradientFrom: "from-fuchsia-400",
    gradientVia: "via-purple-500",
    gradientTo: "to-indigo-600",
  },

  // --- ADOPTION ---
  {
    id: 9,
    title: "Feature Adoption Campaign",
    description: "Encourage clients to start using new platform features",
    tags: ["adoption"],
    gradientFrom: "from-cyan-400",
    gradientVia: "via-sky-500",
    gradientTo: "to-blue-600",
  },
  {
    id: 10,
    title: "Monitor Usage Metrics",
    description: "Track client engagement and highlight areas for improvement",
    tags: ["adoption"],
    gradientFrom: "from-teal-400",
    gradientVia: "via-emerald-500",
    gradientTo: "to-green-600",
  },

  // --- RENEWALS ---
  {
    id: 11,
    title: "Prepare Renewal Proposal",
    description:
      "Draft contract renewal proposals including upsell opportunities",
    tags: ["renewals"],
    gradientFrom: "from-pink-400",
    gradientVia: "via-rose-500",
    gradientTo: "to-red-600",
  },
  {
    id: 12,
    title: "Conduct Renewal Meeting",
    description:
      "Meet client to review contract, usage, and propose renewal terms",
    tags: ["renewals"],
    gradientFrom: "from-purple-400",
    gradientVia: "via-indigo-500",
    gradientTo: "to-violet-600",
  },

  // --- FEEDBACK & ADVOCACY ---
  {
    id: 13,
    title: "Collect Client Feedback",
    description: "Send surveys or conduct interviews to gather feedback",
    tags: ["feedback"],
    gradientFrom: "from-red-400",
    gradientVia: "via-rose-500",
    gradientTo: "to-pink-600",
  },
  {
    id: 14,
    title: "Create Client Advocacy Program",
    description:
      "Identify happy clients for testimonials, case studies, or references",
    tags: ["feedback"],
    gradientFrom: "from-green-400",
    gradientVia: "via-emerald-500",
    gradientTo: "to-teal-600",
  },

  // --- PRODUCT FEEDBACK ---
  {
    id: 15,
    title: "Collect Feature Requests",
    description: "Gather client requests and ideas for new features",
    tags: ["productFeedback"],
    gradientFrom: "from-indigo-400",
    gradientVia: "via-violet-500",
    gradientTo: "to-purple-600",
  },
  {
    id: 16,
    title: "Summarize Client Feedback",
    description: "Compile and organize customer feedback for the product team",
    tags: ["productFeedback"],
    gradientFrom: "from-teal-400",
    gradientVia: "via-cyan-500",
    gradientTo: "to-blue-600",
  },
  {
    id: 17,
    title: "Report Bugs to Engineering",
    description: "Document and submit client-reported bugs to engineering",
    tags: ["productFeedback"],
    gradientFrom: "from-red-400",
    gradientVia: "via-rose-500",
    gradientTo: "to-pink-600",
  },
  {
    id: 18,
    title: "Feature Prioritization Meeting",
    description:
      "Collaborate with product team to prioritize features based on customer feedback",
    tags: ["productFeedback"],
    gradientFrom: "from-orange-400",
    gradientVia: "via-amber-500",
    gradientTo: "to-red-600",
  },
];
