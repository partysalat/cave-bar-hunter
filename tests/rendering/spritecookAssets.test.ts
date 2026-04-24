import { describe, expect, it } from 'vitest';

import { hasSpriteCookAssetUrl, listSpriteCookAssets } from '../../src/rendering/spritecookAssets.ts';

describe('spritecookAssets', () => {
    it('detects manifest entries that are missing on disk', () => {
        expect(hasSpriteCookAssetUrl('animations/red/brace-idle.webp')).toBe(false);
        expect(hasSpriteCookAssetUrl('animations/red/idle.webp')).toBe(true);
    });

    it('filters out manifest entries with missing files from the preload catalog', () => {
        const assets = listSpriteCookAssets();
        const files = assets.map((asset) => asset.file);

        expect(files).not.toContain('animations/red/brace-idle.webp');
        expect(files).toContain('animations/red/idle.webp');
    });
});
