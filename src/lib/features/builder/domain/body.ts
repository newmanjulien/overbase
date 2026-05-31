import { cloneBuilderInline, type BuilderInlineNode } from './inline';

export type BuilderParagraphBlock = {
	id: string;
	type: 'paragraph';
	content: readonly BuilderInlineNode[];
};

export type BuilderBodyBlock = BuilderParagraphBlock;

export function builderParagraph(
	id: string,
	content: readonly BuilderInlineNode[]
): BuilderParagraphBlock {
	return {
		id,
		type: 'paragraph',
		content
	};
}

export function cloneBuilderBody(body: readonly BuilderBodyBlock[]): BuilderBodyBlock[] {
	return body.map((block) => ({
		id: block.id,
		type: 'paragraph',
		content: cloneBuilderInline(block.content)
	}));
}
