export interface DummyStep {
  title: string;
  prompt: string;
  conditions?: string;
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
    title: "Run it by Rebecca",
    prompt:
      "Email the @doc to @rebecca and ask her which of the messages she would keep. Tell her you need her input by 4pm. Remind her at 3pm. Adjust the @doc to only have the messages @rebecca approved",
    integration: "/images/docs.png",
  },

  {
    title: "Send me the opportunities",
    prompt:
      "Send me the opportunities to highlight success/wins by emailing me the @doc",
    conditions:
      "If @rebecca answered. Adjust the @doc and email it to me at 5pm. If @rebecca did NOT answer. Email me the @doc at 4pm. CC @rebecca. Note in your email to me that this doesn't include @rebecca's input",
    integration: "/images/docs.png",
  },
];
