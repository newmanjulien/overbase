import type { BlueprintInlineNode } from '../../../../blueprints/model';

export type BlueprintInlineSurfaceOptions = {
	variableDatasetKey: string;
	normalize?: (nodes: readonly BlueprintInlineNode[]) => BlueprintInlineNode[];
	joinMode: 'body' | 'cell';
};

export type BlueprintVariablePillOptions<Source> = {
	fieldId: string;
	label: string;
	source: Source;
	selected: boolean;
	disabled: boolean;
	variableDatasetKey: string;
	onSelect: (source: Source) => void;
	onRemove: (source: Source) => void;
	onDragStart: (event: DragEvent, fieldId: string, source: Source, pill: HTMLElement) => void;
	onDragEnd: () => void;
};

const TIGHT_FOLLOWING_PUNCTUATION = new Set(['.', ',', ':']);

function normalizeInlineNodes(
	nodes: readonly BlueprintInlineNode[],
	options: BlueprintInlineSurfaceOptions
) {
	return (options.normalize ?? normalizeSurfaceNodes)(nodes);
}

export function cloneBlueprintInlineNodes(nodes: readonly BlueprintInlineNode[]) {
	return nodes.map((node) => ({ ...node }));
}

export function normalizeSurfaceNodes(nodes: readonly BlueprintInlineNode[]) {
	const normalized: BlueprintInlineNode[] = [];

	for (const node of nodes) {
		const previous = normalized.at(-1);

		if (node.type === 'text' && previous?.type === 'text') {
			previous.text += node.text;
		} else if (node.type !== 'text' || node.text.length > 0) {
			normalized.push({ ...node });
		}
	}

	return normalized;
}

export function areInlineNodesEqual(
	left: readonly BlueprintInlineNode[],
	right: readonly BlueprintInlineNode[]
) {
	if (left.length !== right.length) {
		return false;
	}

	return left.every((leftNode, index) => {
		const rightNode = right[index];

		if (leftNode.type !== rightNode.type) {
			return false;
		}

		if (leftNode.type === 'text') {
			return rightNode.type === 'text' && leftNode.text === rightNode.text;
		}

		return rightNode.type === 'variable' && leftNode.fieldId === rightNode.fieldId;
	});
}

export function createVariablePill<Source>({
	fieldId,
	label,
	source,
	selected,
	disabled,
	variableDatasetKey,
	onSelect,
	onRemove,
	onDragStart,
	onDragEnd
}: BlueprintVariablePillOptions<Source>) {
	const pill = document.createElement('span');

	pill.dataset[variableDatasetKey] = fieldId;
	pill.contentEditable = 'false';
	pill.draggable = !disabled;
	pill.className =
		'blueprint-variable-pill inline-flex items-center rounded-full border border-transparent bg-emerald-50/80 px-1.5 py-[0.125rem] align-baseline text-[0.73rem] font-normal leading-none text-emerald-900' +
		(selected ? ' blueprint-variable-pill--selected' : '');
	renderVariablePillContents(pill, label, selected, () => onRemove(source));

	if (!disabled) {
		pill.addEventListener('click', (event) => {
			event.preventDefault();
			event.stopPropagation();
			onSelect(source);
		});
		pill.addEventListener('dragstart', (event) => onDragStart(event, fieldId, source, pill));
		pill.addEventListener('dragend', onDragEnd);
	}

	return pill;
}

export function renderVariablePillContents(
	pill: HTMLElement,
	label: string,
	selected: boolean,
	onRemove: () => void
) {
	if (!selected) {
		pill.textContent = label;
		return;
	}

	const labelElement = document.createElement('span');
	labelElement.className = 'blueprint-variable-pill__label';
	labelElement.textContent = label;

	const removeButton = document.createElement('button');
	removeButton.type = 'button';
	removeButton.className = 'blueprint-variable-pill__remove';
	removeButton.setAttribute('aria-label', 'Remove variable');
	removeButton.textContent = '×';
	removeButton.addEventListener('mousedown', (event) => {
		event.preventDefault();
	});
	removeButton.addEventListener('click', (event) => {
		event.preventDefault();
		event.stopPropagation();
		onRemove();
	});

	pill.replaceChildren(labelElement, removeButton);
}

export function renderSurface<Source>(
	element: HTMLElement,
	nodes: readonly BlueprintInlineNode[],
	createSource: (nodeIndex: number) => Source,
	createPill: (fieldId: string, source: Source) => HTMLElement
) {
	element.replaceChildren();

	nodes.forEach((node, nodeIndex) => {
		if (node.type === 'text') {
			element.append(document.createTextNode(node.text));
			return;
		}

		element.append(createPill(node.fieldId, createSource(nodeIndex)));
	});

	if (element.childNodes.length === 0) {
		element.append(document.createElement('br'));
	}
}

export function serializeSurface(
	parent: Node,
	options: BlueprintInlineSurfaceOptions
): BlueprintInlineNode[] {
	const nodes: BlueprintInlineNode[] = [];

	parent.childNodes.forEach((child) => {
		nodes.push(...serializeChild(child, options));
	});

	return normalizeInlineNodes(nodes, options);
}

export function serializeChild(
	child: ChildNode,
	options: BlueprintInlineSurfaceOptions
): BlueprintInlineNode[] {
	if (child.nodeType === Node.TEXT_NODE) {
		return [{ type: 'text', text: child.textContent ?? '' }];
	}

	if (!(child instanceof HTMLElement) || child.tagName === 'BR') {
		return [];
	}

	const fieldId = child.dataset[options.variableDatasetKey];

	if (fieldId) {
		return [{ type: 'variable', fieldId }];
	}

	return serializeSurface(child, options);
}

export function joinSegments(
	beforeNodes: readonly BlueprintInlineNode[],
	middleNodes: readonly BlueprintInlineNode[],
	afterNodes: readonly BlueprintInlineNode[],
	options: BlueprintInlineSurfaceOptions
) {
	const before = normalizeInlineNodes(cloneBlueprintInlineNodes(beforeNodes), options);
	const middle = normalizeInlineNodes(cloneBlueprintInlineNodes(middleNodes), options);
	const after = normalizeInlineNodes(cloneBlueprintInlineNodes(afterNodes), options);
	const joined: BlueprintInlineNode[] = [];

	function appendPart(part: BlueprintInlineNode[]) {
		if (part.length === 0) {
			return;
		}

		trimTrailingHorizontalSpace(joined);
		trimLeadingHorizontalSpace(part);

		if (
			hasMeaningfulInlineContent(joined, options) &&
			hasMeaningfulInlineContent(part, options) &&
			!startsWithTightFollowingPunctuation(part) &&
			(options.joinMode === 'cell' || !boundaryTouchesLineBreak(joined, part))
		) {
			joined.push({ type: 'text', text: ' ' });
		}

		joined.push(...part);
	}

	joined.push(...before);
	appendPart(middle);
	appendPart(after);

	return normalizeInlineNodes(joined, options);
}

export function removeChild(
	surface: HTMLElement,
	removedChild: ChildNode,
	options: BlueprintInlineSurfaceOptions
) {
	const beforeNodes: BlueprintInlineNode[] = [];
	const afterNodes: BlueprintInlineNode[] = [];
	let didRemoveChild = false;

	for (const child of surface.childNodes) {
		if (child === removedChild) {
			didRemoveChild = true;
			continue;
		}

		const targetNodes = didRemoveChild ? afterNodes : beforeNodes;
		targetNodes.push(...serializeChild(child, options));
	}

	if (!didRemoveChild) {
		return normalizeInlineNodes(beforeNodes, options);
	}

	return joinSegments(beforeNodes, [], afterNodes, options);
}

export function removeOptionalChild(
	surface: HTMLElement,
	removedChild: ChildNode | null,
	options: BlueprintInlineSurfaceOptions
) {
	return removedChild
		? removeChild(surface, removedChild, options)
		: serializeSurface(surface, options);
}

export function splitAtRange(
	surface: HTMLElement,
	range: Range,
	omittedChild: ChildNode | null,
	options: BlueprintInlineSurfaceOptions
) {
	const beforeNodes: BlueprintInlineNode[] = [];
	const afterNodes: BlueprintInlineNode[] = [];
	const children = Array.from(surface.childNodes);
	let inserted = false;

	if (range.startContainer === surface) {
		children.forEach((child, index) => {
			if (!inserted && index === range.startOffset) {
				inserted = true;
			}

			if (child === omittedChild) {
				return;
			}

			const targetNodes = inserted ? afterNodes : beforeNodes;
			targetNodes.push(...serializeChild(child, options));
		});

		return { beforeNodes, afterNodes };
	}

	for (const child of children) {
		if (child === omittedChild) {
			continue;
		}

		if (!inserted && child === range.startContainer && child.nodeType === Node.TEXT_NODE) {
			const text = child.textContent ?? '';
			beforeNodes.push({ type: 'text', text: text.slice(0, range.startOffset) });
			afterNodes.push({ type: 'text', text: text.slice(range.startOffset) });
			inserted = true;
			continue;
		}

		const targetNodes = inserted ? afterNodes : beforeNodes;
		targetNodes.push(...serializeChild(child, options));
	}

	return { beforeNodes, afterNodes };
}

export function insertVariable(
	surface: HTMLElement,
	fieldId: string,
	range: Range | null,
	options: BlueprintInlineSurfaceOptions,
	sourcePill: HTMLElement | null = null
) {
	const variableNode: BlueprintInlineNode = { type: 'variable', fieldId };

	if (!range || !surface.contains(range.commonAncestorContainer)) {
		return joinSegments(
			removeOptionalChild(surface, sourcePill, options),
			[variableNode],
			[],
			options
		);
	}

	const sourceChildIndex =
		sourcePill && sourcePill.parentNode === surface ? childIndex(surface, sourcePill) : -1;

	if (
		range.startContainer === surface &&
		sourceChildIndex >= 0 &&
		(range.startOffset === sourceChildIndex || range.startOffset === sourceChildIndex + 1)
	) {
		return serializeSurface(surface, options);
	}

	const { beforeNodes, afterNodes } = splitAtRange(
		surface,
		range,
		sourcePill,
		options
	);

	return joinSegments(beforeNodes, [variableNode], afterNodes, options);
}

export function insertPlainText(
	surface: HTMLElement,
	text: string,
	focusEnd: (surface: HTMLElement) => void,
	onChange: () => void
) {
	const selection = document.getSelection();
	const range = selection?.rangeCount ? selection.getRangeAt(0) : null;

	if (!range || !surface.contains(range.commonAncestorContainer)) {
		focusEnd(surface);
	}

	if (document.execCommand('insertText', false, text)) {
		onChange();
		return;
	}

	const activeSelection = document.getSelection();
	const activeRange = activeSelection?.rangeCount ? activeSelection.getRangeAt(0) : null;
	const textNode = document.createTextNode(text);

	if (activeRange && surface.contains(activeRange.commonAncestorContainer)) {
		activeRange.deleteContents();
		activeRange.insertNode(textNode);
		activeRange.setStartAfter(textNode);
		activeRange.collapse(true);
		activeSelection?.removeAllRanges();
		activeSelection?.addRange(activeRange);
	} else {
		surface.append(textNode);
	}

	onChange();
}

export function childIndex(parent: Node, child: Node) {
	return Array.prototype.indexOf.call(parent.childNodes, child);
}

export function selectRange(range: Range) {
	const doc =
		range.startContainer.nodeType === Node.DOCUMENT_NODE
			? (range.startContainer as Document)
			: range.startContainer.ownerDocument;

	if (!doc) {
		return;
	}

	const selection = doc.getSelection();

	selection?.removeAllRanges();
	selection?.addRange(range);
}

export function focusEnd(surface: HTMLElement) {
	surface.focus();

	const range = surface.ownerDocument.createRange();
	range.selectNodeContents(surface);
	range.collapse(false);
	selectRange(range);
}

export function createSurfaceRange(surface: HTMLElement, offset: number) {
	const range = surface.ownerDocument.createRange();
	const childCount = surface.childNodes.length;

	range.setStart(surface, Math.max(0, Math.min(offset, childCount)));
	range.collapse(true);

	return range;
}

export function closestVariablePill(
	surface: HTMLElement,
	node: Node,
	variableDatasetKey: string
) {
	let element: Node | null = node instanceof Element ? node : node.parentNode;

	while (element && surface.contains(element)) {
		if (element instanceof HTMLElement && element.dataset[variableDatasetKey]) {
			return element;
		}

		element = element.parentNode;
	}

	return null;
}

export function normalizeDropRange(
	surface: HTMLElement,
	range: Range | null,
	clientX: number,
	options: BlueprintInlineSurfaceOptions
) {
	if (!range || !surface.contains(range.commonAncestorContainer)) {
		return null;
	}

	const pill = closestVariablePill(surface, range.startContainer, options.variableDatasetKey);

	if (!pill || pill.parentNode !== surface) {
		const normalizedRange = range.cloneRange();
		normalizedRange.collapse(true);
		return normalizedRange;
	}

	const pillRect = pill.getBoundingClientRect();
	const pillOffset = childIndex(surface, pill);
	const offset = clientX > pillRect.left + pillRect.width / 2 ? pillOffset + 1 : pillOffset;

	return createSurfaceRange(surface, offset);
}

function hasMeaningfulInlineContent(
	nodes: readonly BlueprintInlineNode[],
	options: BlueprintInlineSurfaceOptions
) {
	return nodes.some((node) => {
		if (node.type === 'variable') {
			return true;
		}

		return options.joinMode === 'body'
			? node.text.replace(/[ \t]/g, '').length > 0
			: node.text.trim().length > 0;
	});
}

function trimTrailingHorizontalSpace(nodes: BlueprintInlineNode[]) {
	const last = nodes.at(-1);

	if (last?.type === 'text') {
		last.text = last.text.replace(/[ \t]+$/, '');
	}
}

function trimLeadingHorizontalSpace(nodes: BlueprintInlineNode[]) {
	const first = nodes[0];

	if (first?.type === 'text') {
		first.text = first.text.replace(/^[ \t]+/, '');
	}
}

function startsWithTightFollowingPunctuation(nodes: readonly BlueprintInlineNode[]) {
	const first = nodes[0];

	return first?.type === 'text' && TIGHT_FOLLOWING_PUNCTUATION.has(first.text[0] ?? '');
}

function boundaryTouchesLineBreak(
	left: readonly BlueprintInlineNode[],
	right: readonly BlueprintInlineNode[]
) {
	const lastLeft = left.at(-1);
	const firstRight = right[0];

	return (
		(lastLeft?.type === 'text' && /\n$/.test(lastLeft.text)) ||
		(firstRight?.type === 'text' && /^\n/.test(firstRight.text))
	);
}
