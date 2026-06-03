export type EmailFormatRule = {
	id: string;
	text: string;
};

export type EmailFormatRuleDataSourceButtonAction = {
	label: string;
	disabled?: boolean;
};

export type { EmailFormatRuleDataSourceAction } from '$shared/email-format-data-source-actions';
