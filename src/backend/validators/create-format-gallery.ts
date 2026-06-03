import { v } from 'convex/values';
import { CREATE_FORMAT_GALLERY_CATEGORY_IDS } from '../../domain/format-starters/gallery-categories';

export const createFormatGalleryCategoryId = v.union(
	...CREATE_FORMAT_GALLERY_CATEGORY_IDS.map((categoryId) => v.literal(categoryId))
);
