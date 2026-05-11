import type { SelectableListItem } from '$lib/components/list-page';

export const sampleNotifications: SelectableListItem[] = [
	{
		id: 'trial-balance-changes',
		title: 'Trial balance changes over $10k',
		descriptionLabel: 'Active',
		metaLabel: 'May 8, 2026',
		creator: {
			name: 'Avery Patel',
			avatar: ''
		},
		actionsAriaLabel: 'Notification actions'
	},
	{
		id: 'new-client-engagements',
		title: 'New client engagements awaiting assignment',
		descriptionLabel: 'Active',
		metaLabel: 'May 6, 2026',
		creator: {
			name: 'Morgan Lee',
			avatar: ''
		},
		actionsAriaLabel: 'Notification actions'
	},
	{
		id: 'vendor-risk-updates',
		title: 'Vendor risk updates from partner portal',
		descriptionLabel: 'Paused',
		metaLabel: 'May 1, 2026',
		creator: {
			name: 'Jordan Rivera',
			avatar: ''
		},
		actionsAriaLabel: 'Notification actions'
	},
	{
		id: 'overdue-workpapers',
		title: 'Overdue workpapers by engagement owner',
		descriptionLabel: 'Active',
		metaLabel: 'Apr 28, 2026',
		creator: {
			name: 'Avery Patel',
			avatar: ''
		},
		actionsAriaLabel: 'Notification actions'
	},
	{
		id: 'cash-threshold-alerts',
		title: 'Cash balance threshold alerts',
		descriptionLabel: 'Paused',
		metaLabel: 'Apr 22, 2026',
		creator: {
			name: 'Morgan Lee',
			avatar: ''
		},
		actionsAriaLabel: 'Notification actions'
	}
];
