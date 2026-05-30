import { cloneBlueprintInline, type BlueprintInlineNode } from './inline';

export type BlueprintParagraphBlock = {
	id: string;
	type: 'paragraph';
	content: readonly BlueprintInlineNode[];
};

export type BlueprintBulletItem = {
	id: string;
	content: readonly BlueprintInlineNode[];
};

export type BlueprintBulletsBlock = {
	id: string;
	type: 'bullets';
	items: readonly BlueprintBulletItem[];
};

export type BlueprintBodyBlock = BlueprintParagraphBlock | BlueprintBulletsBlock;

export function blueprintParagraph(
	id: string,
	content: readonly BlueprintInlineNode[]
): BlueprintParagraphBlock {
	return {
		id,
		type: 'paragraph',
		content
	};
}

export function blueprintBulletItem(
	id: string,
	content: readonly BlueprintInlineNode[]
): BlueprintBulletItem {
	return {
		id,
		content
	};
}

export function blueprintBullets(
	id: string,
	items: readonly BlueprintBulletItem[]
): BlueprintBulletsBlock {
	return {
		id,
		type: 'bullets',
		items
	};
}

export function cloneBlueprintBody(body: readonly BlueprintBodyBlock[]): BlueprintBodyBlock[] {
	return body.map((block) => {
		if (block.type === 'paragraph') {
			return {
				id: block.id,
				type: 'paragraph',
				content: cloneBlueprintInline(block.content)
			};
		}

		return {
			id: block.id,
			type: 'bullets',
			items: block.items.map(cloneBlueprintBulletItem)
		};
	});
}

export function cloneBlueprintBulletItem(item: BlueprintBulletItem): BlueprintBulletItem {
	return {
		id: item.id,
		content: cloneBlueprintInline(item.content)
	};
}

export function areBlueprintBodiesEqual(
	left: readonly BlueprintBodyBlock[],
	right: readonly BlueprintBodyBlock[]
) {
	return JSON.stringify(left) === JSON.stringify(right);
}
