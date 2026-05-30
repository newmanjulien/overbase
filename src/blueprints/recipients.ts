export function formatBlueprintRecipients(recipients: readonly string[]) {
	return recipients.join('; ');
}

export function parseBlueprintRecipients(value: string) {
	return value
		.split(/[;,\n]/)
		.map((recipient) => recipient.trim())
		.filter(Boolean);
}
