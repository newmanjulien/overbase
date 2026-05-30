<script lang="ts">
	import { onMount } from 'svelte';
	import {
		blueprintParagraph,
		createBlueprintId,
		formatBlueprintVariableLabel,
		type BlueprintBodyBlock,
		type BlueprintInlineNode,
		type BlueprintVariableDefinition
	} from '../../../../blueprints/model';
	import {
		createBlueprintVariableDragImage,
		decodeBlueprintVariableDragPayload as decodePaletteVariableDragPayload,
		BLUEPRINT_VARIABLE_DRAG_MIME
	} from './blueprint-variable-drag';
	import {
		areInlineNodesEqual,
		createVariablePill as createBlueprintInlineVariablePill,
		focusEnd as focusInlineEnd,
		insertPlainText,
		normalizeDropRange,
		renderSurface,
		renderVariablePillContents,
		serializeSurface,
		type BlueprintInlineSurfaceOptions
	} from './blueprint-inline-surface';
	import {
		createBlueprintInlineVariableDragMime,
		dataTransferHasType,
		decodeBlueprintInlineVariableDragPayload,
		deleteVariableFromSurface,
		encodeBlueprintInlineVariableDragPayload,
		insertVariableInSurface,
		isSameVariableIdentity,
		moveVariableBetweenSurfaces,
		type BlueprintActiveVariableDrag,
		type BlueprintInlineVariableDragPayload,
		type BlueprintInlineVariableIdentity,
		type BlueprintVariableDropTarget as VariableDropTarget
	} from './blueprint-inline-variable-editor';

	type InlineSurfaceParams = {
		blockId: string;
		itemId: string | null;
		nodes: readonly BlueprintInlineNode[];
	};

	type DropCaretRect = {
		left: number;
		top: number;
		height: number;
	};

	type DropPreview = {
		surface: HTMLElement;
		range: Range | null;
		rect: DropCaretRect;
	};

	type InlineVariableContext = {
		blockId: string;
		itemId: string | null;
	};

	type SelectedVariable = BlueprintInlineVariableIdentity<InlineVariableContext>;
	type VariableDragPayload = BlueprintInlineVariableDragPayload<InlineVariableContext>;
	type ActiveVariableDrag = BlueprintActiveVariableDrag<InlineVariableContext>;

	type Props = {
		body: readonly BlueprintBodyBlock[];
		variables: readonly BlueprintVariableDefinition[];
		disabled?: boolean;
		onBodyChange: (body: BlueprintBodyBlock[]) => void;
	};

	const BLUEPRINT_BODY_VARIABLE_DRAG_MIME = createBlueprintInlineVariableDragMime('body');
	const INLINE_SURFACE_OPTIONS = {
		variableDatasetKey: 'blueprintVariableId',
		joinMode: 'body'
	} satisfies BlueprintInlineSurfaceOptions;

	let { body, variables, disabled = false, onBodyChange }: Props = $props();
	let editorRoot = $state<HTMLDivElement | null>(null);
	let dropPreview = $state<DropPreview | null>(null);
	let selectedVariable = $state<SelectedVariable | null>(null);
	let activeVariableDrag: ActiveVariableDrag | null = null;

	const emptyParagraphId = createBlueprintId('paragraph');
	const displayedBody = $derived(
		body.length > 0 ? body : [blueprintParagraph(emptyParagraphId, [])]
	);

	onMount(() => {
		const clearPreview = () => {
			clearDropPreview();
			clearSelectedVariable();
		};

		window.addEventListener('dragend', clearPreview);

		return () => {
			window.removeEventListener('dragend', clearPreview);
		};
	});

	$effect(() => {
		const selected = selectedVariable;

		if (!selected) {
			return;
		}

		if (disabled || !bodyContainsSelectedVariable(displayedBody, selected)) {
			clearSelectedVariable();
		}
	});

	function inlineKey(blockId: string, itemId: string | null) {
		return itemId ? `${blockId}:${itemId}` : blockId;
	}

	function normalizeItemId(itemId: string | null | undefined) {
		return itemId ?? null;
	}

	function normalizeVariableIdentity(identity: SelectedVariable): SelectedVariable {
		return {
			blockId: identity.blockId,
			itemId: normalizeItemId(identity.itemId),
			nodeIndex: identity.nodeIndex
		};
	}

	function isSameSelectedVariable(
		left: SelectedVariable | null,
		right: SelectedVariable
	) {
		return isSameVariableIdentity(left, normalizeVariableIdentity(right), ['blockId', 'itemId']);
	}

	function bodyContainsSelectedVariable(
		blocks: readonly BlueprintBodyBlock[],
		selected: SelectedVariable
	) {
		for (const block of blocks) {
			if (block.id !== selected.blockId) {
				continue;
			}

			if (block.type === 'paragraph') {
				return selected.itemId === null && block.content[selected.nodeIndex]?.type === 'variable';
			}

			const item = block.items.find((entry) => entry.id === selected.itemId);

			return item?.content[selected.nodeIndex]?.type === 'variable';
		}

		return false;
	}

	function decodeVariableDragPayload(value: string): VariableDragPayload | null {
		return decodeBlueprintInlineVariableDragPayload<InlineVariableContext>(value, (payload) => {
			const itemId = payload.itemId ?? null;

			if (
				typeof payload.blockId !== 'string' ||
				(itemId !== null && typeof itemId !== 'string')
			) {
				return null;
			}

			return {
				blockId: payload.blockId,
				itemId
			};
		});
	}

	function startVariableDrag(
		event: DragEvent,
		fieldId: string,
		source: Omit<VariableDragPayload, 'fieldId'>,
		sourcePill: HTMLElement
	) {
		const sourceSurface = closestInlineSurface(sourcePill);

		if (!event.dataTransfer || !sourceSurface || disabled) {
			return;
		}

		const label = formatBlueprintVariableLabel(variables, fieldId);
		const payload: VariableDragPayload = { fieldId, ...source };
		const dragImage = createBlueprintVariableDragImage(label);

		clearSelectedVariable({ rerender: false });
		sourcePill.classList.remove('blueprint-variable-pill--selected');
		renderVariablePillContents(sourcePill, label, false, () =>
			deleteSelectedVariable(source)
		);

		activeVariableDrag = {
			...payload,
			sourcePill,
			sourceSurface
		};

		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData(
			BLUEPRINT_BODY_VARIABLE_DRAG_MIME,
			encodeBlueprintInlineVariableDragPayload(payload)
		);
		event.dataTransfer.setData('text/plain', label);
		event.dataTransfer.setDragImage(
			dragImage,
			dragImage.offsetWidth / 2,
			dragImage.offsetHeight / 2
		);

		requestAnimationFrame(() => {
			dragImage.remove();
		});
	}

	function createVariablePill(fieldId: string, source: Omit<VariableDragPayload, 'fieldId'>) {
		return createBlueprintInlineVariablePill({
			fieldId,
			label: formatBlueprintVariableLabel(variables, fieldId),
			source,
			selected: !disabled && isSameSelectedVariable(selectedVariable, source),
			disabled,
			variableDatasetKey: INLINE_SURFACE_OPTIONS.variableDatasetKey,
			onSelect: selectVariable,
			onRemove: deleteSelectedVariable,
			onDragStart: startVariableDrag,
			onDragEnd: () => {
				activeVariableDrag = null;
				clearDropPreview();
				clearSelectedVariable();
			}
		});
	}

	function renderInlineNodes(element: HTMLElement, nodes: readonly BlueprintInlineNode[]) {
		const context = getInlineContext(element);

		renderSurface(
			element,
			nodes,
			(nodeIndex) => ({
				blockId: context?.blockId ?? '',
				itemId: context?.itemId ?? null,
				nodeIndex
			}),
			createVariablePill
		);
	}

	function serializeInlineNodes(parent: Node): BlueprintInlineNode[] {
		return serializeSurface(parent, INLINE_SURFACE_OPTIONS);
	}

	function inlineSurface(element: HTMLElement, params: InlineSurfaceParams) {
		element.dataset.blueprintInlineKey = inlineKey(params.blockId, params.itemId);
		element.dataset.blueprintBlockId = params.blockId;
		element.dataset.blueprintItemId = params.itemId ?? '';
		element.addEventListener('click', handleInlineSurfaceClick);
		renderInlineNodes(element, params.nodes);

		return {
			update(nextParams: InlineSurfaceParams) {
				element.dataset.blueprintInlineKey = inlineKey(nextParams.blockId, nextParams.itemId);
				element.dataset.blueprintBlockId = nextParams.blockId;
				element.dataset.blueprintItemId = nextParams.itemId ?? '';

				const currentNodes = serializeInlineNodes(element);

				if (
					document.activeElement !== element &&
					!areInlineNodesEqual(currentNodes, nextParams.nodes)
				) {
					renderInlineNodes(element, nextParams.nodes);
				}
			},
			destroy() {
				element.removeEventListener('click', handleInlineSurfaceClick);
			}
		};
	}

	function updateInlineContent(blockId: string, itemId: string | null, content: BlueprintInlineNode[]) {
		let didUpdate = false;
		const nextBody = body.map((block) => {
			if (block.id !== blockId) {
				return block;
			}

			didUpdate = true;

			if (block.type === 'paragraph') {
				return {
					...block,
					content
				};
			}

			return {
				...block,
				items: block.items.map((item) =>
					item.id === itemId
						? {
								...item,
								content
							}
						: item
				)
			};
		});

		if (!didUpdate && body.length === 0 && blockId === emptyParagraphId) {
			onBodyChange([blueprintParagraph(emptyParagraphId, content)]);
			return;
		}

		onBodyChange(nextBody);
	}

	function updateInlineContents(
		updates: Array<{ blockId: string; itemId: string | null; content: BlueprintInlineNode[] }>
	) {
		const updateByKey = new Map(updates.map((update) => [inlineKey(update.blockId, update.itemId), update]));

		onBodyChange(
			body.map((block) => {
				if (block.type === 'paragraph') {
					const update = updateByKey.get(inlineKey(block.id, null));

					return update
						? {
								...block,
								content: update.content
							}
						: block;
				}

				return {
					...block,
					items: block.items.map((item) => {
						const update = updateByKey.get(inlineKey(block.id, item.id));

						return update
							? {
									...item,
									content: update.content
								}
							: item;
					})
				};
			})
		);
	}

	function getInlineContext(element: HTMLElement) {
		const blockId = element.dataset.blueprintBlockId;

		if (!blockId) {
			return null;
		}

		const itemId = element.dataset.blueprintItemId || null;

		return { blockId, itemId };
	}

	function findInlineSurface(identity: SelectedVariable) {
		if (!editorRoot) {
			return null;
		}

		const selected = normalizeVariableIdentity(identity);
		const surfaces = Array.from(
			editorRoot.querySelectorAll<HTMLElement>('[data-blueprint-inline-key]')
		);

		return (
			surfaces.find((surface) => {
				const context = getInlineContext(surface);

				return (
					context?.blockId === selected.blockId &&
					normalizeItemId(context.itemId) === selected.itemId
				);
			}) ?? null
		);
	}

	function renderSurfaceFromCurrentContent(surface: HTMLElement) {
		renderInlineNodes(surface, serializeInlineNodes(surface));
	}

	function clearSelectedVariable(options: { rerender?: boolean } = {}) {
		const selected = selectedVariable;

		if (!selected) {
			return;
		}

		const surface = options.rerender === false ? null : findInlineSurface(selected);
		selectedVariable = null;

		if (surface) {
			renderSurfaceFromCurrentContent(surface);
		}
	}

	function selectVariable(source: SelectedVariable) {
		if (disabled) {
			return;
		}

		const nextSelected = normalizeVariableIdentity(source);
		const previousSelected = selectedVariable;

		if (isSameSelectedVariable(previousSelected, nextSelected)) {
			return;
		}

		const previousSurface = previousSelected ? findInlineSurface(previousSelected) : null;
		const nextSurface = findInlineSurface(nextSelected);

		selectedVariable = nextSelected;

		if (previousSurface && previousSurface !== nextSurface) {
			renderSurfaceFromCurrentContent(previousSurface);
		}

		if (nextSurface) {
			renderSurfaceFromCurrentContent(nextSurface);
		}
	}

	function deleteSelectedVariable(source: SelectedVariable) {
		if (disabled || !isSameSelectedVariable(selectedVariable, source)) {
			return;
		}

		const selected = normalizeVariableIdentity(source);
		const surface = findInlineSurface(selected);

		if (!surface) {
			selectedVariable = null;
			return;
		}

		const result = deleteVariableFromSurface(
			surface,
			selected.nodeIndex,
			INLINE_SURFACE_OPTIONS,
			serializeInlineNodes
		);

		if (!result.didDelete) {
			selectedVariable = null;
			renderInlineNodes(surface, result.nodes);
			return;
		}

		selectedVariable = null;
		updateInlineContent(selected.blockId, selected.itemId, result.nodes);
		renderInlineNodes(surface, result.nodes);
	}

	function handleInlineInput(event: Event) {
		const target = event.currentTarget;

		if (!(target instanceof HTMLElement)) {
			return;
		}

		const context = getInlineContext(target);

		if (!context) {
			return;
		}

		updateInlineContent(context.blockId, context.itemId, serializeInlineNodes(target));
	}

	function handleInlineSurfaceClick(event: MouseEvent) {
		const target = event.target;

		if (target instanceof Element && target.closest('[data-blueprint-variable-id]')) {
			return;
		}

		clearSelectedVariable();
	}

	function handleDocumentPointerDown(event: PointerEvent) {
		if (!selectedVariable) {
			return;
		}

		const target = event.target;

		if (target instanceof Element && target.closest('[data-blueprint-variable-id]')) {
			return;
		}

		clearSelectedVariable();
	}

	function handleEditorKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			clearSelectedVariable();
			clearDropPreview();
		}
	}

	function getRangeFromPoint(clientX: number, clientY: number) {
		const doc = editorRoot?.ownerDocument;

		if (!doc) {
			return null;
		}

		const rangeDocument = doc as Document & {
			caretRangeFromPoint?: (x: number, y: number) => Range | null;
		};

		if ('caretPositionFromPoint' in doc) {
			const position = doc.caretPositionFromPoint(clientX, clientY);

			if (!position) {
				return null;
			}

			const range = doc.createRange();
			range.setStart(position.offsetNode, position.offset);
			range.collapse(true);

			return range;
		}

		return rangeDocument.caretRangeFromPoint?.(clientX, clientY) ?? null;
	}

	function closestInlineSurface(node: Node | null) {
		const element = node instanceof Element ? node : node?.parentElement;
		const inline = element?.closest('[data-blueprint-inline-key]');

		return inline instanceof HTMLElement && editorRoot?.contains(inline) ? inline : null;
	}

	function getInlineSurfaceUnderPointer(clientX: number, clientY: number) {
		return closestInlineSurface(editorRoot?.ownerDocument.elementFromPoint(clientX, clientY) ?? null);
	}

	function getNearestInlineSurface(clientX: number, clientY: number) {
		if (!editorRoot) {
			return null;
		}

		const surfaces = Array.from(
			editorRoot.querySelectorAll<HTMLElement>('[data-blueprint-inline-key]')
		);

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

	function getFirstInlineSurface() {
		return editorRoot?.querySelector<HTMLElement>('[data-blueprint-inline-key]') ?? null;
	}

	function resolveVariableDropTarget(clientX: number, clientY: number): VariableDropTarget | null {
		const pointerSurface = getInlineSurfaceUnderPointer(clientX, clientY);
		const pointRange = getRangeFromPoint(clientX, clientY);
		const rangeSurface = pointRange ? closestInlineSurface(pointRange.commonAncestorContainer) : null;
		const targetSurface =
			pointerSurface ??
			rangeSurface ??
			getNearestInlineSurface(clientX, clientY) ??
			getFirstInlineSurface();

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

	function getLineHeight(surface: HTMLElement) {
		const style = getComputedStyle(surface);
		const lineHeight = Number.parseFloat(style.lineHeight);

		if (Number.isFinite(lineHeight)) {
			return lineHeight;
		}

		const fontSize = Number.parseFloat(style.fontSize);

		return Number.isFinite(fontSize) ? fontSize * 1.72 : 20;
	}

	function usableDomRect(rect: DOMRect | undefined) {
		if (!rect || !Number.isFinite(rect.left) || !Number.isFinite(rect.top) || rect.height <= 0) {
			return null;
		}

		return rect;
	}

	function getUsableRangeRect(range: Range | null) {
		if (!range) {
			return null;
		}

		for (const rect of range.getClientRects()) {
			const usableRect = usableDomRect(rect);

			if (usableRect) {
				return usableRect;
			}
		}

		return usableDomRect(range.getBoundingClientRect());
	}

	function getNodeEdgeRect(node: Node | undefined, edge: 'start' | 'end') {
		if (!node) {
			return null;
		}

		if (node instanceof HTMLElement) {
			const rect = usableDomRect(node.getBoundingClientRect());

			if (!rect) {
				return null;
			}

			return {
				left: edge === 'start' ? rect.left : rect.right,
				top: rect.top,
				height: rect.height
			};
		}

		if (node.nodeType !== Node.TEXT_NODE || !node.textContent) {
			return null;
		}

		const range = node.ownerDocument?.createRange();

		if (!range) {
			return null;
		}

		range.selectNodeContents(node);

		const rects = Array.from(range.getClientRects()).filter((rect) => usableDomRect(rect));
		const rect = edge === 'start' ? rects.at(0) : rects.at(-1);

		range.detach();

		if (!rect) {
			return null;
		}

		return {
			left: edge === 'start' ? rect.left : rect.right,
			top: rect.top,
			height: rect.height
		};
	}

	function getSurfaceBoundaryRect(surface: HTMLElement, offset: number) {
		const children = Array.from(surface.childNodes);
		const nextRect = getNodeEdgeRect(children[offset], 'start');

		if (nextRect) {
			return nextRect;
		}

		return getNodeEdgeRect(children[offset - 1], 'end');
	}

	function getTextOffsetCaretRect(range: Range | null) {
		const textNode = range?.startContainer;

		if (!textNode || textNode.nodeType !== Node.TEXT_NODE || !textNode.textContent) {
			return null;
		}

		const offset = Math.max(0, Math.min(range.startOffset, textNode.textContent.length));
		const probeRange = textNode.ownerDocument?.createRange();

		if (!probeRange) {
			return null;
		}

		if (offset < textNode.textContent.length) {
			probeRange.setStart(textNode, offset);
			probeRange.setEnd(textNode, offset + 1);

			const rect = Array.from(probeRange.getClientRects()).find((entry) => usableDomRect(entry));

			probeRange.detach();

			return rect
				? {
						left: rect.left,
						top: rect.top,
						height: rect.height
					}
				: null;
		}

		probeRange.setStart(textNode, offset - 1);
		probeRange.setEnd(textNode, offset);

		const rect = Array.from(probeRange.getClientRects())
			.filter((entry) => usableDomRect(entry))
			.at(-1);

		probeRange.detach();

		return rect
			? {
					left: rect.right,
					top: rect.top,
					height: rect.height
				}
			: null;
	}

	function getSurfaceFallbackRect(surface: HTMLElement, clientX: number, clientY: number) {
		const lineRects = Array.from(surface.getClientRects()).filter((rect) => usableDomRect(rect));
		const lineHeight = getLineHeight(surface);

		if (lineRects.length > 0) {
			const surfaceRect = surface.getBoundingClientRect();
			const line =
				clientY < surfaceRect.top
					? lineRects[0]
					: clientY > surfaceRect.bottom
						? lineRects.at(-1)!
						: lineRects.reduce((nearest, rect) => {
								const nearestY = Math.max(nearest.top, Math.min(clientY, nearest.bottom));
								const rectY = Math.max(rect.top, Math.min(clientY, rect.bottom));

								return Math.abs(clientY - rectY) < Math.abs(clientY - nearestY) ? rect : nearest;
							}, lineRects[0]);
			const placeAtStart =
				clientY < surfaceRect.top ||
				(clientY <= surfaceRect.bottom && clientX < line.left + line.width / 2);

			return {
				left: placeAtStart ? line.left : line.right,
				top: line.top,
				height: Math.max(line.height, lineHeight)
			};
		}

		const rect = surface.getBoundingClientRect();

		return {
			left: clientX < rect.left + rect.width / 2 ? rect.left : rect.right,
			top: rect.top,
			height: rect.height > 0 ? rect.height : lineHeight
		};
	}

	function toEditorRelativeRect(rect: { left: number; top: number; height: number }) {
		const rootRect = editorRoot?.getBoundingClientRect();

		if (!rootRect) {
			return { left: 0, top: 0, height: rect.height };
		}

		return {
			left: rect.left - rootRect.left,
			top: rect.top - rootRect.top,
			height: rect.height
		};
	}

	function getDropCaretRect(
		surface: HTMLElement,
		range: Range | null,
		clientX: number,
		clientY: number
	): DropCaretRect {
		const rangeRect = getUsableRangeRect(range);

		if (rangeRect) {
			return toEditorRelativeRect(rangeRect);
		}

		const textOffsetRect = getTextOffsetCaretRect(range);

		if (textOffsetRect) {
			return toEditorRelativeRect(textOffsetRect);
		}

		if (range?.startContainer === surface) {
			const boundaryRect = getSurfaceBoundaryRect(surface, range.startOffset);

			if (boundaryRect) {
				return toEditorRelativeRect(boundaryRect);
			}
		}

		return toEditorRelativeRect(getSurfaceFallbackRect(surface, clientX, clientY));
	}

	function clearDropPreview() {
		dropPreview = null;
	}

	function hasVariableDragPayload(event: DragEvent) {
		return (
			!disabled &&
			(dataTransferHasType(event, BLUEPRINT_VARIABLE_DRAG_MIME) ||
				dataTransferHasType(event, BLUEPRINT_BODY_VARIABLE_DRAG_MIME))
		);
	}

	function hasSurfaceVariableDragPayload(event: DragEvent) {
		return (
			!disabled &&
			dataTransferHasType(event, BLUEPRINT_BODY_VARIABLE_DRAG_MIME)
		);
	}

	function sameInlineContext(
		left: { blockId: string; itemId: string | null },
		right: { blockId: string; itemId: string | null }
	) {
		return left.blockId === right.blockId && left.itemId === right.itemId;
	}

	function insertVariableIntoSurface(surface: HTMLElement, fieldId: string, range: Range | null) {
		const context = getInlineContext(surface);

		if (!context) {
			return;
		}

		clearSelectedVariable();
		const nextNodes = insertVariableInSurface(
			surface,
			fieldId,
			range,
			INLINE_SURFACE_OPTIONS
		);
		updateInlineContent(context.blockId, context.itemId, nextNodes);
		renderInlineNodes(surface, nextNodes);
		focusInlineEnd(surface);
	}

	function insertTextIntoSurface(surface: HTMLElement, text: string) {
		insertPlainText(surface, text, focusInlineEnd, () => {
			const context = getInlineContext(surface);

			if (context) {
				updateInlineContent(context.blockId, context.itemId, serializeInlineNodes(surface));
			}
		});
	}

	function handleInlinePaste(event: ClipboardEvent) {
		if (disabled) {
			return;
		}

		event.preventDefault();

		const target = event.currentTarget;

		if (target instanceof HTMLElement) {
			insertTextIntoSurface(target, event.clipboardData?.getData('text/plain') ?? '');
		}
	}

	function handleDragOver(event: DragEvent) {
		const dataTransfer = event.dataTransfer;

		if (!hasVariableDragPayload(event) || !dataTransfer) {
			clearDropPreview();
			return;
		}

		event.preventDefault();
		dataTransfer.dropEffect = hasSurfaceVariableDragPayload(event) ? 'move' : 'copy';

		const target = resolveVariableDropTarget(event.clientX, event.clientY);

		dropPreview = target
			? {
					...target,
					rect: getDropCaretRect(target.surface, target.range, event.clientX, event.clientY)
				}
			: null;
	}

	function insertVariableIntoEmptyBody(fieldId: string) {
		onBodyChange([
			blueprintParagraph(createBlueprintId('paragraph'), [
				{
					type: 'variable',
					fieldId
				}
			])
		]);
	}

	function moveVariable(payload: VariableDragPayload, target: VariableDropTarget | null) {
		if (
			moveVariableBetweenSurfaces({
				activeDrag: activeVariableDrag,
				payload,
				target,
				root: editorRoot,
				sameContext: sameInlineContext,
				getContext: getInlineContext,
				options: INLINE_SURFACE_OPTIONS,
				updateOne: (context, nodes) => updateInlineContent(context.blockId, context.itemId, nodes),
				updateMany: updateInlineContents,
				render: renderInlineNodes,
				focus: focusInlineEnd
			})
		) {
			clearSelectedVariable();
		}
	}

	function handleDrop(event: DragEvent) {
		const inlinePayloadValue = event.dataTransfer?.getData(BLUEPRINT_BODY_VARIABLE_DRAG_MIME);
		const payloadValue = event.dataTransfer?.getData(BLUEPRINT_VARIABLE_DRAG_MIME);

		if ((!inlinePayloadValue && !payloadValue) || disabled) {
			clearDropPreview();
			return;
		}

		event.preventDefault();
		clearDropPreview();
		clearSelectedVariable();

		const target = resolveVariableDropTarget(event.clientX, event.clientY);
		const inlinePayload = inlinePayloadValue ? decodeVariableDragPayload(inlinePayloadValue) : null;

		if (inlinePayload) {
			moveVariable(inlinePayload, target);
			activeVariableDrag = null;
			return;
		}

		if (!payloadValue) {
			return;
		}

		const payload = decodePaletteVariableDragPayload(payloadValue);
		const field = payload ? variables.find((variable) => variable.id === payload.fieldId) : null;

		if (!field) {
			return;
		}

		if (!target) {
			insertVariableIntoEmptyBody(field.id);
			return;
		}

		insertVariableIntoSurface(target.surface, field.id, target.range);
	}

	function handleDragLeave(event: DragEvent) {
		const nextTarget = event.relatedTarget;

		if (!editorRoot || !(nextTarget instanceof Node) || !editorRoot.contains(nextTarget)) {
			clearDropPreview();
		}
	}
</script>

<svelte:document onpointerdown={handleDocumentPointerDown} />
<svelte:window onkeydown={handleEditorKeydown} />

<div
	bind:this={editorRoot}
	class="blueprint-email-body-editor"
	role="group"
	aria-label="Email body"
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
>
	{#each displayedBody as block (block.id)}
		{#if block.type === 'paragraph'}
			<p class="blueprint-body-paragraph">
				<span
					use:inlineSurface={{ blockId: block.id, itemId: null, nodes: block.content }}
					class="blueprint-inline-surface"
					contenteditable={!disabled}
					role="textbox"
					tabindex={disabled ? -1 : 0}
					aria-label="Email paragraph"
					oninput={handleInlineInput}
					onpaste={handleInlinePaste}
				></span>
			</p>
		{:else}
			<ul class="blueprint-body-list">
				{#each block.items as item (item.id)}
					<li>
						<span
							use:inlineSurface={{ blockId: block.id, itemId: item.id, nodes: item.content }}
							class="blueprint-inline-surface"
							contenteditable={!disabled}
							role="textbox"
							tabindex={disabled ? -1 : 0}
							aria-label="Email bullet item"
							oninput={handleInlineInput}
							onpaste={handleInlinePaste}
						></span>
					</li>
				{/each}
			</ul>
		{/if}
	{/each}

	{#if dropPreview}
		<span
			class="blueprint-drop-caret"
			style={`left: ${dropPreview.rect.left}px; top: ${dropPreview.rect.top}px; height: ${dropPreview.rect.height}px;`}
			aria-hidden="true"
		></span>
	{/if}
</div>

<style>
	.blueprint-email-body-editor {
		position: relative;
		min-height: calc(1.72em * 4);
		border: 0;
		outline: none;
		color: rgb(28 25 23);
		font-size: 0.79rem;
		line-height: 1.9;
		white-space: pre-wrap;
	}

	.blueprint-body-paragraph {
		margin: 0 0 0.875rem;
		white-space: pre-wrap;
	}

	.blueprint-body-paragraph:last-child,
	.blueprint-body-list:last-child {
		margin-bottom: 0;
	}

	.blueprint-body-list {
		margin: 0 0 0.875rem;
		padding-left: 1.25rem;
		list-style: disc;
	}

	.blueprint-body-list li {
		padding-left: 0.25rem;
	}

	.blueprint-inline-surface {
		display: inline;
		min-width: 1ch;
		outline: none;
		white-space: pre-wrap;
	}

	.blueprint-inline-surface[contenteditable='false'] {
		cursor: default;
		opacity: 0.6;
	}

	.blueprint-email-body-editor :global(.blueprint-variable-pill) {
		user-select: none;
		gap: 0.25rem;
		transition:
			background-color 150ms ease,
			border-color 150ms ease;
		vertical-align: baseline;
	}

	.blueprint-inline-surface:not([contenteditable='false']) :global(.blueprint-variable-pill) {
		cursor: grab;
	}

	.blueprint-inline-surface:not([contenteditable='false']) :global(.blueprint-variable-pill:hover) {
		background: rgb(209 250 229 / 0.8);
	}

	.blueprint-inline-surface:not([contenteditable='false']) :global(.blueprint-variable-pill:active) {
		cursor: grabbing;
	}

	.blueprint-email-body-editor :global(.blueprint-variable-pill--selected) {
		border-color: transparent;
		background: rgb(209 250 229);
	}

	.blueprint-email-body-editor :global(.blueprint-variable-pill__label) {
		line-height: 1;
	}

	.blueprint-email-body-editor :global(.blueprint-variable-pill__remove) {
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

	.blueprint-email-body-editor :global(.blueprint-variable-pill__remove:hover) {
		background: rgb(209 250 229 / 0.75);
	}

	.blueprint-inline-surface:focus :global(.blueprint-variable-pill) {
		border-color: transparent;
	}

	.blueprint-drop-caret {
		position: absolute;
		z-index: 5;
		width: 2px;
		min-height: 1em;
		border-radius: 999px;
		background: rgb(16 185 129);
		pointer-events: none;
		transform: translateX(-1px);
	}
</style>
