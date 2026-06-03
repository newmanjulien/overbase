import type { EmailFormatDataSourceRequirement } from "./data-source-requirements";
import type {
  EmailFormatActivationRequirement,
  EmailFormatContentEditPolicy,
  EmailFormatDefinition,
  EmailFormatDefinitionBase,
  EmailFormatRulesEditPolicy,
} from "./types";

const INTERNAL_DATA_CONTENT_EDIT_POLICY = {
  title: true,
  to: true,
  cc: true,
  attachment: true,
  body: true,
} as const satisfies EmailFormatContentEditPolicy;

const PUBLIC_DATA_CONTENT_EDIT_POLICY = {
  title: false,
  to: false,
  cc: false,
  attachment: false,
  body: false,
} as const satisfies EmailFormatContentEditPolicy;

const INTERNAL_DATA_RULES_EDIT_POLICY = {
  text: true,
  list: true,
  dataSources: true,
} as const satisfies EmailFormatRulesEditPolicy;

const PUBLIC_DATA_RULES_EDIT_POLICY = {
  text: false,
  list: false,
  dataSources: true,
} as const satisfies EmailFormatRulesEditPolicy;

const INTERNAL_DATA_RULE_INFO_CARD = {
  label: "Next steps:",
  content:
    "Make these rules as precise and detailed as possible, you can also train the AI by giving feedback on specific sent emails",
} as const satisfies NonNullable<EmailFormatDefinitionBase["ruleInfoCard"]>;

const DEFAULT_ACTIVATION_REQUIREMENTS = [
  { kind: "recipients" },
  { kind: "rules" },
] as const satisfies readonly EmailFormatActivationRequirement[];

const LINKED_DATA_SOURCE_ACTIVATION_REQUIREMENT = {
  id: "linked-data-sources",
  kind: "linkedDataSources",
  scope: "format",
  requiredAt: ["activation"],
} as const satisfies EmailFormatDataSourceRequirement;

const LINKEDIN_CONTACTS_RULE_ID = "only-rule";

const RECONNECT_LINKEDIN_CONTACTS_CREATION_REQUIREMENT = {
  id: "linkedin-contacts",
  kind: "linkedinContacts",
  scope: "rule",
  ruleId: LINKEDIN_CONTACTS_RULE_ID,
  requiredAt: ["creation", "activation"],
  attachMode: "upload-new",
  actionLabel: "Add LinkedIn contacts",
  linkedLabel: "LinkedIn contacts added",
} as const satisfies EmailFormatDataSourceRequirement;

const RECONNECT_LINKEDIN_CONTACTS_ACTIVATION_REQUIREMENT = {
  ...RECONNECT_LINKEDIN_CONTACTS_CREATION_REQUIREMENT,
  requiredAt: ["activation"],
  attachMode: "link-existing",
} as const satisfies EmailFormatDataSourceRequirement;

export const emailFormatDefinitionEntries = [
  {
    slug: "reconnect-linkedin",
    dataMode: "public-data",
    contentEditPolicy: PUBLIC_DATA_CONTENT_EDIT_POLICY,
    rulesEditPolicy: PUBLIC_DATA_RULES_EDIT_POLICY,
    ruleInfoCard: {
      label: "Tip:",
      content: [
        {
          kind: "text",
          text: "Everything is preset because this format only uses public data. Formats that ",
        },
        {
          kind: "link",
          label: "use internal data",
          href: "/create-formats?mode=internal-data",
        },
        {
          kind: "text",
          text: " let you customize",
        },
      ],
    },
    variants: [
      {
        slug: "personal",
        label: "Reconnect with contacts",
        initialRecipients: "viewer",
        activationRequirements: DEFAULT_ACTIVATION_REQUIREMENTS,
        dataSourceRequirements: [
          RECONNECT_LINKEDIN_CONTACTS_CREATION_REQUIREMENT,
        ],
        initialRules: [
          {
            id: LINKEDIN_CONTACTS_RULE_ID,
            text: "Ask team members about their relationship with each person in their LinkedIn contacts. When you find someone worth reconnecting with, look for news or content that would make it easy",
          },
        ],
      },
      {
        slug: "team",
        label: "Reconnect with contacts for team members",
        initialRecipients: "none",
        activationRequirements: DEFAULT_ACTIVATION_REQUIREMENTS,
        dataSourceRequirements: [
          RECONNECT_LINKEDIN_CONTACTS_ACTIVATION_REQUIREMENT,
        ],
        initialRules: [
          {
            id: LINKEDIN_CONTACTS_RULE_ID,
            text: "Ask team members about their relationship with each person in their LinkedIn contacts. When you find someone worth reconnecting with, look for news or content that would make it easy",
          },
        ],
      },
      {
        slug: "senior-leadership",
        label: "Reconnect with contacts for senior leadership",
        initialRecipients: "none",
        activationRequirements: DEFAULT_ACTIVATION_REQUIREMENTS,
        dataSourceRequirements: [
          RECONNECT_LINKEDIN_CONTACTS_ACTIVATION_REQUIREMENT,
        ],
        initialRules: [
          {
            id: LINKEDIN_CONTACTS_RULE_ID,
            text: "Ask team members about their relationship with each person in their LinkedIn contacts. When you find someone worth reconnecting with, look for news or content that would make it easy",
          },
        ],
      },
    ],
  },
  {
    slug: "warm-up",
    dataMode: "internal-data",
    contentEditPolicy: INTERNAL_DATA_CONTENT_EDIT_POLICY,
    rulesEditPolicy: INTERNAL_DATA_RULES_EDIT_POLICY,
    ruleInfoCard: INTERNAL_DATA_RULE_INFO_CARD,
    variants: [
      {
        slug: "default",
        label: "Client update",
        initialRecipients: "none",
        activationRequirements: DEFAULT_ACTIVATION_REQUIREMENTS,
        dataSourceRequirements: [LINKED_DATA_SOURCE_ACTIVATION_REQUIREMENT],
      },
    ],
  },
  {
    slug: "whitespace-analysis",
    dataMode: "internal-data",
    contentEditPolicy: INTERNAL_DATA_CONTENT_EDIT_POLICY,
    rulesEditPolicy: INTERNAL_DATA_RULES_EDIT_POLICY,
    ruleInfoCard: INTERNAL_DATA_RULE_INFO_CARD,
    variants: [
      {
        slug: "default",
        label: "Deal follow-up",
        initialRecipients: "none",
        activationRequirements: DEFAULT_ACTIVATION_REQUIREMENTS,
        dataSourceRequirements: [LINKED_DATA_SOURCE_ACTIVATION_REQUIREMENT],
      },
    ],
  },
  {
    slug: "pitch-context",
    dataMode: "internal-data",
    contentEditPolicy: INTERNAL_DATA_CONTENT_EDIT_POLICY,
    rulesEditPolicy: INTERNAL_DATA_RULES_EDIT_POLICY,
    ruleInfoCard: INTERNAL_DATA_RULE_INFO_CARD,
    variants: [
      {
        slug: "default",
        label: "Pitch context",
        initialRecipients: "none",
        activationRequirements: DEFAULT_ACTIVATION_REQUIREMENTS,
        dataSourceRequirements: [LINKED_DATA_SOURCE_ACTIVATION_REQUIREMENT],
      },
    ],
  },
  {
    slug: "call-intelligence",
    dataMode: "internal-data",
    contentEditPolicy: INTERNAL_DATA_CONTENT_EDIT_POLICY,
    rulesEditPolicy: INTERNAL_DATA_RULES_EDIT_POLICY,
    ruleInfoCard: INTERNAL_DATA_RULE_INFO_CARD,
    variants: [
      {
        slug: "default",
        label: "Call intelligence",
        initialRecipients: "none",
        activationRequirements: DEFAULT_ACTIVATION_REQUIREMENTS,
        dataSourceRequirements: [LINKED_DATA_SOURCE_ACTIVATION_REQUIREMENT],
      },
    ],
  },
  {
    slug: "top-of-mind",
    dataMode: "internal-data",
    contentEditPolicy: INTERNAL_DATA_CONTENT_EDIT_POLICY,
    rulesEditPolicy: INTERNAL_DATA_RULES_EDIT_POLICY,
    ruleInfoCard: INTERNAL_DATA_RULE_INFO_CARD,
    variants: [
      {
        slug: "default",
        label: "Implementation plan",
        initialRecipients: "none",
        activationRequirements: DEFAULT_ACTIVATION_REQUIREMENTS,
        dataSourceRequirements: [LINKED_DATA_SOURCE_ACTIVATION_REQUIREMENT],
      },
    ],
  },
] as const satisfies readonly EmailFormatDefinition[];
