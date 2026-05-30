<script lang="ts">
	import ArrowLeftIcon from 'phosphor-svelte/lib/ArrowLeftIcon';
	import { IconButton } from '$lib/ui';
	import {
		BLUEPRINT_SPREADSHEET_COLUMN_COUNT,
		BLUEPRINT_SPREADSHEET_COLUMN_LABELS,
		BLUEPRINT_SPREADSHEET_ROW_COUNT,
		formatBlueprintVariableLabel,
		normalizeBlueprintSpreadsheetAttachment,
		normalizeBlueprintSpreadsheetCell,
		type BlueprintInlineNode,
		type BlueprintSpreadsheetAttachment,
		type BlueprintVariableDefinition
	} from '../../../../blueprints/model';
	import {
		BLUEPRINT_VARIABLE_DRAG_MIME,
		createBlueprintVariableDragImage,
		decodeBlueprintVariableDragPayload
	} from './blueprint-variable-drag';
	import {
		areInlineNodesEqual,
		cloneBlueprintInlineNodes,
		createVariablePill as createBlueprintInlineVariablePill,
		focusEnd as focusCellEnd,
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
		type BlueprintInlineVariableIdentity
	} from './blueprint-inline-variable-editor';

	type CellSurfaceParams = {
		rowIndex: number;
		columnIndex: number;
		nodes: readonly BlueprintInlineNode[];
	};

	type CellContext = {
		rowIndex: number;
		columnIndex: number;
	};

	type SelectedVariable = BlueprintInlineVariableIdentity<CellContext>;
	type VariableDragPayload = BlueprintInlineVariableDragPayload<CellContext>;
	type ActiveVariableDrag = BlueprintActiveVariableDrag<CellContext>;

	type Props = {
		attachment: BlueprintSpreadsheetAttachment;
		variables: readonly BlueprintVariableDefinition[];
		disabled?: boolean;
		onClose: () => void;
		onAttachmentChange: (attachment: BlueprintSpreadsheetAttachment) => void;
	};

	const BLUEPRINT_SPREADSHEET_SURFACE_VARIABLE_DRAG_MIME =
		createBlueprintInlineVariableDragMime('spreadsheet');
	const CELL_SURFACE_OPTIONS = {
		variableDatasetKey: 'blueprintSpreadsheetVariableId',
		joinMode: 'cell',
		normalize: normalizeBlueprintSpreadsheetCell
	} satisfies BlueprintInlineSurfaceOptions;

	let { attachment, variables, disabled = false, onClose, onAttachmentChange }: Props = $props();
	let spreadsheetRoot: HTMLDivElement;
	let selectedVariable = $state<SelectedVariable | null>(null);
	let activeVariableDrag: ActiveVariableDrag | null = null;

	const rowIndexes = Array.from({ length: BLUEPRINT_SPREADSHEET_ROW_COUNT }, (_, index) => index);
	const rowHeaderColumnWidth = 40;
	const spreadsheetDataColumnWidth = 144;
	const spreadsheetTableWidth =
		rowHeaderColumnWidth + BLUEPRINT_SPREADSHEET_COLUMN_LABELS.length * spreadsheetDataColumnWidth;
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

	function normalizeInlineNodes(nodes: readonly BlueprintInlineNode[]) {
		return normalizeBlueprintSpreadsheetCell(nodes);
	}

	function decodeVariableDragPayload(
		value: string
	): VariableDragPayload | null {
		return decodeBlueprintInlineVariableDragPayload<CellContext>(value, (payload) => {
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

		const label = formatBlueprintVariableLabel(variables, fieldId);
		const dragImage = createBlueprintVariableDragImage(label);

		clearSelectedVariable({ rerender: false });
		sourcePill.classList.remove('blueprint-variable-pill--selected');
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
			BLUEPRINT_SPREADSHEET_SURFACE_VARIABLE_DRAG_MIME,
			encodeBlueprintInlineVariableDragPayload({
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
		return createBlueprintInlineVariablePill({
			fieldId,
			label: formatBlueprintVariableLabel(variables, fieldId),
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

	function renderInlineNodes(element: HTMLElement, nodes: readonly BlueprintInlineNode[]) {
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

	function serializeInlineNodes(parent: Node): BlueprintInlineNode[] {
		return serializeSurface(parent, CELL_SURFACE_OPTIONS);
	}

	function cellSurface(element: HTMLElement, params: CellSurfaceParams) {
		element.dataset.blueprintSpreadsheetCellKey = cellKey(params.rowIndex, params.columnIndex);
		element.dataset.blueprintRowIndex = String(params.rowIndex);
		element.dataset.blueprintColumnIndex = String(params.columnIndex);
		element.addEventListener('click', handleCellSurfaceClick);
		renderInlineNodes(element, params.nodes);

		return {
			update(nextParams: CellSurfaceParams) {
				element.dataset.blueprintSpreadsheetCellKey = cellKey(
					nextParams.rowIndex,
					nextParams.columnIndex
				);
				element.dataset.blueprintRowIndex = String(nextParams.rowIndex);
				element.dataset.blueprintColumnIndex = String(nextParams.columnIndex);

				const currentNodes = serializeInlineNodes(element);

				if (
					document.activeElement !== element &&
					!areInlineNodesEqual(currentNodes, nextParams.nodes)
				) {
					renderInlineNodes(element, nextParams.nodes);
				}
			},
			destroy() {
				element.removeEventListener('click', handleCellSurfaceClick);
			}
		};
	}

	function normalizedAttachmentWithCells(
		updates: Array<CellContext & { content: readonly BlueprintInlineNode[] }>
	) {
		const updateByKey = new Map(
			updates.map((update) => [cellKey(update.rowIndex, update.columnIndex), update.content])
		);
		const nextAttachment = {
			...attachment,
			cells: Array.from({ length: BLUEPRINT_SPREADSHEET_ROW_COUNT }, (_, rowIndex) =>
				Array.from({ length: BLUEPRINT_SPREADSHEET_COLUMN_COUNT }, (_, columnIndex) => {
					const update = updateByKey.get(cellKey(rowIndex, columnIndex));

					return update
						? normalizeInlineNodes(update)
						: cloneBlueprintInlineNodes(attachment.cells[rowIndex]?.[columnIndex] ?? []);
				})
			)
		};

		return normalizeBlueprintSpreadsheetAttachment(nextAttachment) ?? nextAttachment;
	}

	function updateCell(rowIndex: number, columnIndex: number, content: readonly BlueprintInlineNode[]) {
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

	function updateCells(updates: Array<CellContext & { content: readonly BlueprintInlineNode[] }>) {
		if (disabled) {
			return;
		}

		onAttachmentChange(normalizedAttachmentWithCells(updates));
	}

	function getCellContext(element: HTMLElement): CellContext | null {
		const rowIndex = Number.parseInt(element.dataset.blueprintRowIndex ?? '', 10);
		const columnIndex = Number.parseInt(element.dataset.blueprintColumnIndex ?? '', 10);

		if (!Number.isInteger(rowIndex) || !Number.isInteger(columnIndex)) {
			return null;
		}

		return { rowIndex, columnIndex };
	}

	function findCellSurface(identity: CellContext) {
		return (
			spreadsheetRoot?.querySelector<HTMLElement>(
				`[data-blueprint-spreadsheet-cell-key="${cellKey(identity.rowIndex, identity.columnIndex)}"]`
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

	function handleCellSurfaceClick(event: MouseEvent) {
		const target = event.target;

		if (target instanceof Element && target.closest('[data-blueprint-spreadsheet-variable-id]')) {
			return;
		}

		clearSelectedVariable();
	}

	function handleDocumentPointerDown(event: PointerEvent) {
		if (!selectedVariable) {
			return;
		}

		const target = event.target;

		if (target instanceof Element && target.closest('[data-blueprint-spreadsheet-variable-id]')) {
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
		const surface = element?.closest('[data-blueprint-spreadsheet-cell-key]');

		return surface instanceof HTMLElement && spreadsheetRoot?.contains(surface) ? surface : null;
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

	function insertVariableIntoSurface(surface: HTMLElement, fieldId: string, range: Range | null) {
		const context = getCellContext(surface);

		if (!context) {
			return;
		}

		clearSelectedVariable();
		const nextNodes = insertVariableInSurface(
			surface,
			fieldId,
			range,
			CELL_SURFACE_OPTIONS
		);
		updateCell(context.rowIndex, context.columnIndex, nextNodes);
		renderInlineNodes(surface, nextNodes);
		focusCellEnd(surface);
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
			(dataTransferHasType(event, BLUEPRINT_VARIABLE_DRAG_MIME) ||
				dataTransferHasType(event, BLUEPRINT_SPREADSHEET_SURFACE_VARIABLE_DRAG_MIME))
		);
	}

	function hasSurfaceVariableDragPayload(event: DragEvent) {
		return (
			!disabled &&
			dataTransferHasType(event, BLUEPRINT_SPREADSHEET_SURFACE_VARIABLE_DRAG_MIME)
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
		const spreadsheetPayloadValue = event.dataTransfer?.getData(BLUEPRINT_SPREADSHEET_SURFACE_VARIABLE_DRAG_MIME);
		const palettePayloadValue = event.dataTransfer?.getData(BLUEPRINT_VARIABLE_DRAG_MIME);

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

		const palettePayload = decodeBlueprintVariableDragPayload(palettePayloadValue);
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
			focusCell(Math.min(rowIndex + 1, BLUEPRINT_SPREADSHEET_ROW_COUNT - 1), columnIndex);
			return;
		}

		if (event.key === 'Tab') {
			event.preventDefault();
			const direction = event.shiftKey ? -1 : 1;
			const nextFlatIndex =
				rowIndex * BLUEPRINT_SPREADSHEET_COLUMN_COUNT + columnIndex + direction;
			const maxFlatIndex =
				BLUEPRINT_SPREADSHEET_ROW_COUNT * BLUEPRINT_SPREADSHEET_COLUMN_COUNT - 1;
			const clampedFlatIndex = Math.max(0, Math.min(maxFlatIndex, nextFlatIndex));

			focusCell(
				Math.floor(clampedFlatIndex / BLUEPRINT_SPREADSHEET_COLUMN_COUNT),
				clampedFlatIndex % BLUEPRINT_SPREADSHEET_COLUMN_COUNT
			);
		}
	}
</script>

<svelte:document onpointerdown={handleDocumentPointerDown} />
<svelte:window
	ondragend={() => {
		activeVariableDrag = null;
	}}
/>

<div
	bind:this={spreadsheetRoot}
	class="blueprint-spreadsheet-editor flex min-h-full w-full flex-col overflow-hidden bg-white"
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
				{#each BLUEPRINT_SPREADSHEET_COLUMN_LABELS as column (column)}
					<col style={`width: ${spreadsheetDataColumnWidth}px;`} />
				{/each}
			</colgroup>
			<thead>
				<tr>
					<th
						class="sticky top-0 left-0 z-20 h-8 border-r border-b border-stone-200 bg-stone-100"
						aria-label="Rows"
					></th>
					{#each BLUEPRINT_SPREADSHEET_COLUMN_LABELS as column (column)}
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
						{#each BLUEPRINT_SPREADSHEET_COLUMN_LABELS as column, cellIndex (column)}
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
									class="blueprint-spreadsheet-cell-surface block h-full min-h-7 w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap outline-none"
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
	.blueprint-spreadsheet-cell-surface {
		box-sizing: border-box;
		padding-top: 0.375rem;
		padding-bottom: 0.375rem;
		line-height: 1rem;
	}

	.blueprint-spreadsheet-cell-surface[contenteditable='false'] {
		cursor: default;
		opacity: 0.6;
	}

	.blueprint-spreadsheet-editor :global(.blueprint-variable-pill) {
		user-select: none;
		gap: 0.25rem;
		transition:
			background-color 150ms ease,
			border-color 150ms ease;
		vertical-align: baseline;
	}

	.blueprint-spreadsheet-cell-surface:not([contenteditable='false'])
		:global(.blueprint-variable-pill) {
		cursor: grab;
	}

	.blueprint-spreadsheet-cell-surface:not([contenteditable='false'])
		:global(.blueprint-variable-pill:hover) {
		background: rgb(209 250 229 / 0.8);
	}

	.blueprint-spreadsheet-cell-surface:not([contenteditable='false'])
		:global(.blueprint-variable-pill:active) {
		cursor: grabbing;
	}

	.blueprint-spreadsheet-editor :global(.blueprint-variable-pill--selected) {
		border-color: transparent;
		background: rgb(209 250 229);
	}

	.blueprint-spreadsheet-editor :global(.blueprint-variable-pill__label) {
		line-height: 1;
	}

	.blueprint-spreadsheet-editor :global(.blueprint-variable-pill__remove) {
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

	.blueprint-spreadsheet-editor :global(.blueprint-variable-pill__remove:hover) {
		background: rgb(209 250 229 / 0.75);
	}

	.blueprint-spreadsheet-cell-surface:focus :global(.blueprint-variable-pill) {
		border-color: transparent;
	}
</style>
