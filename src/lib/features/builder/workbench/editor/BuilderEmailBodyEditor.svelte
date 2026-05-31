<script lang="ts">
	import {
		builderParagraph,
		createBuilderId,
		type BuilderBodyBlock,
		type BuilderInlineNode,
		type BuilderVariableDefinition
	} from '$lib/features/builder/domain';
	import {
		getDocumentRangeFromPoint,
		normalizeDropRange,
		type BuilderInlineSurfaceOptions
	} from '../inline/builder-inline-surface';
	import {
		BuilderInlineController,
		type BuilderInlineVariableIdentity,
		type BuilderVariableDropTarget as BuilderInlineVariableDropTarget
	} from '../inline/builder-inline-controller.svelte';
	import type { BuilderVariableInsertionRequest } from '../state/builder-workbench-state.svelte';
	import type { BuilderVariableDragCoordinator } from '../variables/builder-variable-drag-coordinator.svelte';

	type InlineSurfaceParams = {
		blockId: string;
		nodes: readonly BuilderInlineNode[];
	};

	type InlineVariableContext = {
		blockId: string;
	};

	type SelectedVariable = BuilderInlineVariableIdentity<InlineVariableContext>;

	type Props = {
		body: readonly BuilderBodyBlock[];
		variables: readonly BuilderVariableDefinition[];
		disabled?: boolean;
		dragCoordinator: BuilderVariableDragCoordinator;
		variableInsertionRequest?: BuilderVariableInsertionRequest | null;
		onVariableInsertionRequestHandled?: (requestId: number) => void;
		onBodyChange: (body: BuilderBodyBlock[]) => void;
	};

	const INLINE_SURFACE_OPTIONS = {
		variableDatasetKey: 'builderVariableId',
		joinMode: 'body'
	} satisfies BuilderInlineSurfaceOptions;

	let {
		body,
		variables,
		disabled = false,
		dragCoordinator,
		variableInsertionRequest = null,
		onVariableInsertionRequestHandled,
		onBodyChange
	}: Props = $props();
	let editorRoot = $state<HTMLDivElement | null>(null);

	const emptyParagraphId = createBuilderId('paragraph');
	const displayedBody = $derived(
		body.length > 0 ? body : [builderParagraph(emptyParagraphId, [])]
	);

	const controller = new BuilderInlineController<InlineVariableContext>({
		scope: 'body',
		dragCoordinator: () => dragCoordinator,
		root: () => editorRoot,
		variables: () => variables,
		disabled: () => disabled,
		options: INLINE_SURFACE_OPTIONS,
		contextKey: (context) => context.blockId,
		sameContext: (left, right) => left.blockId === right.blockId,
		contextFromSurface: getInlineContext,
		surfaceForContext: findInlineSurface,
		updateOne: (context, nodes) => updateInlineContent(context.blockId, nodes),
		updateMany: updateInlineContents,
		fallbackInsertionSurface: getLastInlineSurface,
		insertIntoEmptyDocument: insertVariableIntoEmptyBody
	});

	$effect(() => {
		return dragCoordinator.registerRegion({
			id: 'body',
			resolveDrop: (drag, point) => {
				if (drag.type === 'inline' && drag.regionId !== 'body') {
					return null;
				}

				const target = resolveVariableDropTarget(point.x, point.y);

				if (!target) {
					return null;
				}

				if (drag.type === 'palette') {
					return {
						effect: 'copy',
						commit: () => {
							controller.insertVariableAtTarget(target, drag.variableId);
						}
					};
				}

				return {
					effect: 'move',
					commit: () => {
						controller.moveVariableToTarget(drag.item, target);
					}
				};
			}
		});
	});

	$effect(() => {
		const selected = controller.selectedVariable;

		if (!selected) {
			return;
		}

		if (disabled || !bodyContainsSelectedVariable(displayedBody, selected)) {
			controller.clearSelection();
		}
	});

	$effect(() => {
		const request = variableInsertionRequest;

		if (request && controller.handleVariableInsertionRequest(request)) {
			onVariableInsertionRequestHandled?.(request.id);
		}
	});

	function bodyContainsSelectedVariable(
		blocks: readonly BuilderBodyBlock[],
		selected: SelectedVariable
	) {
		return blocks.some(
			(block) =>
				block.id === selected.blockId &&
				block.content[selected.nodeIndex]?.type === 'variable'
		);
	}

	function inlineSurface(element: HTMLElement, params: InlineSurfaceParams) {
		return controller.surfaceAction(element, {
			context: { blockId: params.blockId },
			nodes: params.nodes
		});
	}

	function updateInlineContent(blockId: string, content: BuilderInlineNode[]) {
		let didUpdate = false;
		const nextBody = body.map((block) => {
			if (block.id !== blockId) {
				return block;
			}

			didUpdate = true;

			return {
				...block,
				content
			};
		});

		if (!didUpdate && body.length === 0 && blockId === emptyParagraphId) {
			onBodyChange([builderParagraph(emptyParagraphId, content)]);
			return;
		}

		if (!didUpdate) {
			return;
		}

		onBodyChange(nextBody);
	}

	function updateInlineContents(
		updates: Array<{ blockId: string; content: BuilderInlineNode[] }>
	) {
		const updateByBlockId = new Map(updates.map((update) => [update.blockId, update]));

		onBodyChange(
			body.map((block) => {
				const update = updateByBlockId.get(block.id);

				return update
					? {
							...block,
							content: update.content
						}
					: block;
			})
		);
	}

	function getInlineContext(element: HTMLElement) {
		const blockId = element.dataset.builderInlineSurfaceKey;

		if (!blockId) {
			return null;
		}

		return { blockId };
	}

	function getInlineSurfaces() {
		return Array.from(
			editorRoot?.querySelectorAll<HTMLElement>('[data-builder-inline-surface-key]') ?? []
		);
	}

	function findInlineSurface(identity: InlineVariableContext) {
		return (
			getInlineSurfaces().find((surface) => {
				const context = getInlineContext(surface);

				return context?.blockId === identity.blockId;
			}) ?? null
		);
	}

	function closestInlineSurface(node: Node | null) {
		const element = node instanceof Element ? node : node?.parentElement;
		const inline = element?.closest('[data-builder-inline-surface-key]');

		return inline instanceof HTMLElement && editorRoot?.contains(inline) ? inline : null;
	}

	function getInlineSurfaceUnderPointer(clientX: number, clientY: number) {
		return closestInlineSurface(
			editorRoot?.ownerDocument.elementFromPoint(clientX, clientY) ?? null
		);
	}

	function getNearestInlineSurface(clientX: number, clientY: number) {
		const surfaces = getInlineSurfaces();

		if (surfaces.length === 0) {
			return null;
		}

		return surfaces.reduce((nearest, surface) => {
			const rect = surface.getBoundingClientRect();
			const x = Math.max(rect.left, Math.min(clientX, rect.right));
			const y = Math.max(rect.top, Math.min(clientY, rect.bottom));
			const distance = Math.hypot(clientX - x, clientY - y);

			return distance < nearest.distance ? { surface, distance } : nearest;
		}, { surface: surfaces[0], distance: Number.POSITIVE_INFINITY }).surface;
	}

	function getLastInlineSurface() {
		const surfaces = getInlineSurfaces();

		return surfaces.at(-1) ?? null;
	}

	function resolveVariableDropTarget(
		clientX: number,
		clientY: number
	): BuilderInlineVariableDropTarget | null {
		if (disabled || !isPointInsideRoot(clientX, clientY)) {
			return null;
		}

		const pointerSurface = getInlineSurfaceUnderPointer(clientX, clientY);
		const pointRange = getDocumentRangeFromPoint(editorRoot?.ownerDocument, clientX, clientY);
		const rangeSurface = pointRange ? closestInlineSurface(pointRange.commonAncestorContainer) : null;
		const targetSurface =
			pointerSurface ?? rangeSurface ?? getNearestInlineSurface(clientX, clientY);

		if (!targetSurface) {
			return null;
		}

		return {
			surface: targetSurface,
			range:
				rangeSurface === targetSurface
					? normalizeDropRange(targetSurface, pointRange, clientX, INLINE_SURFACE_OPTIONS)
					: null
		};
	}

	function insertVariableIntoEmptyBody(variableId: string) {
		onBodyChange([
			builderParagraph(createBuilderId('paragraph'), [
				{
					type: 'variable',
					variableId
				}
			])
		]);
	}

	function isPointInsideRoot(clientX: number, clientY: number) {
		const rect = editorRoot?.getBoundingClientRect();

		return Boolean(
			rect &&
				clientX >= rect.left &&
				clientX <= rect.right &&
				clientY >= rect.top &&
				clientY <= rect.bottom
		);
	}
</script>

<svelte:document
	onpointerdown={controller.handleDocumentPointerDown}
	onselectionchange={controller.handleDocumentSelectionChange}
/>
<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') {
			controller.handleEscape();
		}
	}}
/>

<div
	bind:this={editorRoot}
	class="builder-email-body-editor"
	role="group"
	aria-label="Email body"
>
	{#each displayedBody as block (block.id)}
		<p class="builder-body-paragraph">
			<span
				use:inlineSurface={{ blockId: block.id, nodes: block.content }}
				class="builder-inline-surface"
				contenteditable={!disabled}
				role="textbox"
				tabindex={disabled ? -1 : 0}
				aria-label="Email paragraph"
				oninput={controller.handleInput}
				onpaste={controller.handlePaste}
			></span>
		</p>
	{/each}

</div>

<style>
	.builder-email-body-editor {
		position: relative;
		min-height: calc(1.72em * 4);
		border: 0;
		outline: none;
		color: rgb(28 25 23);
		font-size: 0.79rem;
		line-height: 1.9;
		white-space: pre-wrap;
	}

	.builder-body-paragraph {
		margin: 0 0 0.875rem;
		white-space: pre-wrap;
	}

	.builder-body-paragraph:last-child {
		margin-bottom: 0;
	}

	.builder-inline-surface {
		display: inline;
		min-width: 1ch;
		outline: none;
		white-space: pre-wrap;
	}

	.builder-inline-surface[contenteditable='false'] {
		cursor: default;
		opacity: 0.6;
	}

	.builder-email-body-editor :global(.builder-variable-pill) {
		user-select: none;
		gap: 0.25rem;
		transition:
			background-color 150ms ease,
			border-color 150ms ease;
		vertical-align: baseline;
	}

	.builder-inline-surface:not([contenteditable='false']) :global(.builder-variable-pill) {
		cursor: grab;
	}

	.builder-inline-surface:not([contenteditable='false']) :global(.builder-variable-pill:hover) {
		background: rgb(209 250 229 / 0.8);
	}

	.builder-inline-surface:not([contenteditable='false']) :global(.builder-variable-pill:active) {
		cursor: grabbing;
	}

	.builder-email-body-editor :global(.builder-variable-pill--selected) {
		border-color: transparent;
		background: rgb(209 250 229);
	}

	.builder-email-body-editor :global(.builder-variable-pill__label) {
		line-height: 1;
	}

	.builder-email-body-editor :global(.builder-variable-pill__remove) {
		display: inline-flex;
		width: 0.68rem;
		height: 0.68rem;
		align-items: center;
		justify-content: center;
		border: 0;
		border-radius: 999px;
		background: transparent;
		color: rgb(4 120 87);
		font: inherit;
		font-size: 0.68rem;
		font-weight: 600;
		line-height: 1;
		padding: 0;
		cursor: pointer;
	}

	.builder-email-body-editor :global(.builder-variable-pill__remove:hover) {
		background: rgb(209 250 229 / 0.75);
	}

	.builder-inline-surface:focus :global(.builder-variable-pill) {
		border-color: transparent;
	}

</style>
