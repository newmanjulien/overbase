import {
  formatParagraph as paragraph,
  formatText as text,
  formatVariable as variable,
} from "$lib/features/format-starters/domain";
import {
  defineFormatStarter,
  seededSpreadsheetAttachment,
  spreadsheetCell as cell,
  spreadsheetVariable as sheetVariable,
} from "./helpers";

export const callIntelligenceFormatStarter = defineFormatStarter({
  slug: "call-intelligence",
  formatDefinitionSlug: "call-intelligence",
  title: "Call intelligence",
  description: "Find opportunities to upsell from account management calls",
  dataSourceIds: ["gong", "salesforce", "calendar"],
  industryTags: ["consulting"],
  variables: [
    { id: "account_name", label: "Account name" },
    { id: "account_owner", label: "Account owner" },
    { id: "call_date", label: "Call date" },
    { id: "call_topic", label: "Call topic" },
    { id: "call_signal", label: "Call signal" },
    { id: "call_timestamp", label: "Call timestamp" },
    { id: "expansion_opportunity", label: "Expansion opportunity" },
    { id: "retention_risk", label: "Retention risk" },
    { id: "risk_owner", label: "Risk owner" },
    { id: "stakeholder_name", label: "Stakeholder name" },
    { id: "stakeholder_role", label: "Stakeholder role" },
    { id: "recommended_follow_up", label: "Recommended follow-up" },
    { id: "next_meeting_date", label: "Next meeting date" },
  ],
  sampleEmail: {
    subject: "Chevron opportunity",
    paragraphs: [
      "Hi Ethan,",
      "A few people from the Chevron account mentioned 'legacy identity systems' in recent calls. They also mentioned authentication delays on calls with Microsoft and other partners.",
      "This may be a cue to discuss identity modernization. And you might check out these recordings:",
    ],
  },
  details: {
    paragraphs: [
      "Create a call-intelligence brief from account calls, CRM context, and upcoming meetings.",
      "The attachment organizes signals, timestamps, account owners, and recommended follow-up actions.",
    ],
  },
  artwork: {
    id: "call-intelligence-blue",
    iconId: "phone-call",
    panel: {
      backColor: "#B8E0FF",
      frontColor: "#CDB4DB",
      iconCenterX: "57%",
      iconCenterY: "47%",
    },
  },
  startingPointSelection: {
    kind: "guided",
    intro:
      "Choose the call signal so the brief focuses on the right follow-up opportunity.",
    questions: [
      {
        id: "signal_type",
        title: "What signal did the call surface?",
        options: [
          { id: "expansion", label: "Expansion" },
          { id: "risk", label: "Retention risk" },
          { id: "stakeholder", label: "Stakeholder change" },
        ],
      },
      {
        id: "follow_up_style",
        title: "What follow-up is needed?",
        options: [
          { id: "upsell", label: "Upsell angle" },
          { id: "save", label: "Save plan" },
          { id: "intro", label: "New intro" },
        ],
      },
      {
        id: "audience",
        title: "Who should receive it?",
        options: [
          { id: "account_owner", label: "Account owner" },
          { id: "partner", label: "Partner" },
          { id: "team", label: "Account team" },
        ],
      },
    ],
    rules: [
      {
        id: "risk-signal",
        startingPointId: "risk-brief",
        answers: { signal_type: "risk" },
      },
      {
        id: "save-plan",
        startingPointId: "risk-brief",
        answers: { follow_up_style: "save" },
      },
      {
        id: "stakeholder-change",
        startingPointId: "stakeholder-brief",
        answers: { signal_type: "stakeholder" },
      },
      {
        id: "new-intro",
        startingPointId: "stakeholder-brief",
        answers: { follow_up_style: "intro" },
      },
      { id: "default", startingPointId: "expansion-brief", answers: {} },
    ],
  },
  startingPoints: [
    {
      id: "expansion-brief",
      label: "Expansion brief",
      variantSlug: "default",
      emailContent: {
        title: "Call expansion brief",
        to: ["Account owner"],
        cc: ["Account team"],
        attachment: seededSpreadsheetAttachment("Call expansion signals.xlsx", [
          [
            cell("Signal"),
            cell("Call evidence"),
            cell("Opportunity"),
            cell("Next step"),
          ],
          [
            cell(sheetVariable("call_signal")),
            cell(sheetVariable("call_timestamp")),
            cell(sheetVariable("expansion_opportunity")),
            cell(sheetVariable("recommended_follow_up")),
          ],
          [
            cell("Meeting"),
            cell(sheetVariable("call_date")),
            cell(sheetVariable("account_name")),
            cell(sheetVariable("next_meeting_date")),
          ],
        ]),
        body: [
          paragraph("expansion-greeting", [
            text("Hi "),
            variable("account_owner"),
            text(","),
          ]),
          paragraph("expansion-summary", [
            text("I reviewed the "),
            variable("account_name"),
            text(" call from "),
            variable("call_date"),
            text(" and found this expansion signal: "),
            variable("call_signal"),
            text("."),
          ]),
          paragraph("expansion-next-step", [
            text("The recommended follow-up is "),
            variable("recommended_follow_up"),
            text(" before "),
            variable("next_meeting_date"),
            text("."),
          ]),
        ],
      },
    },
    {
      id: "risk-brief",
      label: "Retention risk brief",
      variantSlug: "default",
      emailContent: {
        title: "Call retention risk brief",
        to: ["Account owner"],
        cc: ["Partner"],
        attachment: seededSpreadsheetAttachment("Call risk signals.xlsx", [
          [
            cell("Risk signal"),
            cell("Timestamp"),
            cell("Impacted workstream"),
            cell("Owner"),
          ],
          [
            cell(sheetVariable("retention_risk")),
            cell(sheetVariable("call_timestamp")),
            cell(sheetVariable("call_topic")),
            cell(sheetVariable("risk_owner")),
          ],
          [
            cell("Mitigation"),
            cell(sheetVariable("recommended_follow_up")),
            cell(sheetVariable("account_name")),
            cell(sheetVariable("next_meeting_date")),
          ],
        ]),
        body: [
          paragraph("risk-greeting", [
            text("Hi "),
            variable("account_owner"),
            text(","),
          ]),
          paragraph("risk-summary", [
            text("The "),
            variable("account_name"),
            text(" call surfaced this retention risk: "),
            variable("retention_risk"),
            text("."),
          ]),
          paragraph("risk-owner", [
            variable("risk_owner"),
            text(" should own the follow-up: "),
            variable("recommended_follow_up"),
            text("."),
          ]),
        ],
      },
    },
    {
      id: "stakeholder-brief",
      label: "Stakeholder change brief",
      variantSlug: "default",
      emailContent: {
        title: "Stakeholder call brief",
        to: ["Account owner"],
        cc: ["Account team"],
        attachment: seededSpreadsheetAttachment("Stakeholder call brief.xlsx", [
          [
            cell("Stakeholder"),
            cell("Role"),
            cell("Signal"),
            cell("Follow-up"),
          ],
          [
            cell(sheetVariable("stakeholder_name")),
            cell(sheetVariable("stakeholder_role")),
            cell(sheetVariable("call_signal")),
            cell(sheetVariable("recommended_follow_up")),
          ],
          [
            cell("Call"),
            cell(sheetVariable("call_date")),
            cell(sheetVariable("call_topic")),
            cell(sheetVariable("next_meeting_date")),
          ],
        ]),
        body: [
          paragraph("stakeholder-greeting", [
            text("Hi "),
            variable("account_owner"),
            text(","),
          ]),
          paragraph("stakeholder-summary", [
            variable("stakeholder_name"),
            text(" came up on the "),
            variable("account_name"),
            text(" call as "),
            variable("stakeholder_role"),
            text("."),
          ]),
          paragraph("stakeholder-next-step", [
            text("The clean follow-up is "),
            variable("recommended_follow_up"),
            text(", ideally before "),
            variable("next_meeting_date"),
            text("."),
          ]),
        ],
      },
    },
  ],
  showInGallery: true,
  modeSortOrder: 14,
  status: "active",
});
