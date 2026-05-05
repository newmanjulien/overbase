export const CUSTOM_EMAIL_BUILDER_CARD_ID = 'custom-notification';

export const EMAIL_DRAFT_STATUSES = ['collecting', 'drafting', 'ready'] as const;
export const EMAIL_BLOCK_TYPES = ['header', 'summary', 'details', 'table', 'cta', 'footer'] as const;

export const EMAIL_DRAFT_LIMITS = {
	title: 90,
	subject: 120,
	previewText: 180,
	blockText: 700,
	label: 80,
	blocks: 8,
	detailItems: 8,
	tableColumns: 5,
	tableRows: 6,
	color: 24
} as const;

export type EmailDraftStatus = (typeof EMAIL_DRAFT_STATUSES)[number];

export type EmailTheme = {
	accentColor: string;
	backgroundColor: string;
	surfaceColor: string;
	textColor: string;
};

export type EmailHeaderBlock = {
	id: string;
	type: 'header';
	eyebrow: string;
	title: string;
	body: string;
};

export type EmailSummaryBlock = {
	id: string;
	type: 'summary';
	title: string;
	body: string;
};

export type EmailDetailsBlock = {
	id: string;
	type: 'details';
	title: string;
	items: Array<{
		label: string;
		value: string;
	}>;
};

export type EmailTableBlock = {
	id: string;
	type: 'table';
	title: string;
	columns: string[];
	rows: string[][];
};

export type EmailCtaBlock = {
	id: string;
	type: 'cta';
	label: string;
	description: string;
	buttonLabel: string;
};

export type EmailFooterBlock = {
	id: string;
	type: 'footer';
	body: string;
};

export type EmailBlock =
	| EmailHeaderBlock
	| EmailSummaryBlock
	| EmailDetailsBlock
	| EmailTableBlock
	| EmailCtaBlock
	| EmailFooterBlock;

export type EmailDraft = {
	title: string;
	subject: string;
	previewText: string;
	theme: EmailTheme;
	blocks: EmailBlock[];
};

export type EmailDraftPatchOperation =
	| {
			type: 'setTitle';
			title: string;
	  }
	| {
			type: 'setSubject';
			subject: string;
	  }
	| {
			type: 'setPreviewText';
			previewText: string;
	  }
	| {
			type: 'setTheme';
			theme: EmailTheme;
	  }
	| {
			type: 'upsertBlock';
			block: EmailBlock;
	  }
	| {
			type: 'removeBlock';
			blockId: string;
	  };

export type EmailDraftPatch = {
	operations: EmailDraftPatchOperation[];
};

export type BuilderTurnResult = {
	assistantMessage: string;
	nextQuestion: string | null;
	status: EmailDraftStatus;
	baseArtifactVersion: number;
	patch: EmailDraftPatch;
};

export function createDefaultEmailDraft(): EmailDraft {
	return {
		title: 'Custom notification',
		subject: '',
		previewText: '',
		theme: {
			accentColor: '#18181b',
			backgroundColor: '#f4f4f5',
			surfaceColor: '#ffffff',
			textColor: '#18181b'
		},
		blocks: [
			{
				id: 'header',
				type: 'header',
				eyebrow: 'Overbase notification',
				title: 'New notification',
				body: 'The email preview will take shape as the builder learns what this notification should include.'
			}
		]
	};
}

const emailThemeJsonSchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		accentColor: { type: 'string' },
		backgroundColor: { type: 'string' },
		surfaceColor: { type: 'string' },
		textColor: { type: 'string' }
	},
	required: ['accentColor', 'backgroundColor', 'surfaceColor', 'textColor']
} as const;

const emailBlockJsonSchema = {
	anyOf: [
		{
			type: 'object',
			additionalProperties: false,
			properties: {
				id: { type: 'string' },
				type: { type: 'string', enum: ['header'] },
				eyebrow: { type: 'string' },
				title: { type: 'string' },
				body: { type: 'string' }
			},
			required: ['id', 'type', 'eyebrow', 'title', 'body']
		},
		{
			type: 'object',
			additionalProperties: false,
			properties: {
				id: { type: 'string' },
				type: { type: 'string', enum: ['summary'] },
				title: { type: 'string' },
				body: { type: 'string' }
			},
			required: ['id', 'type', 'title', 'body']
		},
		{
			type: 'object',
			additionalProperties: false,
			properties: {
				id: { type: 'string' },
				type: { type: 'string', enum: ['details'] },
				title: { type: 'string' },
				items: {
					type: 'array',
					items: {
						type: 'object',
						additionalProperties: false,
						properties: {
							label: { type: 'string' },
							value: { type: 'string' }
						},
						required: ['label', 'value']
					}
				}
			},
			required: ['id', 'type', 'title', 'items']
		},
		{
			type: 'object',
			additionalProperties: false,
			properties: {
				id: { type: 'string' },
				type: { type: 'string', enum: ['table'] },
				title: { type: 'string' },
				columns: { type: 'array', items: { type: 'string' } },
				rows: {
					type: 'array',
					items: { type: 'array', items: { type: 'string' } }
				}
			},
			required: ['id', 'type', 'title', 'columns', 'rows']
		},
		{
			type: 'object',
			additionalProperties: false,
			properties: {
				id: { type: 'string' },
				type: { type: 'string', enum: ['cta'] },
				label: { type: 'string' },
				description: { type: 'string' },
				buttonLabel: { type: 'string' }
			},
			required: ['id', 'type', 'label', 'description', 'buttonLabel']
		},
		{
			type: 'object',
			additionalProperties: false,
			properties: {
				id: { type: 'string' },
				type: { type: 'string', enum: ['footer'] },
				body: { type: 'string' }
			},
			required: ['id', 'type', 'body']
		}
	]
} as const;

export const builderTurnResultJsonSchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		assistantMessage: { type: 'string' },
		nextQuestion: {
			anyOf: [{ type: 'string' }, { type: 'null' }]
		},
		status: {
			type: 'string',
			enum: EMAIL_DRAFT_STATUSES
		},
		baseArtifactVersion: { type: 'number' },
		patch: {
			type: 'object',
			additionalProperties: false,
			properties: {
				operations: {
					type: 'array',
					items: {
						anyOf: [
							{
								type: 'object',
								additionalProperties: false,
								properties: {
									type: { type: 'string', enum: ['setTitle'] },
									title: { type: 'string' }
								},
								required: ['type', 'title']
							},
							{
								type: 'object',
								additionalProperties: false,
								properties: {
									type: { type: 'string', enum: ['setSubject'] },
									subject: { type: 'string' }
								},
								required: ['type', 'subject']
							},
							{
								type: 'object',
								additionalProperties: false,
								properties: {
									type: { type: 'string', enum: ['setPreviewText'] },
									previewText: { type: 'string' }
								},
								required: ['type', 'previewText']
							},
							{
								type: 'object',
								additionalProperties: false,
								properties: {
									type: { type: 'string', enum: ['setTheme'] },
									theme: emailThemeJsonSchema
								},
								required: ['type', 'theme']
							},
							{
								type: 'object',
								additionalProperties: false,
								properties: {
									type: { type: 'string', enum: ['upsertBlock'] },
									block: emailBlockJsonSchema
								},
								required: ['type', 'block']
							},
							{
								type: 'object',
								additionalProperties: false,
								properties: {
									type: { type: 'string', enum: ['removeBlock'] },
									blockId: { type: 'string' }
								},
								required: ['type', 'blockId']
							}
						]
					}
				}
			},
			required: ['operations']
		}
	},
	required: ['assistantMessage', 'nextQuestion', 'status', 'baseArtifactVersion', 'patch']
} as const;
