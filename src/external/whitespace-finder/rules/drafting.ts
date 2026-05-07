export const WHITESPACE_FINDER_DRAFT_RULES = [
	'Write an email notification that surfaces insurance whitespace before a renewal or material account change.',
	'Make the timing window, gap logic, and account exclusions explicit.',
	'Use placeholders for account, policy, renewal, and premium data instead of inventing real values.',
	'The email should help the recipient decide which additional policies or coverage areas to review.'
];

export const WHITESPACE_FINDER_REFINEMENT_RULES = [
	'Preserve the Whitespace finder use case: renewal-aware coverage or product gap detection.',
	'When the user changes timing, gap logic, or exclusions, reflect that in body and fireReason.',
	'Answer simple questions in chat text without changing the draft.'
];
