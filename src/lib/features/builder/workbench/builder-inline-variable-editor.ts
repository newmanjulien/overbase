import type { BuilderInlineNode } from '../../../../builders/model';
import {
	insertVariable,
	joinSegments,
	removeChild,
	type BuilderInlineSurfaceOptions
} from './builder-inline-surface';

export type BuilderInlineVariableIdentity<Context extends object> = Context & {
	nodeIndex: number;
};

export type BuilderInlineVariableDragPayload<Context extends object> =
	BuilderInlineVariableIdentity<Context> & {
		fieldId: string;
	};

export type BuilderActiveVariableDrag<Context extends object> =
	BuilderInlineVariableDragPayload<Context> & {
		sourcePill: HTMLElement;
		sourceSurface: HTMLElement;
	};

export type BuilderVariableDropTarget = {
	surface: HTMLElement;
	range: Range | null;
};

export function createBuilderInlineVariableDragMime(scope: string) {
	return `application/x-overbase-builder-${scope}-variable`;
}

export function encodeBuilderInlineVariableDragPayload<Context extends object>(
	payload: BuilderInlineVariableDragPayload<Context>
) {
	return JSON.stringify(payload);
}

export function decodeBuilderInlineVariableDragPayload<Context extends object>(
	value: string,
	parseContext: (payload: Partial<BuilderInlineVariableDragPayload<Context>>) => Context | null
): BuilderInlineVariableDragPayload<Context> | null {
	try {
		const payload = JSON.parse(value) as Partial<BuilderInlineVariableDragPayload<Context>>;

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
	left: BuilderInlineVariableIdentity<Context> | null,
	right: BuilderInlineVariableIdentity<Context>,
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
	options: BuilderInlineSurfaceOptions,
	serialize: (surface: HTMLElement) => BuilderInlineNode[]
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
	options: BuilderInlineSurfaceOptions,
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
	activeDrag: BuilderActiveVariableDrag<Context> | null;
	payload: BuilderInlineVariableDragPayload<Context>;
	target: BuilderVariableDropTarget | null;
	root: HTMLElement | null;
	sameContext: (left: Context, right: Context) => boolean;
	getContext: (surface: HTMLElement) => Context | null;
	options: BuilderInlineSurfaceOptions;
	updateOne: (context: Context, nodes: BuilderInlineNode[]) => void;
	updateMany: (updates: Array<Context & { content: BuilderInlineNode[] }>) => void;
	render: (surface: HTMLElement, nodes: readonly BuilderInlineNode[]) => void;
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
		const insertResult = insertVariableInSurface(
			target.surface,
			payload.fieldId,
			target.range,
			options,
			sourcePill
		);

		updateOne(targetContext, insertResult.nodes);
		render(target.surface, insertResult.nodes);
		focus(target.surface);
		return true;
	}

	const sourceNodes = removeChild(sourceSurface, sourcePill, options);
	const targetInsertResult = insertVariableInSurface(
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
			content: targetInsertResult.nodes
		}
	]);
	render(sourceSurface, sourceNodes);
	render(target.surface, targetInsertResult.nodes);
	focus(target.surface);
	return true;
}
