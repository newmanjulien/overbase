import { listBuilderHomeApps } from '../../../builder-apps/runtime.server';
import type { BlueprintRecommendationRequest } from './requests';

export type OnboardingBlueprintRecommendation = {
	appSlug: string;
	title: string;
	description: string;
	reason: string;
	artwork: {
		id: string;
		card: {
			tone: 'coral' | 'violet' | 'aqua' | 'zinc';
			iconId: string;
			symbolSize: 'sm' | 'md';
		};
	};
};

const STOP_WORDS = new Set([
	'about',
	'after',
	'again',
	'against',
	'business',
	'company',
	'customer',
	'customers',
	'from',
	'have',
	'into',
	'likely',
	'market',
	'over',
	'partner',
	'partners',
	'that',
	'their',
	'these',
	'this',
	'through',
	'with',
	'would'
]);

function tokenize(text: string) {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, ' ')
		.split(/\s+/)
		.map((token) => token.trim())
		.filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function scoreApp(appText: string, inputTokens: string[]) {
	const appTokens = new Set(tokenize(appText));

	return inputTokens.reduce((score, token) => score + (appTokens.has(token) ? 1 : 0), 0);
}

function buildReason(title: string, score: number) {
	if (score > 0) {
		return `${title} matches the business context and go-to-market signals you described.`;
	}

	return `${title} is a strong available blueprint to start from and customize.`;
}

export async function recommendBlueprints(input: BlueprintRecommendationRequest) {
	const builderHome = await listBuilderHomeApps();
	const inputTokens = tokenize(`${input.businessDescription} ${input.goToMarketDescription}`);
	const rankedApps = builderHome.apps
		.map((app) => {
			const appText = [
				app.title,
				app.description,
				...app.details.paragraphs,
				...app.categoryIds
			].join(' ');

			return {
				app,
				score: scoreApp(appText, inputTokens)
			};
		})
		.sort((left, right) => right.score - left.score || left.app.sortOrder - right.app.sortOrder)
		.slice(0, 3);

	return rankedApps.map(({ app, score }): OnboardingBlueprintRecommendation => {
		return {
			appSlug: app.slug,
			title: app.title,
			description: app.description,
			reason: buildReason(app.title, score),
			artwork: {
				id: app.artwork.id,
				card: { ...app.artwork.card }
			}
		};
	});
}
