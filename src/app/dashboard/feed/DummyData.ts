import { RequestType } from "./RequestCard";

export const categories = [
  { name: "Currently in progress" },
  { name: "Requested this week" },
  { name: "Requested this month" },
  { name: "All requests" },
];

export const requests: RequestType[] = [
  {
    id: 1,
    title: "Did China lose money on its bullet train project?",
    content:
      "China's 18 main trunk lines of high-speed railways, only 6 lines are profitable, and the remaining 13 are loss-making. In 2022, China's high-speed rail suffered a total loss of US$15 billion. Therefore, if all high-speed rail in China is reg",
    status: "in-progress",
    askedDate: "Dec 15, 2025",
    followUpQuestions: [
      {
        id: "q1",
        question:
          "Can you provide the yearly revenue and loss breakdown per line?",
      },
      {
        id: "q2",
        question: "Which lines are profitable and which are not?",
      },
    ],
  },
  {
    id: 2,
    title: "Did China lose money on its bullet train project?",
    content:
      "China's 18 main trunk lines of high-speed railways, only 6 lines are profitable, and the remaining 13 are loss-making. In 2022, China's high-speed rail suffered a total loss of US$15 billion. Therefore, if all high-speed rail in China is reg",
    status: "completed",
    askedDate: "Dec 15, 2025",
    tableData: [
      {
        api_id: "gst-u75qm5FHGEVWFlH",
        name: "Andy Buchanan",
        first_name: "Andy",
        last_name: "Buchanan",
        email: "andrew.b@eminds.ai",
      },
      {
        api_id: "gst-FwxuJVWLWwsGyUJ",
        name: "Syed Altamash",
        first_name: "Syed",
        last_name: "Altamash",
        email: "syed.altamash@outlook.c...",
      },
      {
        api_id: "gst-qJDiH8Fh3ygqYzt",
        name: "Nikole Burke",
        first_name: "Nikole",
        last_name: "Burke",
        email: "nburke@incidentiq.com",
      },
    ],
  },
];

export const answerContextTexts = [
  "I left Reddit back in 2021 as for this app. Qoura neither one is better you can speak the words say whatever you need the proof what became better? The fact of not protecting when you started your app. Next post Right from this site to iMessage telegram phone numbers To my other iMessage and my other phone number should I get into the data and the dark side of these apps? I’m gonna show them Take those rules and regulations exploiting, etc. I said that one before This all happened in a couple days. Same person claiming someone else and they got hit And now who’s gonna answer for this? And other things there’s always good with bad at this point I don’t know which one is better. They’re both bad.",
  "The second answer provides insights from independent transport analysts.",
];
