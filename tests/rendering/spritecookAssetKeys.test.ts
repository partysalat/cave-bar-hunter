import { describe, expect, it } from 'vitest';

import { listSpriteCookAssets, spriteCookAssetKey } from '../../src/rendering/spritecookAssets.ts';

describe('spriteCook asset keys', () => {
    it('matches the nested manifest paths used by cave bar, arena, and enemy assets', () => {
        const keys = new Set(listSpriteCookAssets().map((asset) => asset.key));

        expect(keys.has(spriteCookAssetKey(['players', 'cavebar', 'tiles', 'wall-far']))).toBe(true);
        expect(keys.has(spriteCookAssetKey(['players', 'cavebar', 'props', 'scoreboard']))).toBe(true);
        expect(keys.has(spriteCookAssetKey(['players', 'arenas', 'dense-jungle', 'tiles', 'floor']))).toBe(true);
        expect(keys.has(spriteCookAssetKey(['players', 'enemies', 'dilophosaurus', 'still']))).toBe(true);
    });
});
