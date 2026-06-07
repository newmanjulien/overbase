import {
  formatParagraph as paragraph,
  formatText as text,
  formatVariable as variable,
} from "$lib/features/format-starters/domain";
import type { FormatStarter } from "../types";
import {
  seededSpreadsheetAttachment,
  spreadsheetCell as cell,
} from "./helpers";

export const formatStarter = {
  slug: "renewal-upsell",
  defaultPresentation: {
    title: "Upsell at renewal",
    description: "Make it comfortable for brokers to upsell clients",
  },
  dataSourceIds: ["calendar", "epic", "onedrive"],
  industryTags: ["insurance"],
  variables: [
    { id: "broker_name", label: "Broker name" },
    { id: "existing_client", label: "Existing client" },
    { id: "premiums_amount", label: "Premiums amount" },
  ],
  sampleEmail: {
    subject: "Report for Exterra",
    paragraphs: [
      "Hi Stephen,",
      "A renewal upsell report for the Exterra renewal is attached.",
      "We identified new policies worth $400,000 which you might propose at your renewal meeting next month.",
      "Each proposed policy has a benchmark. Those were calculated with data from Allianz and Chubb. The right people from both carriers are CCed.",
    ],
  },
  details: {
    paragraphs: [
      "Your team receives a report by email 1 month before their annual renewal conversations with existing clients",
      "This report highlights the most profitable additional policies the client should buy",
    ],
  },
  startingPointSelection: {
    kind: "guided",
    intro:
      "We'll find the most profitable policies brokers should propose to each client. Then we'll send those policies to each broker 1 month before their renewal conversation with clients",
    questions: [
      {
        id: "broker-policy-comfort",
        title:
          "How comfortable is your average broker at talking about policies outside their wheelhouse?",
        options: [
          {
            id: "obscure-policy-comfortable",
            label: "Can discuss even the most obscure policy",
          },
          {
            id: "adjacent-policy-comfortable",
            label: "Can discuss policies adjacent to their area of expertise",
          },
          {
            id: "limited-policy-bandwidth",
            label: "Don't have bandwidth to be an expert in everything",
          },
        ],
      },
      {
        id: "policy-recommendation-data",
        title:
          "What data do you want to use to find these policy opportunities?",
        options: [
          {
            id: "public-firm-carrier-data",
            label:
              "Public data, data from our firm and ideally some carrier benchmarks",
          },
          {
            id: "public-firm-data",
            label: "Public data and data from our firm",
          },
          {
            id: "firm-data-only",
            label: "Only internal data from our firm",
          },
        ],
      },
    ],
    rules: [
      {
        id: "obscure-policy-comfortable",
        startingPointId: "renewal-upsell",
        answers: { "broker-policy-comfort": "obscure-policy-comfortable" },
      },
      {
        id: "adjacent-policy-comfortable",
        startingPointId: "renewal-upsell",
        answers: { "broker-policy-comfort": "adjacent-policy-comfortable" },
      },
      {
        id: "limited-policy-bandwidth",
        startingPointId: "renewal-upsell",
        answers: { "broker-policy-comfort": "limited-policy-bandwidth" },
      },
      { id: "default", startingPointId: "renewal-upsell", answers: {} },
    ],
  },
  startingPoints: [
    {
      id: "renewal-upsell",
      label: "Renewal upsell",
      emailContent: {
        title: "Renewal upsell",
        to: ["Broker"],
        cc: [],
        attachment: seededSpreadsheetAttachment("report.xlsx", []),
        body: [
          paragraph("renewal-greeting", [
            text("Hi "),
            variable("broker_name"),
            text(","),
          ]),
          paragraph("renewal-summary", [
            text("Attached is a report for the upcoming renewal with "),
            variable("existing_client"),
            text("."),
          ]),
          paragraph("renewal-opportunity", [
            text("We identified new policies worth "),
            variable("premiums_amount"),
            text("."),
          ]),
        ],
      },
    },
  ],
  showInGallery: true,
  sortOrder: 20,
  status: "active",
} satisfies FormatStarter;
