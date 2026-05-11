import { getContext, setContext } from 'svelte';

const ROUTE_TITLE_STATE_KEY = Symbol('route-title-state');

export type RouteTitleState = {
	title: string;
};

export function provideRouteTitleState(routeTitleState: RouteTitleState) {
	return setContext(ROUTE_TITLE_STATE_KEY, routeTitleState);
}

export function useRouteTitleState() {
	const routeTitleState = getContext<RouteTitleState | undefined>(ROUTE_TITLE_STATE_KEY);

	if (!routeTitleState) {
		throw new Error('Route title state was used outside the dashboard shell provider.');
	}

	return routeTitleState;
}
