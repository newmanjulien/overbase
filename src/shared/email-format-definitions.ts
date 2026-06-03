import {
  isEmailFormatDataSourceRequirementRequiredAt,
  type EmailFormatDataSourceRequirement,
} from "./email-format-data-source-requirements";

export type EmailFormatDataMode = "internal-data" | "public-data";

export type EmailFormatVariableDefinition = {
  id: string;
  label: string;
};

export type EmailFormatContentEditPolicy = {
  title: boolean;
  to: boolean;
  cc: boolean;
  attachment: boolean;
  body: boolean;
};

export type EmailFormatRulesEditPolicy = {
  text: boolean;
  list: boolean;
  dataSources: boolean;
};

export type EmailFormatRule = {
  id: string;
  text: string;
};

export type EmailFormatActivationRequirement =
  | {
      kind: "recipients";
    }
  | {
      kind: "rules";
    };

export type EmailFormatVariantInitialRecipients = "viewer" | "none";

export type EmailFormatVariant = {
  slug: string;
  label: string;
  initialRecipients: EmailFormatVariantInitialRecipients;
  activationRequirements: readonly EmailFormatActivationRequirement[];
  contentEditPolicy?: EmailFormatContentEditPolicy;
  rulesEditPolicy?: EmailFormatRulesEditPolicy;
  initialRules?: readonly EmailFormatRule[];
  dataSourceRequirements: readonly EmailFormatDataSourceRequirement[];
  ruleInfoCard?: {
    label: string;
    content: EmailFormatInlineTextContent;
  };
};

export type EmailFormatSpec = {
  definitionSlug: string;
  variantSlug: string;
  dataMode: EmailFormatDataMode;
  contentEditPolicy: EmailFormatContentEditPolicy;
  rulesEditPolicy: EmailFormatRulesEditPolicy;
  initialRecipients: EmailFormatVariantInitialRecipients;
  activationRequirements: readonly EmailFormatActivationRequirement[];
  dataSourceRequirements: readonly EmailFormatDataSourceRequirement[];
  initialRules: readonly EmailFormatRule[];
  ruleInfoCard: {
    label: string;
    content: EmailFormatInlineTextContent;
  } | null;
};

export type EmailFormatInlineTextContent =
  | string
  | readonly EmailFormatInlineTextPart[];

export type EmailFormatInlineTextPart =
  | {
      kind: "text";
      text: string;
    }
  | {
      kind: "link";
      label: string;
      href: `/${string}`;
    };

type EmailFormatDefinitionBase = {
  slug: string;
  dataMode: EmailFormatDataMode;
  contentEditPolicy: EmailFormatContentEditPolicy;
  rulesEditPolicy: EmailFormatRulesEditPolicy;
  variants: readonly EmailFormatVariant[];
  ruleInfoCard?: {
    label: string;
    content: EmailFormatInlineTextContent;
  };
};

export type InternalDataEmailFormatDefinition = EmailFormatDefinitionBase & {
  dataMode: "internal-data";
};

export type PublicDataEmailFormatDefinition = EmailFormatDefinitionBase & {
  dataMode: "public-data";
  ruleInfoCard: NonNullable<EmailFormatDefinitionBase["ruleInfoCard"]>;
};

export type EmailFormatDefinition =
  | InternalDataEmailFormatDefinition
  | PublicDataEmailFormatDefinition;

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

export type EmailFormatDefinitionValidationIssue = {
  definitionSlug?: string;
  variantSlug?: string;
  message: string;
};

export function validateEmailFormatDefinitions(
  definitions: readonly EmailFormatDefinition[],
): EmailFormatDefinitionValidationIssue[] {
  const issues: EmailFormatDefinitionValidationIssue[] = [];
  const definitionSlugs = new Set<string>();

  for (const definition of definitions) {
    if (!definition.slug.trim()) {
      issues.push({
        message: "Email format definitions cannot use an empty slug.",
      });
    }

    if (definitionSlugs.has(definition.slug)) {
      issues.push({
        definitionSlug: definition.slug,
        message: `Duplicate email format definition slug "${definition.slug}".`,
      });
    }

    definitionSlugs.add(definition.slug);

    if (definition.variants.length === 0) {
      issues.push({
        definitionSlug: definition.slug,
        message: "Email format definitions must define at least one variant.",
      });
    }

    if (
      definition.dataMode === "public-data" &&
      (!definition.ruleInfoCard.label.trim() ||
        !hasEmailFormatInlineTextContent(definition.ruleInfoCard.content))
    ) {
      issues.push({
        definitionSlug: definition.slug,
        message:
          "Public-data email format definitions must define rule info-card copy.",
      });
    }

    validateEmailFormatDefinitionVariants(issues, definition);
  }

  return issues;
}

function validateEmailFormatDefinitionVariants(
  issues: EmailFormatDefinitionValidationIssue[],
  definition: EmailFormatDefinition,
) {
  const variantSlugs = new Set<string>();

  for (const variant of definition.variants) {
    if (!variant.slug.trim()) {
      issues.push({
        definitionSlug: definition.slug,
        message: "Email format variants cannot use an empty slug.",
      });
    }

    if (variantSlugs.has(variant.slug)) {
      issues.push({
        definitionSlug: definition.slug,
        variantSlug: variant.slug,
        message: `Duplicate email format variant slug "${variant.slug}".`,
      });
    }

    variantSlugs.add(variant.slug);

    if (!variant.label.trim()) {
      issues.push({
        definitionSlug: definition.slug,
        variantSlug: variant.slug,
        message: "Email format variants must define a label.",
      });
    }

    if (variant.activationRequirements.length === 0) {
      issues.push({
        definitionSlug: definition.slug,
        variantSlug: variant.slug,
        message:
          "Email format variants must define at least one activation requirement.",
      });
    }

    validateEmailFormatVariantRules(issues, definition, variant);
    validateEmailFormatVariantActivationRequirements(
      issues,
      definition,
      variant,
    );
    validateEmailFormatVariantDataSourceRequirements(
      issues,
      definition,
      variant,
    );
  }
}

function validateEmailFormatVariantRules(
  issues: EmailFormatDefinitionValidationIssue[],
  definition: EmailFormatDefinition,
  variant: EmailFormatVariant,
) {
  const rules = variant.initialRules ?? [];
  const ruleIds = new Set<string>();

  for (const rule of rules) {
    if (ruleIds.has(rule.id)) {
      issues.push({
        definitionSlug: definition.slug,
        variantSlug: variant.slug,
        message: `Duplicate initial email-format rule id "${rule.id}".`,
      });
    }

    ruleIds.add(rule.id);

    if (!rule.id.trim()) {
      issues.push({
        definitionSlug: definition.slug,
        variantSlug: variant.slug,
        message: "Initial email-format rules cannot use an empty id.",
      });
    }

    if (!rule.text.trim()) {
      issues.push({
        definitionSlug: definition.slug,
        variantSlug: variant.slug,
        message: `Initial email-format rule "${rule.id}" must include text.`,
      });
    }
  }

  if (
    definition.dataMode === "public-data" &&
    hasActivationRequirement(variant, "rules") &&
    rules.length === 0
  ) {
    issues.push({
      definitionSlug: definition.slug,
      variantSlug: variant.slug,
      message:
        "Public-data email format variants with rule activation must define at least one initial rule.",
    });
  }
}

function validateEmailFormatVariantActivationRequirements(
  issues: EmailFormatDefinitionValidationIssue[],
  definition: EmailFormatDefinition,
  variant: EmailFormatVariant,
) {
  for (const requirement of variant.activationRequirements) {
    const requirementKind = (requirement as { kind: string }).kind;

    if (requirementKind !== "recipients" && requirementKind !== "rules") {
      issues.push({
        definitionSlug: definition.slug,
        variantSlug: variant.slug,
        message: `Email format variant uses unknown activation requirement "${String(
          requirementKind,
        )}".`,
      });
    }
  }
}

function validateEmailFormatVariantDataSourceRequirements(
  issues: EmailFormatDefinitionValidationIssue[],
  definition: EmailFormatDefinition,
  variant: EmailFormatVariant,
) {
  const dataSourceRequirements = variant.dataSourceRequirements;
  const initialRuleIds = new Set(
    (variant.initialRules ?? []).map((rule) => rule.id),
  );
  const requirementIds = new Set<string>();
  const requirementRuleIds = new Set<string>();
  let creationRequirementCount = 0;

  if (dataSourceRequirements.length === 0) {
    issues.push({
      definitionSlug: definition.slug,
      variantSlug: variant.slug,
      message:
        "Email format variants must define at least one data-source requirement.",
    });
  }

  for (const requirement of dataSourceRequirements) {
    const requirementKind = (requirement as { kind: string }).kind;
    const requirementScope = (requirement as { scope?: string }).scope;
    const requirementTimings = (
      requirement as { requiredAt?: readonly string[] }
    ).requiredAt;
    const requiresCreation = isEmailFormatDataSourceRequirementRequiredAt(
      requirement,
      "creation",
    );
    const requiresActivation = isEmailFormatDataSourceRequirementRequiredAt(
      requirement,
      "activation",
    );

    if (requirementIds.has(requirement.id)) {
      issues.push({
        definitionSlug: definition.slug,
        variantSlug: variant.slug,
        message: `Duplicate data-source requirement id "${requirement.id}".`,
      });
    }
    requirementIds.add(requirement.id);

    if (!requirement.id.trim()) {
      issues.push({
        definitionSlug: definition.slug,
        variantSlug: variant.slug,
        message: "Data-source requirements must define an id.",
      });
    }

    if (!Array.isArray(requirementTimings) || requirementTimings.length === 0) {
      issues.push({
        definitionSlug: definition.slug,
        variantSlug: variant.slug,
        message: "Data-source requirements must define when they are required.",
      });
    }

    if (requiresCreation) {
      creationRequirementCount += 1;
    }

    if (requirement.kind === "linkedDataSources") {
      if (requirementScope !== "format") {
        issues.push({
          definitionSlug: definition.slug,
          variantSlug: variant.slug,
          message: "Linked data-source requirements must be format-scoped.",
        });
      }

      if (!requiresActivation || requirement.requiredAt.length !== 1) {
        issues.push({
          definitionSlug: definition.slug,
          variantSlug: variant.slug,
          message:
            "Linked data-source requirements must be required at activation.",
        });
      }
      continue;
    }

    if (requirementKind !== "linkedinContacts") {
      issues.push({
        definitionSlug: definition.slug,
        variantSlug: variant.slug,
        message: `Email format variant uses unknown data-source requirement "${String(
          requirementKind,
        )}".`,
      });
      continue;
    }

    if (requirementRuleIds.has(requirement.ruleId)) {
      issues.push({
        definitionSlug: definition.slug,
        variantSlug: variant.slug,
        message: `Duplicate data-source requirement rule id "${requirement.ruleId}".`,
      });
    }
    requirementRuleIds.add(requirement.ruleId);

    if (requirementScope !== "rule") {
      issues.push({
        definitionSlug: definition.slug,
        variantSlug: variant.slug,
        message: "LinkedIn contacts requirements must be rule-scoped.",
      });
    }

    if (!requirement.ruleId.trim()) {
      issues.push({
        definitionSlug: definition.slug,
        variantSlug: variant.slug,
        message: "LinkedIn contacts requirements must reference a rule id.",
      });
      continue;
    }

    if (!initialRuleIds.has(requirement.ruleId)) {
      issues.push({
        definitionSlug: definition.slug,
        variantSlug: variant.slug,
        message: `LinkedIn contacts requirement references missing initial rule "${requirement.ruleId}".`,
      });
    }

    if (
      (requiresCreation && requirement.attachMode !== "upload-new") ||
      (!requiresCreation &&
        requiresActivation &&
        requirement.attachMode !== "link-existing")
    ) {
      issues.push({
        definitionSlug: definition.slug,
        variantSlug: variant.slug,
        message:
          "Data-source requirement timing and attach mode are inconsistent.",
      });
    }

    if (!requirement.actionLabel.trim() || !requirement.linkedLabel.trim()) {
      issues.push({
        definitionSlug: definition.slug,
        variantSlug: variant.slug,
        message:
          "Data-source requirements must define action and linked labels.",
      });
    }
  }

  if (creationRequirementCount > 1) {
    issues.push({
      definitionSlug: definition.slug,
      variantSlug: variant.slug,
      message:
        "Email format variants can define at most one creation data-source requirement.",
    });
  }
}

function hasActivationRequirement(
  variant: EmailFormatVariant,
  kind: EmailFormatActivationRequirement["kind"],
) {
  return variant.activationRequirements.some(
    (requirement) => requirement.kind === kind,
  );
}

function hasEmailFormatInlineTextContent(
  content: EmailFormatInlineTextContent,
) {
  if (typeof content === "string") {
    return Boolean(content.trim());
  }

  return content.some((part) => {
    if (part.kind === "text") {
      return Boolean(part.text.trim());
    }

    return Boolean(part.label.trim());
  });
}

const emailFormatDefinitionValidationIssues = validateEmailFormatDefinitions(
  emailFormatDefinitionEntries,
);

if (emailFormatDefinitionValidationIssues.length > 0) {
  throw new Error(
    `Invalid email format definitions:\n${emailFormatDefinitionValidationIssues
      .map(
        (issue) =>
          `- ${[issue.definitionSlug, issue.variantSlug]
            .filter(Boolean)
            .join("/")}${issue.definitionSlug ? ": " : ""}${issue.message}`,
      )
      .join("\n")}`,
  );
}

export function listEmailFormatDefinitions() {
  return [...emailFormatDefinitionEntries];
}

export function getEmailFormatDefinition(slug: string) {
  return (
    emailFormatDefinitionEntries.find(
      (definition) => definition.slug === slug,
    ) ?? null
  );
}

export function getDefaultEmailFormatVariant(
  definition: EmailFormatDefinition,
) {
  return definition.variants[0] ?? null;
}

export function getEmailFormatVariant(
  definition: EmailFormatDefinition,
  variantSlug: string,
) {
  return (
    definition.variants.find((variant) => variant.slug === variantSlug) ?? null
  );
}

export function getEmailFormatSpec(
  definitionSlug: string,
  variantSlug: string,
): EmailFormatSpec | null {
  const definition = getEmailFormatDefinition(definitionSlug);

  if (!definition) {
    return null;
  }

  const variant = getEmailFormatVariant(definition, variantSlug);

  if (!variant) {
    return null;
  }

  return {
    definitionSlug: definition.slug,
    variantSlug: variant.slug,
    dataMode: definition.dataMode,
    contentEditPolicy:
      variant.contentEditPolicy ?? definition.contentEditPolicy,
    rulesEditPolicy: variant.rulesEditPolicy ?? definition.rulesEditPolicy,
    initialRecipients: variant.initialRecipients,
    activationRequirements: variant.activationRequirements,
    dataSourceRequirements: variant.dataSourceRequirements,
    initialRules: variant.initialRules ?? [],
    ruleInfoCard: variant.ruleInfoCard ?? definition.ruleInfoCard ?? null,
  };
}
