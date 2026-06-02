export type EmailFormatRule = {
	id: string;
	text: string;
};

export type EmailFormatRuleDataSourceAction = {
	label: string;
	disabled?: boolean;
};

export type { EmailFormatRuleDataSourceControl } from '$shared/email-format-definitions';
