export type BlueprintTextNode = {
	type: 'text';
	text: string;
};

export type BlueprintVariableNode = {
	type: 'variable';
	fieldId: string;
};

export type BlueprintInlineNode = BlueprintTextNode | BlueprintVariableNode;

export function blueprintText(textValue: string): BlueprintTextNode {
	return {
		type: 'text',
		text: textValue
	};
}

export function blueprintVariable(fieldId: string): BlueprintVariableNode {
	return {
		type: 'variable',
		fieldId
	};
}

export function formatBlueprintVariableToken(fieldId: string) {
	return `{${fieldId}}`;
}

export function cloneBlueprintInline(nodes: readonly BlueprintInlineNode[]): BlueprintInlineNode[] {
	return nodes.map((node) =>
		node.type === 'text'
			? {
					type: 'text',
					text: node.text
				}
			: {
					type: 'variable',
					fieldId: node.fieldId
				}
	);
}

export function normalizeBlueprintInline(nodes: readonly BlueprintInlineNode[]) {
	const normalized: BlueprintInlineNode[] = [];

	for (const node of nodes) {
		const previous = normalized.at(-1);

		if (node.type === 'text') {
			if (node.text.length === 0) {
				continue;
			}

			if (previous?.type === 'text') {
				previous.text += node.text;
			} else {
				normalized.push({
					type: 'text',
					text: node.text
				});
			}
		} else if (node.fieldId.trim()) {
			normalized.push({
				type: 'variable',
				fieldId: node.fieldId.trim()
			});
		}
	}

	return normalized;
}

export function stringifyBlueprintInline(nodes: readonly BlueprintInlineNode[]) {
	return nodes
		.map((node) => (node.type === 'text' ? node.text : formatBlueprintVariableToken(node.fieldId)))
		.join('');
}

export function areBlueprintInlineNodesEqual(
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

		return leftNode.type === 'text'
			? rightNode.type === 'text' && leftNode.text === rightNode.text
			: rightNode.type === 'variable' && leftNode.fieldId === rightNode.fieldId;
	});
}

export function hasMeaningfulBlueprintInlineContent(nodes: readonly BlueprintInlineNode[]) {
	return nodes.some((node) => node.type === 'variable' || node.text.trim().length > 0);
}
