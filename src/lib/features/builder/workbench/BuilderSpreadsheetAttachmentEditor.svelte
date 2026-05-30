<script lang="ts">
	import ArrowLeftIcon from 'phosphor-svelte/lib/ArrowLeftIcon';
	import { IconButton } from '$lib/ui';
	import {
		BUILDER_SPREADSHEET_COLUMN_COUNT,
		BUILDER_SPREADSHEET_COLUMN_LABELS,
		BUILDER_SPREADSHEET_ROW_COUNT,
		formatBuilderVariableLabel,
		normalizeBuilderSpreadsheetAttachment,
		normalizeBuilderSpreadsheetCell,
		type BuilderInlineNode,
		type BuilderSpreadsheetAttachment,
		type BuilderVariableDefinition
	} from '../../../../builders/model';
	import {
		BUILDER_VARIABLE_DRAG_MIME,
		createBuilderVariableDragImage,
		decodeBuilderVariableDragPayload
	} from './builder-variable-drag';
	import {
		areInlineNodesEqual,
		cloneBuilderInlineNodes,
		closestVariablePill,
		createSurfaceRangeAfterChild,
		createVariablePill as createBuilderInlineVariablePill,
		focusEnd as focusCellEnd,
		insertPlainText,
		normalizeDropRange,
		renderSurface,
		renderVariablePillContents,
		selectRange,
		serializeSurface,
		type BuilderInlineSurfaceOptions
	} from './builder-inline-surface';
	import {
		createBuilderInlineVariableDragMime,
		dataTransferHasType,
		decodeBuilderInlineVariableDragPayload,
		deleteVariableFromSurface,
		encodeBuilderInlineVariableDragPayload,
		insertVariableInSurface,
		isSameVariableIdentity,
		moveVariableBetweenSurfaces,
		type BuilderActiveVariableDrag,
		type BuilderInlineVariableDragPayload,
		type BuilderInlineVariableIdentity
	} from './builder-inline-variable-editor';

	type CellSurfaceParams = {
		rowIndex: number;
		columnIndex: number;
		nodes: readonly BuilderInlineNode[];
	};

	type CellContext = {
		rowIndex: number;
		columnIndex: number;
	};

	type SelectedVariable = BuilderInlineVariableIdentity<CellContext>;
	type VariableDragPayload = BuilderInlineVariableDragPayload<CellContext>;
	type ActiveVariableDrag = BuilderActiveVariableDrag<CellContext>;

	type CaretBookmark = {
		surface: HTMLElement;
		range: Range;
	};

	type Props = {
		attachment: BuilderSpreadsheetAttachment;
		variables: readonly BuilderVariableDefinition[];
		disabled?: boolean;
		variableInsertionRequest?: { id: number; fieldId: string } | null;
		onClose: () => void;
		onAttachmentChange: (attachment: BuilderSpreadsheetAttachment) => void;
	};

	const BUILDER_SPREADSHEET_SURFACE_VARIABLE_DRAG_MIME =
		createBuilderInlineVariableDragMime('spreadsheet');
	const CELL_SURFACE_OPTIONS = {
		variableDatasetKey: 'builderSpreadsheetVariableId',
		joinMode: 'cell',
		normalize: normalizeBuilderSpreadsheetCell
	} satisfies BuilderInlineSurfaceOptions;

	let {
		attachment,
		variables,
		disabled = false,
		variableInsertionRequest = null,
		onClose,
		onAttachmentChange
	}: Props = $props();
	let spreadsheetRoot: HTMLDivElement;
	let selectedVariable = $state<SelectedVariable | null>(null);
	let handledInsertionRequestId = $state(0);
	let activeVariableDrag: ActiveVariableDrag | null = null;
	let caretBookmark: CaretBookmark | null = null;

	const rowIndexes = Array.from({ length: BUILDER_SPREADSHEET_ROW_COUNT }, (_, index) => index);
	const rowHeaderColumnWidth = 40;
	const spreadsheetDataColumnWidth = 144;
	const spreadsheetTableWidth =
		rowHeaderColumnWidth + BUILDER_SPREADSHEET_COLUMN_LABELS.length * spreadsheetDataColumnWidth;
	const variableFieldById = $derived(new Map(variables.map((field) => [field.id, field])));

	$effect(() => {
		const selected = selectedVariable;

		if (!selected) {
			return;
		}

		if (disabled || attachment.cells[selected.rowIndex]?.[selected.columnIndex]?.[selected.nodeIndex]?.type !== 'variable') {
			clearSelectedVariable();
		}
	});

	$effect(() => {
		const request = variableInsertionRequest;

		if (!request || request.id === handledInsertionRequestId) {
			return;
		}

		handledInsertionRequestId = request.id;
		insertSelectedVariable(request.fieldId);
	});

	function cellKey(rowIndex: number, columnIndex: number) {
		return `${rowIndex}:${columnIndex}`;
	}

	function isSameCell(left: CellContext, right: CellContext) {
		return left.rowIndex === right.rowIndex && left.columnIndex === right.columnIndex;
	}

	function isSameSelectedVariable(
		left: SelectedVariable | null,
		right: SelectedVariable
	) {
		return isSameVariableIdentity(left, right, ['rowIndex', 'columnIndex']);
	}

	function normalizeInlineNodes(nodes: readonly BuilderInlineNode[]) {
		return normalizeBuilderSpreadsheetCell(nodes);
	}

	function decodeVariableDragPayload(
		value: string
	): VariableDragPayload | null {
		return decodeBuilderInlineVariableDragPayload<CellContext>(value, (payload) => {
			if (
				typeof payload.rowIndex !== 'number' ||
				typeof payload.columnIndex !== 'number' ||
				!Number.isInteger(payload.rowIndex) ||
				!Number.isInteger(payload.columnIndex) ||
				payload.rowIndex < 0 ||
				payload.columnIndex < 0
			) {
				return null;
			}

			return {
				rowIndex: payload.rowIndex,
				columnIndex: payload.columnIndex
			};
		});
	}

	function startVariableDrag(
		event: DragEvent,
		fieldId: string,
		source: SelectedVariable,
		sourcePill: HTMLElement
	) {
		const sourceSurface = closestCellSurface(sourcePill);

		if (!event.dataTransfer || !sourceSurface || disabled) {
			return;
		}

		const label = formatBuilderVariableLabel(variables, fieldId);
		const dragImage = createBuilderVariableDragImage(label);

		clearSelectedVariable({ rerender: false });
		sourcePill.classList.remove('builder-variable-pill--selected');
		renderVariablePillContents(sourcePill, label, false, () =>
			deleteSelectedVariable(source)
		);

		activeVariableDrag = {
			fieldId,
			...source,
			sourcePill,
			sourceSurface
		};

		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData(
			BUILDER_SPREADSHEET_SURFACE_VARIABLE_DRAG_MIME,
			encodeBuilderInlineVariableDragPayload({
				fieldId,
				...source
			})
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

	function createVariablePill(fieldId: string, source: SelectedVariable) {
		return createBuilderInlineVariablePill({
			fieldId,
			label: formatBuilderVariableLabel(variables, fieldId),
			source,
			selected: !disabled && isSameSelectedVariable(selectedVariable, source),
			disabled,
			variableDatasetKey: CELL_SURFACE_OPTIONS.variableDatasetKey,
			onSelect: selectVariable,
			onRemove: deleteSelectedVariable,
			onDragStart: startVariableDrag,
			onDragEnd: () => {
				activeVariableDrag = null;
				clearSelectedVariable();
			}
		});
	}

	function renderInlineNodes(element: HTMLElement, nodes: readonly BuilderInlineNode[]) {
		const context = getCellContext(element);

		renderSurface(
			element,
			nodes,
			(nodeIndex) => ({
				rowIndex: context?.rowIndex ?? 0,
				columnIndex: context?.columnIndex ?? 0,
				nodeIndex
			}),
			createVariablePill
		);
	}

	function serializeInlineNodes(parent: Node): BuilderInlineNode[] {
		return serializeSurface(parent, CELL_SURFACE_OPTIONS);
	}

	function cellSurface(element: HTMLElement, params: CellSurfaceParams) {
		element.dataset.builderSpreadsheetCellKey = cellKey(params.rowIndex, params.columnIndex);
		element.dataset.builderRowIndex = String(params.rowIndex);
		element.dataset.builderColumnIndex = String(params.columnIndex);
		element.addEventListener('focus', handleCellSurfaceFocus);
		element.addEventListener('click', handleCellSurfaceClick);
		element.addEventListener('keyup', handleCellSurfaceKeyup);
		element.addEventListener('pointerup', handleCellSurfacePointerup);
		renderInlineNodes(element, params.nodes);

		return {
			update(nextParams: CellSurfaceParams) {
				element.dataset.builderSpreadsheetCellKey = cellKey(
					nextParams.rowIndex,
					nextParams.columnIndex
				);
				element.dataset.builderRowIndex = String(nextParams.rowIndex);
				element.dataset.builderColumnIndex = String(nextParams.columnIndex);

				const currentNodes = serializeInlineNodes(element);

				if (
					document.activeElement !== element &&
					!areInlineNodesEqual(currentNodes, nextParams.nodes)
				) {
					renderInlineNodes(element, nextParams.nodes);
				}
			},
			destroy() {
				element.removeEventListener('focus', handleCellSurfaceFocus);
				element.removeEventListener('click', handleCellSurfaceClick);
				element.removeEventListener('keyup', handleCellSurfaceKeyup);
				element.removeEventListener('pointerup', handleCellSurfacePointerup);
			}
		};
	}

	function normalizedAttachmentWithCells(
		updates: Array<CellContext & { content: readonly BuilderInlineNode[] }>
	) {
		const updateByKey = new Map(
			updates.map((update) => [cellKey(update.rowIndex, update.columnIndex), update.content])
		);
		const nextAttachment = {
			...attachment,
			cells: Array.from({ length: BUILDER_SPREADSHEET_ROW_COUNT }, (_, rowIndex) =>
				Array.from({ length: BUILDER_SPREADSHEET_COLUMN_COUNT }, (_, columnIndex) => {
					const update = updateByKey.get(cellKey(rowIndex, columnIndex));

					return update
						? normalizeInlineNodes(update)
						: cloneBuilderInlineNodes(attachment.cells[rowIndex]?.[columnIndex] ?? []);
				})
			)
		};

		return normalizeBuilderSpreadsheetAttachment(nextAttachment) ?? nextAttachment;
	}

	function updateCell(rowIndex: number, columnIndex: number, content: readonly BuilderInlineNode[]) {
		if (disabled) {
			return;
		}

		onAttachmentChange(
			normalizedAttachmentWithCells([
				{
					rowIndex,
					columnIndex,
					content
				}
			])
		);
	}

	function updateCells(updates: Array<CellContext & { content: readonly BuilderInlineNode[] }>) {
		if (disabled) {
			return;
		}

		onAttachmentChange(normalizedAttachmentWithCells(updates));
	}

	function getCellContext(element: HTMLElement): CellContext | null {
		const rowIndex = Number.parseInt(element.dataset.builderRowIndex ?? '', 10);
		const columnIndex = Number.parseInt(element.dataset.builderColumnIndex ?? '', 10);

		if (!Number.isInteger(rowIndex) || !Number.isInteger(columnIndex)) {
			return null;
		}

		return { rowIndex, columnIndex };
	}

	function findCellSurface(identity: CellContext) {
		return (
			spreadsheetRoot?.querySelector<HTMLElement>(
				`[data-builder-spreadsheet-cell-key="${cellKey(identity.rowIndex, identity.columnIndex)}"]`
			) ?? null
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

		const surface = options.rerender === false ? null : findCellSurface(selected);
		selectedVariable = null;

		if (surface) {
			renderSurfaceFromCurrentContent(surface);
		}
	}

	function selectVariable(source: SelectedVariable) {
		if (disabled) {
			return;
		}

		const previousSelected = selectedVariable;

		if (isSameSelectedVariable(previousSelected, source)) {
			return;
		}

		const previousSurface = previousSelected ? findCellSurface(previousSelected) : null;
		const nextSurface = findCellSurface(source);

		selectedVariable = source;

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

		const surface = findCellSurface(source);

		if (!surface) {
			clearSelectedVariable({ rerender: false });
			return;
		}

		const result = deleteVariableFromSurface(
			surface,
			source.nodeIndex,
			CELL_SURFACE_OPTIONS,
			serializeInlineNodes
		);

		if (!result.didDelete) {
			clearSelectedVariable({ rerender: false });
			renderInlineNodes(surface, result.nodes);
			return;
		}

		clearSelectedVariable({ rerender: false });
		updateCell(source.rowIndex, source.columnIndex, result.nodes);
		renderInlineNodes(surface, result.nodes);
	}

	function rangeBelongsToSurface(surface: HTMLElement, range: Range | null) {
		return Boolean(range && surface.contains(range.commonAncestorContainer));
	}

	function isBookmarkableSurface(surface: HTMLElement | null) {
		return (
			!disabled &&
			surface !== null &&
			spreadsheetRoot?.contains(surface) === true &&
			surface.isContentEditable &&
			getCellContext(surface) !== null
		);
	}

	function isBookmarkableRange(surface: HTMLElement, range: Range | null) {
		if (!rangeBelongsToSurface(surface, range)) {
			return false;
		}

		return (
			!closestVariablePill(surface, range!.startContainer, CELL_SURFACE_OPTIONS.variableDatasetKey)
		);
	}

	function bookmarkSurfaceRange(surface: HTMLElement, range: Range | null) {
		if (!isBookmarkableSurface(surface) || !isBookmarkableRange(surface, range)) {
			return;
		}

		caretBookmark = {
			surface,
			range: range!.cloneRange()
		};
	}

	function bookmarkSurfaceSelection(surface: HTMLElement) {
		const selection = surface.ownerDocument.getSelection();
		const range = selection?.rangeCount ? selection.getRangeAt(0) : null;

		bookmarkSurfaceRange(surface, range);
	}

	function bookmarkEventSurfaceSelection(event: Event) {
		const target = event.currentTarget;

		if (target instanceof HTMLElement) {
			bookmarkSurfaceSelection(target);
		}
	}

	function handleCellSurfaceFocus(event: FocusEvent) {
		bookmarkEventSurfaceSelection(event);
	}

	function handleCellSurfaceKeyup(event: KeyboardEvent) {
		bookmarkEventSurfaceSelection(event);
	}

	function handleCellSurfacePointerup(event: PointerEvent) {
		bookmarkEventSurfaceSelection(event);
	}

	function handleCellSurfaceClick(event: MouseEvent) {
		const target = event.target;

		if (target instanceof Element && target.closest('[data-builder-spreadsheet-variable-id]')) {
			return;
		}

		clearSelectedVariable();
		bookmarkEventSurfaceSelection(event);
	}

	function handleDocumentSelectionChange() {
		if (disabled || !spreadsheetRoot) {
			return;
		}

		const selection = spreadsheetRoot.ownerDocument.getSelection();
		const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
		const surface = range ? closestCellSurface(range.commonAncestorContainer) : null;

		if (surface) {
			bookmarkSurfaceRange(surface, range);
		}
	}

	function handleDocumentPointerDown(event: PointerEvent) {
		if (!selectedVariable) {
			return;
		}

		const target = event.target;

		if (target instanceof Element && target.closest('[data-builder-spreadsheet-variable-id]')) {
			return;
		}

		clearSelectedVariable();
	}

	function handleCellInput(event: Event) {
		const target = event.currentTarget;

		if (!(target instanceof HTMLElement)) {
			return;
		}

		const context = getCellContext(target);

		if (context) {
			updateCell(context.rowIndex, context.columnIndex, serializeInlineNodes(target));
			bookmarkSurfaceSelection(target);
		}
	}

	function getRangeFromPoint(clientX: number, clientY: number) {
		const doc = spreadsheetRoot?.ownerDocument;

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

	function closestCellSurface(node: Node | null) {
		const element = node instanceof Element ? node : node?.parentElement;
		const surface = element?.closest('[data-builder-spreadsheet-cell-key]');

		return surface instanceof HTMLElement && spreadsheetRoot?.contains(surface) ? surface : null;
	}

	function getActiveCellSurface() {
		return closestCellSurface(spreadsheetRoot?.ownerDocument.activeElement ?? null);
	}

	function getActiveCellRange(surface: HTMLElement) {
		const selection = surface.ownerDocument.getSelection();
		const range = selection?.rangeCount ? selection.getRangeAt(0) : null;

		if (!range || !surface.contains(range.commonAncestorContainer)) {
			return null;
		}

		return range;
	}

	function getBookmarkedInsertionTarget() {
		const bookmark = caretBookmark;

		if (
			!bookmark ||
			!isBookmarkableSurface(bookmark.surface) ||
			!isBookmarkableRange(bookmark.surface, bookmark.range)
		) {
			return null;
		}

		return {
			surface: bookmark.surface,
			range: bookmark.range.cloneRange()
		};
	}

	function getVariableTapInsertionTarget() {
		const activeSurface = getActiveCellSurface();
		const activeRange = activeSurface ? getActiveCellRange(activeSurface) : null;

		if (activeSurface && activeRange && isBookmarkableRange(activeSurface, activeRange)) {
			bookmarkSurfaceRange(activeSurface, activeRange);
			return {
				surface: activeSurface,
				range: activeRange.cloneRange()
			};
		}

		return getBookmarkedInsertionTarget();
	}

	function focusAfterInsertedVariable(surface: HTMLElement, insertedNodeIndex: number | null) {
		if (insertedNodeIndex === null) {
			focusCellEnd(surface);
			bookmarkSurfaceSelection(surface);
			return;
		}

		surface.focus();
		const range = createSurfaceRangeAfterChild(surface, insertedNodeIndex);
		selectRange(range);
		bookmarkSurfaceRange(surface, range);
	}

	function getFirstCellSurface() {
		return spreadsheetRoot?.querySelector<HTMLElement>('[data-builder-spreadsheet-cell-key]') ?? null;
	}

	function getCellSurfaceUnderPointer(clientX: number, clientY: number) {
		return closestCellSurface(
			spreadsheetRoot?.ownerDocument.elementFromPoint(clientX, clientY) ?? null
		);
	}

	function resolveDropTarget(clientX: number, clientY: number) {
		const surface = getCellSurfaceUnderPointer(clientX, clientY);
		const range = getRangeFromPoint(clientX, clientY);
		const rangeSurface = range ? closestCellSurface(range.commonAncestorContainer) : null;
		const targetSurface = surface ?? rangeSurface;

		if (!targetSurface) {
			return null;
		}

		return {
			surface: targetSurface,
			range:
				rangeSurface === targetSurface
					? normalizeDropRange(targetSurface, range, clientX, CELL_SURFACE_OPTIONS)
					: null
		};
	}

	function insertVariableIntoSurface(
		surface: HTMLElement,
		fieldId: string,
		range: Range | null,
		caretPlacement: 'inserted-variable' | 'end' = 'end'
	) {
		const context = getCellContext(surface);

		if (!context) {
			return;
		}

		clearSelectedVariable();
		const insertResult = insertVariableInSurface(
			surface,
			fieldId,
			range,
			CELL_SURFACE_OPTIONS
		);
		updateCell(context.rowIndex, context.columnIndex, insertResult.nodes);
		renderInlineNodes(surface, insertResult.nodes);
		if (caretPlacement === 'inserted-variable') {
			focusAfterInsertedVariable(surface, insertResult.insertedNodeIndex);
			return;
		}

		focusCellEnd(surface);
		bookmarkSurfaceSelection(surface);
	}

	function insertSelectedVariable(fieldId: string) {
		if (disabled || !variableFieldById.has(fieldId)) {
			return;
		}

		const target = getVariableTapInsertionTarget();

		if (target) {
			insertVariableIntoSurface(target.surface, fieldId, target.range, 'inserted-variable');
			return;
		}

		const firstSurface = getFirstCellSurface();

		if (firstSurface) {
			insertVariableIntoSurface(firstSurface, fieldId, null);
		}
	}

	function moveVariable(payload: VariableDragPayload, target: ReturnType<typeof resolveDropTarget>) {
		if (
			moveVariableBetweenSurfaces({
				activeDrag: activeVariableDrag,
				payload,
				target,
				root: spreadsheetRoot,
				sameContext: isSameCell,
				getContext: getCellContext,
				options: CELL_SURFACE_OPTIONS,
				updateOne: (context, nodes) => updateCell(context.rowIndex, context.columnIndex, nodes),
				updateMany: updateCells,
				render: renderInlineNodes,
				focus: focusCellEnd
			})
		) {
			clearSelectedVariable();
		}
	}

	function hasVariableDragPayload(event: DragEvent) {
		return (
			!disabled &&
			(dataTransferHasType(event, BUILDER_VARIABLE_DRAG_MIME) ||
				dataTransferHasType(event, BUILDER_SPREADSHEET_SURFACE_VARIABLE_DRAG_MIME))
		);
	}

	function hasSurfaceVariableDragPayload(event: DragEvent) {
		return (
			!disabled &&
			dataTransferHasType(event, BUILDER_SPREADSHEET_SURFACE_VARIABLE_DRAG_MIME)
		);
	}

	function handleDragOver(event: DragEvent) {
		if (!hasVariableDragPayload(event) || !event.dataTransfer) {
			return;
		}

		event.preventDefault();
		event.dataTransfer.dropEffect = hasSurfaceVariableDragPayload(event) ? 'move' : 'copy';
	}

	function handleDrop(event: DragEvent) {
		const spreadsheetPayloadValue = event.dataTransfer?.getData(BUILDER_SPREADSHEET_SURFACE_VARIABLE_DRAG_MIME);
		const palettePayloadValue = event.dataTransfer?.getData(BUILDER_VARIABLE_DRAG_MIME);

		if ((!spreadsheetPayloadValue && !palettePayloadValue) || disabled) {
			return;
		}

		event.preventDefault();
		clearSelectedVariable();

		const target = resolveDropTarget(event.clientX, event.clientY);

		if (!target) {
			return;
		}

		const spreadsheetPayload = spreadsheetPayloadValue
			? decodeVariableDragPayload(spreadsheetPayloadValue)
			: null;

		if (spreadsheetPayload) {
			moveVariable(spreadsheetPayload, target);
			activeVariableDrag = null;
			return;
		}

		if (!palettePayloadValue) {
			return;
		}

		const palettePayload = decodeBuilderVariableDragPayload(palettePayloadValue);
		const field = palettePayload ? variableFieldById.get(palettePayload.fieldId) : null;

		if (field) {
			insertVariableIntoSurface(target.surface, field.id, target.range);
		}
	}

	function insertTextIntoSurface(surface: HTMLElement, text: string) {
		insertPlainText(surface, text, focusCellEnd, () => {
			const context = getCellContext(surface);

			if (context) {
				updateCell(context.rowIndex, context.columnIndex, serializeInlineNodes(surface));
			}
		});
	}

	function handleCellPaste(event: ClipboardEvent) {
		if (disabled) {
			return;
		}

		event.preventDefault();

		const target = event.currentTarget;

		if (target instanceof HTMLElement) {
			insertTextIntoSurface(target, event.clipboardData?.getData('text/plain') ?? '');
		}
	}

	function focusCell(rowIndex: number, columnIndex: number) {
		findCellSurface({ rowIndex, columnIndex })?.focus();
	}

	function handleCellKeydown(event: KeyboardEvent, rowIndex: number, columnIndex: number) {
		if (event.key === 'Escape') {
			clearSelectedVariable();
			return;
		}

		if (event.key === 'Enter') {
			event.preventDefault();
			focusCell(Math.min(rowIndex + 1, BUILDER_SPREADSHEET_ROW_COUNT - 1), columnIndex);
			return;
		}

		if (event.key === 'Tab') {
			event.preventDefault();
			const direction = event.shiftKey ? -1 : 1;
			const nextFlatIndex =
				rowIndex * BUILDER_SPREADSHEET_COLUMN_COUNT + columnIndex + direction;
			const maxFlatIndex =
				BUILDER_SPREADSHEET_ROW_COUNT * BUILDER_SPREADSHEET_COLUMN_COUNT - 1;
			const clampedFlatIndex = Math.max(0, Math.min(maxFlatIndex, nextFlatIndex));

			focusCell(
				Math.floor(clampedFlatIndex / BUILDER_SPREADSHEET_COLUMN_COUNT),
				clampedFlatIndex % BUILDER_SPREADSHEET_COLUMN_COUNT
			);
		}
	}
</script>

<svelte:document
	onpointerdown={handleDocumentPointerDown}
	onselectionchange={handleDocumentSelectionChange}
/>
<svelte:window
	ondragend={() => {
		activeVariableDrag = null;
	}}
/>

<div
	bind:this={spreadsheetRoot}
	class="builder-spreadsheet-editor flex min-h-full w-full flex-col overflow-hidden bg-white"
	role="group"
	aria-label="Spreadsheet attachment"
	ondragover={handleDragOver}
	ondrop={handleDrop}
>
	<div class="flex h-12 shrink-0 items-center gap-3 border-b border-stone-200 bg-white px-2.5">
		<IconButton
			aria-label="Back to email"
			variant="ghost"
			class="size-7 shrink-0 text-stone-500 hover:text-stone-900 focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:outline-none"
			onclick={onClose}
		>
			<ArrowLeftIcon size={14} weight="regular" />
		</IconButton>
		<div
			class="flex size-7 shrink-0 items-center justify-center rounded-sm border border-emerald-200 bg-emerald-50/60 text-[0.54rem] font-normal text-emerald-700"
			aria-hidden="true"
		>
			XLS
		</div>
		<div class="min-w-0 flex-1">
			<p class="truncate text-[0.79rem] font-medium text-stone-900">{attachment.filename}</p>
		</div>
	</div>

	<div class="min-h-0 flex-1 overflow-auto bg-white">
		<table
			class="table-fixed border-separate border-spacing-0 text-left text-[0.79rem]"
			style={`width: ${spreadsheetTableWidth}px; min-width: ${spreadsheetTableWidth}px;`}
		>
			<colgroup>
				<col style={`width: ${rowHeaderColumnWidth}px;`} />
				{#each BUILDER_SPREADSHEET_COLUMN_LABELS as column (column)}
					<col style={`width: ${spreadsheetDataColumnWidth}px;`} />
				{/each}
			</colgroup>
			<thead>
				<tr>
					<th
						class="sticky top-0 left-0 z-20 h-8 border-r border-b border-stone-200 bg-stone-100"
						aria-label="Rows"
					></th>
					{#each BUILDER_SPREADSHEET_COLUMN_LABELS as column (column)}
						<th
							class="sticky top-0 z-10 h-8 overflow-hidden border-r border-b border-stone-200 bg-emerald-50/70 px-2 text-center text-[0.62rem] font-normal text-ellipsis whitespace-nowrap text-emerald-900"
						>
							{column}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each rowIndexes as rowIndex (rowIndex)}
					<tr>
						<th
							class="sticky left-0 z-10 h-8 border-r border-b border-stone-200 bg-stone-50 px-2 text-right text-[0.62rem] font-normal text-stone-500"
						>
							{rowIndex + 1}
						</th>
						{#each BUILDER_SPREADSHEET_COLUMN_LABELS as column, cellIndex (column)}
							<td
								class="h-8 overflow-hidden border-r border-b border-stone-200 px-2 align-middle"
								class:bg-stone-50={rowIndex === 0}
							>
								<span
									use:cellSurface={{
										rowIndex,
										columnIndex: cellIndex,
										nodes: attachment.cells[rowIndex]?.[cellIndex] ?? []
									}}
									contenteditable={!disabled}
									role="textbox"
									tabindex={disabled ? -1 : 0}
									aria-label={`Row ${rowIndex + 1}, column ${cellIndex + 1}`}
									class="builder-spreadsheet-cell-surface block h-full min-h-7 w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap outline-none"
									class:font-medium={rowIndex === 0}
									class:text-stone-900={rowIndex === 0}
									class:text-stone-800={rowIndex !== 0}
									oninput={handleCellInput}
									onpaste={handleCellPaste}
									onkeydown={(event) => handleCellKeydown(event, rowIndex, cellIndex)}
								></span>
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.builder-spreadsheet-cell-surface {
		box-sizing: border-box;
		padding-top: 0.375rem;
		padding-bottom: 0.375rem;
		line-height: 1rem;
	}

	.builder-spreadsheet-cell-surface[contenteditable='false'] {
		cursor: default;
		opacity: 0.6;
	}

	.builder-spreadsheet-editor :global(.builder-variable-pill) {
		user-select: none;
		gap: 0.25rem;
		transition:
			background-color 150ms ease,
			border-color 150ms ease;
		vertical-align: baseline;
	}

	.builder-spreadsheet-cell-surface:not([contenteditable='false'])
		:global(.builder-variable-pill) {
		cursor: grab;
	}

	.builder-spreadsheet-cell-surface:not([contenteditable='false'])
		:global(.builder-variable-pill:hover) {
		background: rgb(209 250 229 / 0.8);
	}

	.builder-spreadsheet-cell-surface:not([contenteditable='false'])
		:global(.builder-variable-pill:active) {
		cursor: grabbing;
	}

	.builder-spreadsheet-editor :global(.builder-variable-pill--selected) {
		border-color: transparent;
		background: rgb(209 250 229);
	}

	.builder-spreadsheet-editor :global(.builder-variable-pill__label) {
		line-height: 1;
	}

	.builder-spreadsheet-editor :global(.builder-variable-pill__remove) {
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

	.builder-spreadsheet-editor :global(.builder-variable-pill__remove:hover) {
		background: rgb(209 250 229 / 0.75);
	}

	.builder-spreadsheet-cell-surface:focus :global(.builder-variable-pill) {
		border-color: transparent;
	}
</style>
