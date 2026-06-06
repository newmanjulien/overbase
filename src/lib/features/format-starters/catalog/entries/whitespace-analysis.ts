import {
  formatParagraph as paragraph,
  formatText as text,
  formatVariable as variable,
} from "$lib/features/format-starters/domain";
import {
  defineFormatStarter,
  seededSpreadsheetAttachment,
  spreadsheetCell as cell,
} from "./helpers";

export const formatStarter = defineFormatStarter({
  slug: "whitespace-analysis",
  formatDefinitionSlug: "whitespace-analysis",
  defaultPresentation: {
    title: "Whitespace analysis",
    description: "Give brokers benchmarks for renewal conversations",
  },
  dataSourceIds: ["calendar", "epic", "onedrive"],
  industryTags: ["insurance"],
  variables: [
    { id: "prospect_company", label: "Prospect company" },
    { id: "buyer_name", label: "Buyer name" },
    { id: "deal_owner", label: "Deal owner" },
    { id: "procurement_owner", label: "Procurement owner" },
    { id: "opportunity_name", label: "Opportunity name" },
    { id: "deal_stage", label: "Deal stage" },
    { id: "business_goal", label: "Business goal" },
    { id: "proposal_link", label: "Proposal link" },
    { id: "next_step", label: "Next step" },
    { id: "next_step_date", label: "Next step date" },
    { id: "commercial_question", label: "Commercial question" },
  ],
  sampleEmail: {
    subject: "Report for Exterra",
    paragraphs: [
      "Hi Stephen,",
      "A whitespace analysis for the Exterra renewal is attached.",
      "We identified new policies worth $400,000 which you might propose at your renewal meeting next month.",
      "Each proposed policy has a benchmark. Those were calculated with data from Allianz and Chubb. The right people from both carriers are CCed.",
    ],
  },
  details: {
    paragraphs: [
      "Create a useful follow-up after discovery, proposal review, or procurement discussion.",
      "The attachment captures next steps, open questions, and ownership.",
    ],
  },
  startingPointSelection: {
    kind: "guided",
    intro:
      "Shape the whitespace analysis around the renewal opportunity.",
    questions: [
      {
        id: "analysis_focus",
        title: "What should the whitespace analysis focus on?",
        options: [
          { id: "renewal_growth", label: "Renewal growth" },
          { id: "coverage_gap", label: "Coverage gap" },
          { id: "carrier_benchmark", label: "Carrier benchmark" },
        ],
      },
    ],
    rules: [
      {
        id: "renewal-growth",
        startingPointId: "whitespace-analysis",
        answers: { analysis_focus: "renewal_growth" },
      },
      {
        id: "coverage-gap",
        startingPointId: "whitespace-analysis",
        answers: { analysis_focus: "coverage_gap" },
      },
      {
        id: "carrier-benchmark",
        startingPointId: "whitespace-analysis",
        answers: { analysis_focus: "carrier_benchmark" },
      },
      { id: "default", startingPointId: "whitespace-analysis", answers: {} },
    ],
  },
  startingPoints: [
    {
      id: "whitespace-analysis",
      label: "Whitespace analysis",
      variantSlug: "default",
      emailContent: {
        title: "Whitespace analysis",
        to: ["Buyer"],
        cc: ["Deal team"],
        attachment: seededSpreadsheetAttachment("Whitespace analysis.xlsx", [
          [cell("Opportunity"), cell("Benchmark"), cell("Owner"), cell("Next step")],
          [
            cell("New policies"),
            cell("$400,000"),
            cell(variable("deal_owner")),
            cell(variable("next_step")),
          ],
          [
            cell("Carrier benchmark"),
            cell("Allianz and Chubb"),
            cell(variable("procurement_owner")),
            cell(variable("commercial_question")),
          ],
        ]),
        body: [
          paragraph("whitespace-greeting", [
            text("Hi "),
            variable("buyer_name"),
            text(","),
          ]),
          paragraph("whitespace-summary", [
            text("Attached is a whitespace analysis for "),
            variable("opportunity_name"),
            text(" at "),
            variable("prospect_company"),
            text("."),
          ]),
          paragraph("whitespace-opportunity", [
            text("We identified new policies worth $400,000 that can support "),
            variable("business_goal"),
            text("."),
          ]),
          paragraph("whitespace-next-step", [
            text("The next step is "),
            variable("next_step"),
            text(" on "),
            variable("next_step_date"),
            text("."),
          ]),
        ],
      },
    },
  ],
  showInGallery: true,
  modeSortOrder: 20,
  status: "active",
});
