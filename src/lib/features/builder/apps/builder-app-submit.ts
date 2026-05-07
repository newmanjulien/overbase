import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { BuilderAppRecord } from '$lib/features/builder/data';

export async function submitBuilderApp(app: BuilderAppRecord) {
	await goto(resolve('/builder/[appSlug]', { appSlug: app.id }));
}
