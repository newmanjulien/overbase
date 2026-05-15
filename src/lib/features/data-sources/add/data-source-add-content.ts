import ArrowsClockwise from 'phosphor-svelte/lib/ArrowsClockwise';
import Database from 'phosphor-svelte/lib/Database';
import PlugsConnected from 'phosphor-svelte/lib/PlugsConnected';
import ShieldCheck from 'phosphor-svelte/lib/ShieldCheck';
import type { Component } from 'svelte';

export type AddDataSourceBenefit = {
	icon: Component;
	title: string;
	description: string;
};

export const addDataSourceBenefits: AddDataSourceBenefit[] = [
	{
		icon: Database,
		title: 'Internal data sources',
		description:
			'Connect the systems your team already uses so Overbase can understand the operational context behind each opportunity.'
	},
	{
		icon: PlugsConnected,
		title: 'Format-ready context',
		description:
			'Make selected data available to opportunity formats, partner workflows and future builders without repeating setup.'
	},
	{
		icon: ShieldCheck,
		title: 'Scoped access',
		description:
			'Choose only the sources and fields Overbase should use. Access rules can be tightened before any source is shared.'
	},
	{
		icon: ArrowsClockwise,
		title: 'Always refreshable',
		description:
			'Keep sources current as your systems change, then reuse the same connection wherever that context is needed.'
	}
];

