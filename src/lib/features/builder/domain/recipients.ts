export function formatBuilderRecipients(recipients: readonly string[]) {
	return recipients.join('; ');
}

export function parseBuilderRecipients(value: string) {
	return value
		.split(/[;,\n]/)
		.map((recipient) => recipient.trim())
		.filter(Boolean);
}
