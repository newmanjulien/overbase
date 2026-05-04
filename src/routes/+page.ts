import { redirect } from '@sveltejs/kit';
import { DEFAULT_ROUTE_HREF } from '$lib/app/app-routes';

export function load() {
	throw redirect(307, DEFAULT_ROUTE_HREF);
}
