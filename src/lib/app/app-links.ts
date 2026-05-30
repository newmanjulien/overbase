import { resolve } from '$app/paths';

export type StaticAppLink = {
	pathname: `/${string}`;
	routeId: `/(app)${string}`;
};

export type AuthEntryLink = {
	pathname: '/login' | '/join';
	routeId: `/(auth)${string}`;
};

export type DynamicAppLink<Pathname extends `/${string}`, RouteId extends `/(app)${string}`> = {
	pathname: Pathname;
	routeId: RouteId;
	href: AppHref;
};

export const APP_LINKS = {
	builders: {
		pathname: '/builders',
		routeId: '/(app)/(desktop-only)/builders'
	},
	blueprints: {
		pathname: '/blueprints',
		routeId: '/(app)/(desktop-only)/blueprints'
	},
	emailFormats: {
		pathname: '/email-formats',
		routeId: '/(app)/email-formats'
	},
	dataSources: {
		pathname: '/data-sources',
		routeId: '/(app)/data-sources'
	},
	externalData: {
		pathname: '/external-data',
		routeId: '/(app)/external-data'
	},
	team: {
		pathname: '/team',
		routeId: '/(app)/team'
	},
	teamEmailFormats: {
		pathname: '/team-email-formats',
		routeId: '/(app)/team-email-formats'
	},
	invitePartners: {
		pathname: '/invite-partners',
		routeId: '/(app)/invite-partners'
	},
	managePartners: {
		pathname: '/manage-partners',
		routeId: '/(app)/manage-partners'
	},
	dataAccess: {
		pathname: '/data-access',
		routeId: '/(app)/data-access'
	},
	settings: {
		pathname: '/settings',
		routeId: '/(app)/settings'
	}
} as const satisfies Record<string, StaticAppLink>;

export const AUTH_LINKS = {
	login: {
		pathname: '/login',
		routeId: '/(auth)/login'
	},
	join: {
		pathname: '/join',
		routeId: '/(auth)/join'
	}
} as const satisfies Record<string, AuthEntryLink>;

export const APP_DYNAMIC_ROUTE_IDS = {
	builder: '/(app)/(desktop-only)/builders/[appSlug]',
	blueprint: '/(app)/(desktop-only)/blueprints/[blueprintSlug]',
	emailFormat: '/(app)/email-formats/[emailFormatId]'
} as const;

export const DEFAULT_APP_LINK = APP_LINKS.builders;

export type AppLinkKey = keyof typeof APP_LINKS;
export type AuthLinkKey = keyof typeof AUTH_LINKS;
export type StaticAppPathname = (typeof APP_LINKS)[AppLinkKey]['pathname'];
export type AuthEntryPathname = (typeof AUTH_LINKS)[AuthLinkKey]['pathname'];
export type BuilderPathname = `/builders/${string}`;
export type FreshBuilderHref = `${BuilderPathname}?fresh=1`;
export type BlueprintPathname = `/blueprints/${string}`;
export type EmailFormatPathname = `/email-formats/${string}`;
export type AppPathname =
	| StaticAppPathname
	| BuilderPathname
	| BlueprintPathname
	| EmailFormatPathname;
export type AppHref = AppPathname | FreshBuilderHref;
export type AuthEntryHref = AuthEntryPathname | `${AuthEntryPathname}?${string}`;
export type BuilderViewportFallbackPathname =
	| typeof APP_LINKS.emailFormats.pathname
	| typeof APP_LINKS.blueprints.pathname
	| typeof APP_LINKS.builders.pathname;

const STATIC_APP_PATHNAMES = new Set<string>(
	Object.values(APP_LINKS).map((link) => link.pathname)
);
const resolveHref = resolve as (href: string) => string;

function encodePathSegment(value: string) {
	return encodeURIComponent(value);
}

export function builderPathname(appSlug: string): BuilderPathname {
	return `/builders/${encodePathSegment(appSlug)}`;
}

export function builderLink(appSlug: string): DynamicAppLink<BuilderPathname, typeof APP_DYNAMIC_ROUTE_IDS.builder> {
	return {
		pathname: builderPathname(appSlug),
		routeId: APP_DYNAMIC_ROUTE_IDS.builder,
		href: resolve(APP_DYNAMIC_ROUTE_IDS.builder, { appSlug }) as BuilderPathname
	};
}

export function freshBuilderLink(appSlug: string) {
	const link = builderLink(appSlug);

	return {
		pathname: link.pathname,
		routeId: link.routeId,
		search: '?fresh=1' as const,
		href: `${link.href}?fresh=1` as FreshBuilderHref
	};
}

export function freshBuilderHref(appSlug: string): FreshBuilderHref {
	return freshBuilderLink(appSlug).href;
}

export function blueprintPathname(blueprintSlug: string): BlueprintPathname {
	return `/blueprints/${encodePathSegment(blueprintSlug)}`;
}

export function blueprintLink(
	blueprintSlug: string
): DynamicAppLink<BlueprintPathname, typeof APP_DYNAMIC_ROUTE_IDS.blueprint> {
	return {
		pathname: blueprintPathname(blueprintSlug),
		routeId: APP_DYNAMIC_ROUTE_IDS.blueprint,
		href: resolve(APP_DYNAMIC_ROUTE_IDS.blueprint, { blueprintSlug }) as BlueprintPathname
	};
}

export function emailFormatPathname(emailFormatId: string): EmailFormatPathname {
	return `/email-formats/${encodePathSegment(emailFormatId)}`;
}

export function emailFormatLink(emailFormatId: string): DynamicAppLink<EmailFormatPathname, typeof APP_DYNAMIC_ROUTE_IDS.emailFormat> {
	return {
		pathname: emailFormatPathname(emailFormatId),
		routeId: APP_DYNAMIC_ROUTE_IDS.emailFormat,
		href: resolve(APP_DYNAMIC_ROUTE_IDS.emailFormat, { emailFormatId }) as EmailFormatPathname
	};
}

export function isCanonicalAppPathname(pathname: string): pathname is AppPathname {
	return (
		STATIC_APP_PATHNAMES.has(pathname) ||
		/^\/builders\/[^/?#]+$/.test(pathname) ||
		/^\/blueprints\/[^/?#]+$/.test(pathname) ||
		/^\/email-formats\/[^/?#]+$/.test(pathname)
	);
}

export function isCanonicalAppHref(value: string): value is AppHref {
	try {
		const parsedHref = new URL(value, 'https://overbase.local');

		return (
			isCanonicalAppPathname(parsedHref.pathname) &&
			parsedHref.hash === '' &&
			(parsedHref.search === '' ||
				(parsedHref.pathname.startsWith(`${APP_LINKS.builders.pathname}/`) &&
					parsedHref.search === '?fresh=1'))
		);
	} catch {
		return false;
	}
}

export function isAuthEntryHref(value: string): value is AuthEntryHref {
	try {
		const parsedHref = new URL(value, 'https://overbase.local');

		return (
			parsedHref.hash === '' &&
			(parsedHref.pathname === AUTH_LINKS.login.pathname ||
				parsedHref.pathname === AUTH_LINKS.join.pathname)
		);
	} catch {
		return false;
	}
}

export function resolveAppHref(href: AppHref) {
	return resolveHref(href);
}

export function resolveAuthHref(href: AuthEntryHref) {
	return resolveHref(href);
}
