export type BuilderTextNode = {
	type: 'text';
	text: string;
};

export type BuilderVariableNode = {
	type: 'variable';
	fieldId: string;
};

export type BuilderInlineNode = BuilderTextNode | BuilderVariableNode;

export function builderText(textValue: string): BuilderTextNode {
	return {
		type: 'text',
		text: textValue
	};
}

export function builderVariable(fieldId: string): BuilderVariableNode {
	return {
		type: 'variable',
		fieldId
	};
}

export function formatBuilderVariableToken(fieldId: string) {
	return `{${fieldId}}`;
}

export function cloneBuilderInline(nodes: readonly BuilderInlineNode[]): BuilderInlineNode[] {
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

export function normalizeBuilderInline(nodes: readonly BuilderInlineNode[]) {
	const normalized: BuilderInlineNode[] = [];

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
