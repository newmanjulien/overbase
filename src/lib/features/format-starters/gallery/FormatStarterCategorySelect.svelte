<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { api } from '$convex/_generated/api';
	import { createFormatsGalleryHref, type CreateFormatsGalleryHref } from '$lib/app/app-links';
	import { useCurrentWorkspaceContext } from '$lib/app/current-workspace.svelte';
	import { HeaderSelectMenu } from '$lib/ui';
	import { useConvexClient } from 'convex-svelte';
	import {
		CREATE_FORMAT_GALLERY_CATEGORIES,
		createFormatGalleryCategoryHref,
		getCreateFormatGalleryCategoryFromSearchParams,
		type CreateFormatGalleryCategoryId
	} from './create-format-gallery-categories';

	const client = useConvexClient();
	const currentWorkspace = useCurrentWorkspaceContext();
	const selectedCategory = $derived(
		getCreateFormatGalleryCategoryFromSearchParams(
			page.url.searchParams,
			currentWorkspace.user.lastCreateFormatGalleryCategoryId
		)
	);

	function setSelectedCategory(categoryId: CreateFormatGalleryCategoryId) {
		const category = CREATE_FORMAT_GALLERY_CATEGORIES.find((option) => option.id === categoryId);

		if (!category) {
			return;
		}

		const href = createFormatGalleryCategoryHref(category);

		if (category.id === selectedCategory.id) {
			return;
		}

		void selectCategory(category.id, href);
	}

	async function selectCategory(
		categoryId: CreateFormatGalleryCategoryId,
		href: CreateFormatsGalleryHref
	) {
		let navigationHref = href;

		try {
			await client.mutation(api.settings.updateCreateFormatGalleryCategoryPreference, {
				categoryId
			});
		} catch {
			if (categoryId === 'public-data') {
				navigationHref = createFormatsGalleryHref({ mode: 'public-data' });
			}
		}

		await goto(resolve(navigationHref), {
			keepFocus: true,
			noScroll: true
		});
	}
</script>

<HeaderSelectMenu
	id="format-category"
	ariaLabel="Select format category"
	selectedId={selectedCategory.id}
	options={CREATE_FORMAT_GALLERY_CATEGORIES}
	onSelect={setSelectedCategory}
	width="md"
/>
