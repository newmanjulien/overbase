export const REASONS_TO_CONNECT_DRAFT_RULES = [
	'Write an email notification that gives a lawyer a specific reason to contact a client or prospect.',
	'Make the monitored client scope, legal/business signal, and outreach context explicit.',
	'Use placeholders for clients, matters, regulations, and dates instead of inventing real facts.',
	'The email should be useful before outreach, not a generic relationship-management reminder.'
];

export const REASONS_TO_CONNECT_REFINEMENT_RULES = [
	'Preserve the Reasons to connect use case: timely legal or business signals that justify outreach.',
	'When the user changes signal scope or client scope, reflect that in body and fireReason.',
	'Do not add legal claims, deadlines, or risks unless the user supplied them.'
];
