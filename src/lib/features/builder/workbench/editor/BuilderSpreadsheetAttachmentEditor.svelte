<script lang="ts">
	import ArrowLeftIcon from 'phosphor-svelte/lib/ArrowLeftIcon';
	import { IconButton } from '$lib/ui';
	import {
		BUILDER_SPREADSHEET_COLUMN_COUNT,
		BUILDER_SPREADSHEET_COLUMN_LABELS,
		BUILDER_SPREADSHEET_ROW_COUNT,
		normalizeBuilderSpreadsheetAttachment,
		normalizeBuilderSpreadsheetCell,
		type BuilderInlineNode,
		type BuilderSpreadsheetAttachment,
		type BuilderVariableDefinition
	} from '$lib/features/builder/domain';
	import {
		cloneBuilderInlineNodes,
		getDocumentRangeFromPoint,
		normalizeDropRange,
		type BuilderInlineSurfaceOptions
	} from '../inline/builder-inline-surface';
	import {
		BuilderInlineController,
		type BuilderVariableDropTarget as BuilderInlineVariableDropTarget
	} from '../inline/builder-inline-controller.svelte';
	import type { BuilderVariableInsertionRequest } from '../state/builder-workbench-state.svelte';
	import type { BuilderVariableDragCoordinator } from '../variables/builder-variable-drag-coordinator.svelte';
	import { cellKey, getSpreadsheetCell, updateSparseSpreadsheetCell } from '$shared/spreadsheets';

	type CellSurfaceParams = {
		rowIndex: number;
		columnIndex: number;
		nodes: readonly BuilderInlineNode[];
	};

	type CellContext = {
		rowIndex: number;
		columnIndex: number;
	};

	type Props = {
		attachment: BuilderSpreadsheetAttachment;
		variables: readonly BuilderVariableDefinition[];
		disabled?: boolean;
		dragCoordinator: BuilderVariableDragCoordinator;
		variableInsertionRequest?: BuilderVariableInsertionRequest | null;
		onVariableInsertionRequestHandled?: (requestId: number) => void;
		onClose: () => void;
		onAttachmentChange: (attachment: BuilderSpreadsheetAttachment) => void;
	};

	const CELL_SURFACE_OPTIONS = {
		variableDatasetKey: 'builderSpreadsheetVariableId',
		joinMode: 'cell',
		normalize: normalizeBuilderSpreadsheetCell
	} satisfies BuilderInlineSurfaceOptions;

	let {
		attachment,
		variables,
		disabled = false,
		dragCoordinator,
		variableInsertionRequest = null,
		onVariableInsertionRequestHandled,
		onClose,
		onAttachmentChange
	}: Props = $props();
	let spreadsheetRoot = $state<HTMLDivElement | null>(null);

	const rowIndexes = Array.from({ length: BUILDER_SPREADSHEET_ROW_COUNT }, (_, index) => index);
	const rowHeaderColumnWidth = 40;
	const spreadsheetDataColumnWidth = 216;
	const spreadsheetTableWidth =
		rowHeaderColumnWidth + BUILDER_SPREADSHEET_COLUMN_LABELS.length * spreadsheetDataColumnWidth;

	const controller = new BuilderInlineController<CellContext>({
		scope: 'spreadsheet',
		dragCoordinator: () => dragCoordinator,
		root: () => spreadsheetRoot,
		variables: () => variables,
		disabled: () => disabled,
		options: CELL_SURFACE_OPTIONS,
		contextKey: (context) => cellKey(context.rowIndex, context.columnIndex),
		sameContext: isSameCell,
		contextFromSurface: getCellContext,
		surfaceForContext: findCellSurface,
		updateOne: (context, nodes) => updateCell(context.rowIndex, context.columnIndex, nodes),
		updateMany: updateCells,
		fallbackInsertionSurface: getFirstCellSurface
	});

	$effect(() => {
		return dragCoordinator.registerRegion({
			id: 'spreadsheet',
			resolveDrop: (drag, point) => {
				if (drag.type === 'inline' && drag.regionId !== 'spreadsheet') {
					return null;
				}

				const target = resolveDropTarget(point.x, point.y);

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

		if (
			disabled ||
			getSpreadsheetCell(attachment.cellsByKey, selected.rowIndex, selected.columnIndex)?.[
				selected.nodeIndex
			]?.type !== 'variable'
		) {
			controller.clearSelection();
		}
	});

	$effect(() => {
		const request = variableInsertionRequest;

		if (request && controller.handleVariableInsertionRequest(request)) {
			onVariableInsertionRequestHandled?.(request.id);
		}
	});

	function isSameCell(left: CellContext, right: CellContext) {
		return left.rowIndex === right.rowIndex && left.columnIndex === right.columnIndex;
	}

	function normalizeInlineNodes(nodes: readonly BuilderInlineNode[]) {
		return normalizeBuilderSpreadsheetCell(nodes);
	}

	function cellSurface(element: HTMLElement, params: CellSurfaceParams) {
		element.dataset.builderSpreadsheetCellKey = cellKey(params.rowIndex, params.columnIndex);
		element.dataset.builderSpreadsheetRowIndex = String(params.rowIndex);
		element.dataset.builderSpreadsheetColumnIndex = String(params.columnIndex);

		const action = controller.surfaceAction(element, {
			context: {
				rowIndex: params.rowIndex,
				columnIndex: params.columnIndex
			},
			nodes: params.nodes
		});

		return {
			update(nextParams: CellSurfaceParams) {
				element.dataset.builderSpreadsheetCellKey = cellKey(
					nextParams.rowIndex,
					nextParams.columnIndex
				);
				element.dataset.builderSpreadsheetRowIndex = String(nextParams.rowIndex);
				element.dataset.builderSpreadsheetColumnIndex = String(nextParams.columnIndex);
				action.update({
					context: {
						rowIndex: nextParams.rowIndex,
						columnIndex: nextParams.columnIndex
					},
					nodes: nextParams.nodes
				});
			},
			destroy: action.destroy
		};
	}

	function normalizedAttachmentWithCells(
		updates: Array<CellContext & { content: readonly BuilderInlineNode[] }>
	) {
		let cellsByKey = Object.fromEntries(
			Object.entries(attachment.cellsByKey).map(([key, cell]) => [
				key,
				cloneBuilderInlineNodes(cell)
			])
		) as BuilderSpreadsheetAttachment['cellsByKey'];

		for (const update of updates) {
			const normalizedContent = normalizeInlineNodes(update.content);

			cellsByKey = updateSparseSpreadsheetCell<readonly BuilderInlineNode[]>(
				cellsByKey,
				update.rowIndex,
				update.columnIndex,
				normalizedContent,
				(cell) => cell.length === 0
			);
		}

		const nextAttachment = {
			...attachment,
			cellsByKey
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

	function updateCells(updates: Array<CellContext & { content: BuilderInlineNode[] }>) {
		if (disabled) {
			return;
		}

		onAttachmentChange(normalizedAttachmentWithCells(updates));
	}

	function getCellContext(element: HTMLElement): CellContext | null {
		const rowIndex = Number.parseInt(element.dataset.builderSpreadsheetRowIndex ?? '', 10);
		const columnIndex = Number.parseInt(element.dataset.builderSpreadsheetColumnIndex ?? '', 10);

		if (!Number.isInteger(rowIndex) || !Number.isInteger(columnIndex)) {
			return null;
		}

		return { rowIndex, columnIndex };
	}

	function getCellSurfaces() {
		return Array.from(
			spreadsheetRoot?.querySelectorAll<HTMLElement>('[data-builder-spreadsheet-cell-key]') ?? []
		);
	}

	function findCellSurface(context: CellContext) {
		return (
			getCellSurfaces().find(
				(surface) =>
					surface.dataset.builderSpreadsheetCellKey ===
					cellKey(context.rowIndex, context.columnIndex)
			) ?? null
		);
	}

	function closestCellSurface(node: Node | null) {
		const element = node instanceof Element ? node : node?.parentElement;
		const surface = element?.closest('[data-builder-spreadsheet-cell-key]');

		return surface instanceof HTMLElement && spreadsheetRoot?.contains(surface) ? surface : null;
	}

	function getFirstCellSurface() {
		return getCellSurfaces()[0] ?? null;
	}

	function getCellSurfaceUnderPointer(clientX: number, clientY: number) {
		return closestCellSurface(
			spreadsheetRoot?.ownerDocument.elementFromPoint(clientX, clientY) ?? null
		);
	}

	function resolveDropTarget(
		clientX: number,
		clientY: number
	): BuilderInlineVariableDropTarget | null {
		if (disabled) {
			return null;
		}

		const surface = getCellSurfaceUnderPointer(clientX, clientY);

		if (!surface || !surface.isContentEditable) {
			return null;
		}

		const range = getDocumentRangeFromPoint(spreadsheetRoot?.ownerDocument, clientX, clientY);
		const rangeSurface = range ? closestCellSurface(range.commonAncestorContainer) : null;

		return {
			surface,
			range:
				rangeSurface === surface
					? normalizeDropRange(surface, range, clientX, CELL_SURFACE_OPTIONS)
					: null
		};
	}

	function focusCell(rowIndex: number, columnIndex: number) {
		findCellSurface({ rowIndex, columnIndex })?.focus();
	}

	function handleCellKeydown(event: KeyboardEvent, rowIndex: number, columnIndex: number) {
		if (event.key === 'Escape') {
			controller.handleEscape();
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
	onpointerdown={controller.handleDocumentPointerDown}
	onselectionchange={controller.handleDocumentSelectionChange}
/>
<div
	bind:this={spreadsheetRoot}
	class="builder-spreadsheet-editor relative flex min-h-full w-full flex-col overflow-hidden bg-white"
	role="group"
	aria-label="Spreadsheet attachment"
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
										nodes: getSpreadsheetCell(attachment.cellsByKey, rowIndex, cellIndex) ?? []
									}}
									contenteditable={!disabled}
									role="textbox"
									tabindex={disabled ? -1 : 0}
									aria-label={`Row ${rowIndex + 1}, column ${cellIndex + 1}`}
									class="builder-spreadsheet-cell-surface flex h-8 w-full min-w-0 items-center overflow-hidden text-ellipsis whitespace-nowrap outline-none"
									class:font-medium={rowIndex === 0}
									class:text-stone-900={rowIndex === 0}
									class:text-stone-800={rowIndex !== 0}
									oninput={controller.handleInput}
									onpaste={controller.handlePaste}
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
