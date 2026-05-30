import { cloneBuilderInline, type BuilderInlineNode } from './inline';

export type BuilderParagraphBlock = {
	id: string;
	type: 'paragraph';
	content: readonly BuilderInlineNode[];
};

export type BuilderBulletItem = {
	id: string;
	content: readonly BuilderInlineNode[];
};

export type BuilderBulletsBlock = {
	id: string;
	type: 'bullets';
	items: readonly BuilderBulletItem[];
};

export type BuilderBodyBlock = BuilderParagraphBlock | BuilderBulletsBlock;

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

export function builderBulletItem(
	id: string,
	content: readonly BuilderInlineNode[]
): BuilderBulletItem {
	return {
		id,
		content
	};
}

export function builderBullets(
	id: string,
	items: readonly BuilderBulletItem[]
): BuilderBulletsBlock {
	return {
		id,
		type: 'bullets',
		items
	};
}

export function cloneBuilderBody(body: readonly BuilderBodyBlock[]): BuilderBodyBlock[] {
	return body.map((block) => {
		if (block.type === 'paragraph') {
			return {
				id: block.id,
				type: 'paragraph',
				content: cloneBuilderInline(block.content)
			};
		}

		return {
			id: block.id,
			type: 'bullets',
			items: block.items.map(cloneBuilderBulletItem)
		};
	});
}

export function cloneBuilderBulletItem(item: BuilderBulletItem): BuilderBulletItem {
	return {
		id: item.id,
		content: cloneBuilderInline(item.content)
	};
}
