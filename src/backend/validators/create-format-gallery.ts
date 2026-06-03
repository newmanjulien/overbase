import { v } from 'convex/values';
import { CREATE_FORMAT_GALLERY_CATEGORY_IDS } from '../../shared/create-format-gallery';

export const createFormatGalleryCategoryId = v.union(
	...CREATE_FORMAT_GALLERY_CATEGORY_IDS.map((categoryId) => v.literal(categoryId))
);
