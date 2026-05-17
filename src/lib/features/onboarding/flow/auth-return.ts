const DEFAULT_AUTH_RETURN_HREF = 'https://overbase.app/';
const TRUSTED_MARKETING_ORIGINS = new Set(['https://overbase.app', 'https://www.overbase.app']);
export const AUTH_RETURN_TO_PARAM = 'returnTo';
type AuthEntryPathname = '/login' | '/signup';

type ResolveAuthReturnButtonHrefOptions = {
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
		const parsedReturnHref = new URL(value, DEFAULT_AUTH_RETURN_HREF);
		return !isAuthEntryPathname(parsedReturnHref.pathname);
	} catch {
		return false;
	}
}

export function resolveAuthReturnButtonHref(
	url: URL,
	{ useDefaultWhenMissing = true }: ResolveAuthReturnButtonHrefOptions = {}
) {
	const returnTo = url.searchParams.get(AUTH_RETURN_TO_PARAM)?.trim();

	if (!returnTo) {
		return useDefaultWhenMissing ? DEFAULT_AUTH_RETURN_HREF : undefined;
	}

	if (isSafeInAppReturnHref(returnTo)) {
		return returnTo;
	}

	if (isSafeRelativeReturnHref(returnTo)) {
		return DEFAULT_AUTH_RETURN_HREF;
	}

	try {
		const parsedReturnTo = new URL(returnTo);
		return TRUSTED_MARKETING_ORIGINS.has(parsedReturnTo.origin)
			? parsedReturnTo.href
			: DEFAULT_AUTH_RETURN_HREF;
	} catch {
		return DEFAULT_AUTH_RETURN_HREF;
	}
}

export function deriveAuthReturnButtonHrefFromRoute(url: URL) {
	if (isAuthEntryPathname(url.pathname)) {
		return undefined;
	}

	const returnButtonHref = `${url.pathname}${url.search}${url.hash}`;
	return isSafeInAppReturnHref(returnButtonHref) ? returnButtonHref : undefined;
}

export function buildAuthEntryHref(pathname: AuthEntryPathname, returnButtonHref?: string) {
	if (!returnButtonHref) {
		return pathname;
	}

	return `${pathname}?${AUTH_RETURN_TO_PARAM}=${encodeURIComponent(returnButtonHref)}`;
}
