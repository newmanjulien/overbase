export interface DummyStep {
  title: string;
  prompt: string;
  context?: string;
  integration?: string;
}

export const dummySteps: DummyStep[] = [
  {
    title: "Emails from the past 24h",
    prompt:
      "Grab from my @gmail all the emails from the past 24h. Filter to only emails where there's at least 1 of my internal colleagues",
    integration: "/images/gmail.png",
  },
  {
    title: "Slacks from the past 24h",
    prompt:
      "Grab from @slack all the conversations in public channels which I'm a member of",
    integration: "/images/slack.png",
  },
  {
    title: "Messages where a colleague did something worth celebrating",
    prompt:
      "Find hard to achieve result. Surpassing a goal. Keeping a deadline. Innovative ideas. Take screenshots and put them in a @doc. Include the % of certainty beside each screenshot",
    context: "Look at the Success folder in my @gmail for examples",
    integration: "/images/docs.png",
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
