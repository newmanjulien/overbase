import type { EmailFormatDataSourceRequirement } from "./data-source-requirements";

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

export type EmailFormatDefinitionBase = {
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
