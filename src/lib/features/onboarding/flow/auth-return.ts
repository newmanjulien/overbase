const DEFAULT_AUTH_EXIT_HREF = 'https://overbase.app/';
const TRUSTED_MARKETING_ORIGINS = new Set(['https://overbase.app', 'https://www.overbase.app']);
export const AUTH_RETURN_TO_PARAM = 'returnTo';
export const AUTH_ENTRY_RETURN_PARAM = 'fromAuth';
type AuthEntryPathname = '/login' | '/signup';

type ResolveAuthExitHrefOptions = {
	useDefaultWhenMissing?: boolean;
};

function isSafeRelativeReturnHref(value: string) {
	return value.startsWith('/') && !value.startsWith('//');
}

function isAuthEntryPathname(pathname: string) {
	return pathname === '/login' || pathname === '/signup';
}

function isSafeInAppReturnHref(value: string) {
	if (!isSafeRelativeReturnHref(value)) {
		return false;
	}

	try {
		const parsedReturnHref = new URL(value, DEFAULT_AUTH_EXIT_HREF);
		return !isAuthEntryPathname(parsedReturnHref.pathname);
	} catch {
		return false;
	}
}

export function resolveAuthExitHref(
	url: URL,
	{ useDefaultWhenMissing = true }: ResolveAuthExitHrefOptions = {}
) {
	const returnTo = url.searchParams.get(AUTH_RETURN_TO_PARAM)?.trim();

	if (!returnTo) {
		return useDefaultWhenMissing ? DEFAULT_AUTH_EXIT_HREF : undefined;
	}

	if (isSafeInAppReturnHref(returnTo)) {
		return returnTo;
	}

	if (isSafeRelativeReturnHref(returnTo)) {
		return DEFAULT_AUTH_EXIT_HREF;
	}

	try {
		const parsedReturnTo = new URL(returnTo);
		return TRUSTED_MARKETING_ORIGINS.has(parsedReturnTo.origin)
			? parsedReturnTo.href
			: DEFAULT_AUTH_EXIT_HREF;
	} catch {
		return DEFAULT_AUTH_EXIT_HREF;
	}
}

export function deriveAuthExitHrefFromRoute(url: URL) {
	if (isAuthEntryPathname(url.pathname)) {
		return undefined;
	}

	const exitHref = `${url.pathname}${url.search}${url.hash}`;
	return isSafeInAppReturnHref(exitHref) ? exitHref : undefined;
}

export function resolveAuthEntryReturnHref(url: URL) {
	const fromAuth = url.searchParams.get(AUTH_ENTRY_RETURN_PARAM)?.trim();

	if (fromAuth === '/login' || fromAuth === '/signup') {
		return buildAuthEntryHref(fromAuth, resolveAuthExitHref(url));
	}

	return undefined;
}

export function buildAuthEntryHref(
	pathname: AuthEntryPathname,
	exitHref?: string,
	entryReturnHref?: AuthEntryPathname
) {
	const params = new URLSearchParams();

	if (exitHref) {
		params.set(AUTH_RETURN_TO_PARAM, exitHref);
	}

	if (entryReturnHref) {
		params.set(AUTH_ENTRY_RETURN_PARAM, entryReturnHref);
	}

	const query = params.toString();
	return query ? `${pathname}?${query}` : pathname;
}
