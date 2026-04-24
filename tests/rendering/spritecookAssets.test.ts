import { describe, expect, it } from 'vitest';

import {
    getGeneratedSpriteCookAnimation,
    hasSpriteCookAssetUrl,
    listGeneratedSpriteCookEntities,
    listSpriteCookStaticAssets,
} from '../../src/rendering/spritecookAssets.ts';

describe('spritecookAssets', () => {
    it('exposes raw spritecook URLs only for static png assets', () => {
        expect(hasSpriteCookAssetUrl('animations/red/brace-idle.webp')).toBe(false);
        expect(hasSpriteCookAssetUrl('animations/red/idle.webp')).toBe(false);
        expect(hasSpriteCookAssetUrl('cavebar/tiles/floor.png')).toBe(true);
    });

    it('keeps the raw preload catalog focused on static spritecook art', () => {
        const assets = listSpriteCookStaticAssets();
        const files = assets.map((asset) => asset.file);

        expect(files).not.toContain('animations/red/brace-idle.webp');
        expect(files).not.toContain('animations/red/idle.webp');
        expect(files).toContain('cavebar/tiles/floor.png');
    });

    it('discovers generated entity atlases and animation metadata for animated actors', () => {
        const entities = listGeneratedSpriteCookEntities();
        const entityNames = entities.map((entry) => entry.entity);
        const redIdle = getGeneratedSpriteCookAnimation('red', 'idle');

        expect(entityNames).toContain('red');
        expect(entityNames).toContain('dilophosaurus');
        expect(redIdle?.entity.entity).toBe('red');
        expect(redIdle?.animation).toBe('idle');
        expect(redIdle?.data.frames.length).toBeGreaterThan(0);
    });
});
