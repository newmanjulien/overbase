export type EmailFormatActivationMissingRequirement = "recipients" | "rules";

export type EmailFormatActivationRule = {
  text: string;
};

export type EmailFormatActivationReadiness = {
  canActivate: boolean;
  missingRequirements: EmailFormatActivationMissingRequirement[];
  message: string | null;
};

type EmailFormatActivationReadinessInput = {
  recipientCount: number;
  rules: readonly EmailFormatActivationRule[];
};

function hasSavedRule(rules: readonly EmailFormatActivationRule[]) {
  return rules.some((rule) => rule.text.trim().length > 0);
}

export function getEmailFormatActivationReadiness({
  recipientCount,
  rules,
}: EmailFormatActivationReadinessInput): EmailFormatActivationReadiness {
  const missingRequirements: EmailFormatActivationMissingRequirement[] = [];

  if (recipientCount <= 0) {
    missingRequirements.push("recipients");
  }

  if (!hasSavedRule(rules)) {
    missingRequirements.push("rules");
  }

  return {
    canActivate: missingRequirements.length === 0,
    missingRequirements,
    message: getEmailFormatActivationMissingMessage(missingRequirements),
  };
}

export function getEmailFormatActivationMissingMessage(
  missingRequirements: readonly EmailFormatActivationMissingRequirement[],
) {
  const missing = new Set(missingRequirements);

  if (missing.has("recipients") && missing.has("rules")) {
    return "Add at least one recipient and save at least one rule before activating this format";
  }

  if (missing.has("recipients")) {
    return "Add at least one recipient before activating this format";
  }

  if (missing.has("rules")) {
    return "Add and save at least one rule before activating this format";
  }

  return null;
}

export function getEmailFormatActivationMissingMessageFromError(
  error: unknown,
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const activationMessages = [
    getEmailFormatActivationMissingMessage(["recipients", "rules"]),
    getEmailFormatActivationMissingMessage(["recipients"]),
    getEmailFormatActivationMissingMessage(["rules"]),
  ].filter((message): message is string => message !== null);

  return (
    activationMessages.find((message) => errorMessage.includes(message)) ?? null
  );
}
