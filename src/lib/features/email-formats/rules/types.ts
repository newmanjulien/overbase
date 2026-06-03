export type EmailFormatRule = {
	id: string;
	text: string;
};

export type EmailFormatRuleDataSourceButtonAction = {
	label: string;
	disabled?: boolean;
};

export type { EmailFormatRuleDataSourceAction } from '$domain/email-formats/data-source-actions';
