import { describe, it, expect } from 'vitest';
import { worldToScreen, screenToWorld, calculateDepth } from '../src/systems/CoordinateSystem.js';

describe('CoordinateSystem', () => {
    it('converts world origin to screen center', () => {
        const result = worldToScreen(0, 0, 0);
        expect(result.x).toBe(960); // SCREEN_CENTER_X
        expect(result.y).toBe(540); // SCREEN_CENTER_Y
    });

    it('converts world position to isometric screen position', () => {
        const result = worldToScreen(10, 5, 0);
        expect(result.x).toBe(960 + (10 - 5) * 32); // (worldX - worldY) * (TILE_WIDTH/2)
        expect(result.y).toBe(540 + (10 + 5) * 16); // (worldX + worldY) * (TILE_HEIGHT/2)
    });

    it('applies Z height offset to screen Y', () => {
        const result = worldToScreen(0, 0, 2);
        expect(result.x).toBe(960);
        expect(result.y).toBe(540 - 2 * 50); // Z * HEIGHT_SCALE
    });
});
