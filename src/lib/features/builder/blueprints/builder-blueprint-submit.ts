import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { BuilderBlueprintRecord } from '$lib/features/builder/data';

export async function submitBuilderBlueprint(blueprint: BuilderBlueprintRecord) {
	await goto(resolve('/builder/[blueprintSlug]', { blueprintSlug: blueprint.id }));
}
