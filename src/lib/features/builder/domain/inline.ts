export type BuilderTextNode = {
	type: 'text';
	text: string;
};

export type BuilderVariableNode = {
	type: 'variable';
	variableId: string;
};

export type BuilderInlineNode = BuilderTextNode | BuilderVariableNode;

export function builderText(textValue: string): BuilderTextNode {
	return {
		type: 'text',
		text: textValue
	};
}

export function builderVariable(variableId: string): BuilderVariableNode {
	return {
		type: 'variable',
		variableId
	};
}

export function formatBuilderVariableToken(variableId: string) {
	return `{${variableId}}`;
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
					variableId: node.variableId
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
		} else if (node.variableId.trim()) {
			normalized.push({
				type: 'variable',
				variableId: node.variableId.trim()
			});
		}
	}

	return normalized;
}
