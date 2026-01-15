import { SENDER, type Privacy } from "@/lib/questions/constants";
import type { QuestionVariant, ThreadAnswer } from "@/lib/questions";

// Mock Data
export const mockQuestion: QuestionVariant = {
  _id: "mock_question_id" as any,
  _creationTime: Date.now(),
  privacy: "team",

  // Derived fields
  displayContent:
    "Can you analyze the Q3 customer retention metrics compared to last year?",
  askedDate: "Oct 24, 2025",
  askedTimestamp: Date.now(),
  displayPrivacy: "team",
  isRecurring: false,
  variant: "answered",
  tableData: [],
};

export const mockAnswers: ThreadAnswer[] = [
  // First abstract answer = the question itself
  {
    _id: "mock_q_answer_id" as any,
    sender: SENDER.USER,
    content:
      "Can you analyze the Q3 customer retention metrics compared to last year?",
    privacy: "team",
    attachedKpis: [
      {
        metric: "Retention Rate",
        definition: "Percentage of customers retained",
        antiDefinition: "Churned customers",
      },
    ],
  },
  // The response
  {
    _id: "mock_response_id" as any,
    sender: SENDER.OVERBASE,
    content:
      "Here is the comparison of Q3 customer retention metrics between 2024 and 2025. We observed a 5% increase in retention year-over-year, primarily driven by the new onboarding initiatives.",
    privacy: "team",
    tableData: [
      {
        column1: "Metric",
        column2: "Q3 2024",
        column3: "Q3 2025",
        column4: "Change",
        column5: "", // Empty string for unused column
      },
      {
        column1: "Retention Rate",
        column2: "89%",
        column3: "94%",
        column4: "+5%",
        column5: "",
      },
      {
        column1: "Churn Rate",
        column2: "11%",
        column3: "6%",
        column4: "-5%",
        column5: "",
      },
      {
        column1: "Expansion Revenue",
        column2: "$120k",
        column3: "$145k",
        column4: "+21%",
        column5: "",
      },
    ],
  },
];
