export interface DummyStep {
  title: string;
  prompt: string;
  context: string;
  integration?: string;
}

export const dummySteps: DummyStep[] = [
  {
    title: "Understand user’s problem",
    prompt:
      "Summarise the @customer’s last three support tickets and identify the core pain point.",
    context:
      "We are preparing for a QBR with a high-value customer that has had repeated onboarding issues.",
    integration: "/images/gmail.png",
  },
  {
    title: "Pull usage data",
    prompt:
      "Query Redshift for daily active users, seats provisioned vs. seats used, and top 5 features used last 30 days.",
    context:
      "Redshift schema: analytics.usage_metrics. Date column is event_date.",
  },
  {
    title: "Generate ROI narrative",
    prompt:
      "Take the usage metrics and create a 2-paragraph ROI story that can be pasted into the deck.",
    context: "Target KPIs: 20 % reduction in churn, 3× feature adoption.",
    integration: "/images/slack.png",
  },
  {
    title: "Draft follow-up email",
    prompt:
      "Write a concise follow-up email thanking the customer and attaching the ROI story.",
    context: "Tone: professional, upbeat, 120 words max.",
  },
  {
    title: "Create CRM tasks",
    prompt:
      "Create three follow-up tasks in HubSpot assigned to the CSM: schedule next check-in, share roadmap, send case-study request.",
    context: "Due dates: 1 week, 4 weeks, 8 weeks respectively.",
    integration: "/images/slack.png",
  },
  {
    title: "Slack summary to team",
    prompt:
      "Post a short Slack message in #customer-success summarising the call and next steps.",
    context: "Channel: #customer-success. Tag @cs-lead.",
  },
  {
    title: "Save artefacts to Drive",
    prompt:
      "Upload the deck and ROI story to the shared Google Drive folder: /Customers/CustomerName/QBR-2024-Q3.",
    context: "Ensure the folder is shared with the customer’s champions.",
  },
];
