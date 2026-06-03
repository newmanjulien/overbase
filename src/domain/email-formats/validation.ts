import { isEmailFormatDataSourceRequirementRequiredAt } from "./data-source-requirements";
import type {
  EmailFormatActivationRequirement,
  EmailFormatDefinition,
  EmailFormatInlineTextContent,
  EmailFormatVariant,
} from "./types";

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
