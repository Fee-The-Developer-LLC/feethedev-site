/**
 * Fee The Developer digital asset library, served from /public/library.
 *
 * Imported 2026-11-08 from the owner's "Fee The Developer.zip" (89 images,
 * converted to WebP at quality 85 with original dimensions, plus 2 MP4s).
 * The manifest lives in `asset-library.json`.
 *
 * Every person in `people` is an AI-generated persona. Use them as stand-ins
 * for audiences or roles only, never as real clients, staff, or testimonials.
 */
import manifest from './asset-library.json';

export type AssetCategory =
  | 'people'
  | 'spaces'
  | 'graphics'
  | 'brand'
  | 'video';

export type LibraryAsset = {
  id: string;
  category: AssetCategory;
  src: string;
  label: string;
  width: number | null;
  height: number | null;
  orientation: 'portrait' | 'landscape' | 'square' | null;
};

export const assetLibrary = manifest as LibraryAsset[];

export function getAsset(id: string): LibraryAsset {
  const asset = assetLibrary.find((item) => item.id === id);
  if (!asset) throw new Error(`Unknown library asset: ${id}`);
  return asset;
}

export function assetsIn(category: AssetCategory): LibraryAsset[] {
  return assetLibrary.filter((item) => item.category === category);
}
