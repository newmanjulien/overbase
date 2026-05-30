import type { BlueprintInlineNode } from '../../../../blueprints/model';
import {
	insertVariable,
	joinSegments,
	removeChild,
	type BlueprintInlineSurfaceOptions
} from './blueprint-inline-surface';

export type BlueprintInlineVariableIdentity<Context extends object> = Context & {
	nodeIndex: number;
};

export type BlueprintInlineVariableDragPayload<Context extends object> =
	BlueprintInlineVariableIdentity<Context> & {
		fieldId: string;
	};

export type BlueprintActiveVariableDrag<Context extends object> =
	BlueprintInlineVariableDragPayload<Context> & {
		sourcePill: HTMLElement;
		sourceSurface: HTMLElement;
	};

export type BlueprintVariableDropTarget = {
	surface: HTMLElement;
	range: Range | null;
};

export function createBlueprintInlineVariableDragMime(scope: string) {
	return `application/x-overbase-blueprint-${scope}-variable`;
}

export function encodeBlueprintInlineVariableDragPayload<Context extends object>(
	payload: BlueprintInlineVariableDragPayload<Context>
) {
	return JSON.stringify(payload);
}

export function decodeBlueprintInlineVariableDragPayload<Context extends object>(
	value: string,
	parseContext: (payload: Partial<BlueprintInlineVariableDragPayload<Context>>) => Context | null
): BlueprintInlineVariableDragPayload<Context> | null {
	try {
		const payload = JSON.parse(value) as Partial<BlueprintInlineVariableDragPayload<Context>>;

		if (
			typeof payload.fieldId !== 'string' ||
			typeof payload.nodeIndex !== 'number' ||
			!Number.isInteger(payload.nodeIndex) ||
			payload.nodeIndex < 0
		) {
			return null;
		}

		const context = parseContext(payload);

		if (!context) {
			return null;
		}

		return {
			...context,
			fieldId: payload.fieldId,
			nodeIndex: payload.nodeIndex
		};
	} catch {
		return null;
	}
}

export function dataTransferHasType(event: DragEvent, mime: string) {
	return event.dataTransfer !== null && Array.from(event.dataTransfer.types).includes(mime);
}

export function isSameVariableIdentity<Context extends object>(
	left: BlueprintInlineVariableIdentity<Context> | null,
	right: BlueprintInlineVariableIdentity<Context>,
	keys: readonly (keyof Context)[]
) {
	return (
		left !== null &&
		left.nodeIndex === right.nodeIndex &&
		keys.every((key) => left[key] === right[key])
	);
}

export function deleteVariableFromSurface(
	surface: HTMLElement,
	nodeIndex: number,
	options: BlueprintInlineSurfaceOptions,
	serialize: (surface: HTMLElement) => BlueprintInlineNode[]
) {
	const nodes = serialize(surface);

	if (nodes[nodeIndex]?.type !== 'variable') {
		return {
			didDelete: false,
			nodes
		};
	}

	return {
		didDelete: true,
		nodes: joinSegments(nodes.slice(0, nodeIndex), [], nodes.slice(nodeIndex + 1), options)
	};
}

export function insertVariableInSurface(
	surface: HTMLElement,
	fieldId: string,
	range: Range | null,
	options: BlueprintInlineSurfaceOptions,
	sourcePill: HTMLElement | null = null
) {
	return insertVariable(surface, fieldId, range, options, sourcePill);
}

export function moveVariableBetweenSurfaces<Context extends object>({
	activeDrag,
	payload,
	target,
	root,
	sameContext,
	getContext,
	options,
	updateOne,
	updateMany,
	render,
	focus
}: {
	activeDrag: BlueprintActiveVariableDrag<Context> | null;
	payload: BlueprintInlineVariableDragPayload<Context>;
	target: BlueprintVariableDropTarget | null;
	root: HTMLElement | null;
	sameContext: (left: Context, right: Context) => boolean;
	getContext: (surface: HTMLElement) => Context | null;
	options: BlueprintInlineSurfaceOptions;
	updateOne: (context: Context, nodes: BlueprintInlineNode[]) => void;
	updateMany: (updates: Array<Context & { content: BlueprintInlineNode[] }>) => void;
	render: (surface: HTMLElement, nodes: readonly BlueprintInlineNode[]) => void;
	focus: (surface: HTMLElement) => void;
}) {
	if (!activeDrag || activeDrag.fieldId !== payload.fieldId || !target) {
		return false;
	}

	const sourceSurface = activeDrag.sourceSurface;
	const sourcePill = activeDrag.sourcePill;
	const sourceContext = getContext(sourceSurface);
	const targetContext = getContext(target.surface);

	if (
		!sourceContext ||
		!targetContext ||
		!root?.contains(sourceSurface) ||
		!root.contains(target.surface) ||
		sourcePill.parentElement !== sourceSurface
	) {
		return false;
	}

	if (sameContext(sourceContext, targetContext)) {
		const nextNodes = insertVariableInSurface(
			target.surface,
			payload.fieldId,
			target.range,
			options,
			sourcePill
		);

		updateOne(targetContext, nextNodes);
		render(target.surface, nextNodes);
		focus(target.surface);
		return true;
	}

	const sourceNodes = removeChild(sourceSurface, sourcePill, options);
	const targetNodes = insertVariableInSurface(
		target.surface,
		payload.fieldId,
		target.range,
		options,
		null
	);

	updateMany([
		{
			...sourceContext,
			content: sourceNodes
		},
		{
			...targetContext,
			content: targetNodes
		}
	]);
	render(sourceSurface, sourceNodes);
	render(target.surface, targetNodes);
	focus(target.surface);
	return true;
}
