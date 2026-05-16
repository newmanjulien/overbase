const DEFAULT_AUTH_RETURN_HREF = 'https://overbase.app/';
const TRUSTED_MARKETING_ORIGINS = new Set(['https://overbase.app', 'https://www.overbase.app']);
type AuthEntryPathname = '/login' | '/signup';

type ResolveAuthEntryReturnHrefOptions = {
	useDefaultWhenMissing?: boolean;
};

function isSafeRelativeReturnHref(value: string) {
	return value.startsWith('/') && !value.startsWith('//');
}

export function resolveAuthEntryReturnHref(
	url: URL,
	{ useDefaultWhenMissing = true }: ResolveAuthEntryReturnHrefOptions = {}
) {
	const returnTo = url.searchParams.get('returnTo')?.trim();

	if (!returnTo) {
		return useDefaultWhenMissing ? DEFAULT_AUTH_RETURN_HREF : undefined;
	}

	if (isSafeRelativeReturnHref(returnTo)) {
		return returnTo;
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

export function buildAuthEntryHref(pathname: AuthEntryPathname, returnHref?: string) {
	if (!returnHref) {
		return pathname;
	}

	return `${pathname}?returnTo=${encodeURIComponent(returnHref)}`;
}
