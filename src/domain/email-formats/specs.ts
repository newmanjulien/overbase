import { emailFormatDefinitionEntries } from "./definition-entries";
import type { EmailFormatDefinition, EmailFormatSpec } from "./types";
import { validateEmailFormatDefinitions } from "./validation";

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
