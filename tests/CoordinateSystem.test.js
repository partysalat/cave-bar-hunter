import { describe, it, expect } from 'vitest';
import { worldToScreen, screenToWorld, calculateDepth, screenToWorldDirection } from '../src/systems/CoordinateSystem.js';

describe('CoordinateSystem', () => {
    it('converts world origin to screen center', () => {
        const result = worldToScreen(0, 0, 0);
        expect(result.x).toBe(1280); // SCREEN_CENTER_X (2K resolution)
        expect(result.y).toBe(720); // SCREEN_CENTER_Y (2K resolution)
    });

    it('converts world position to isometric screen position', () => {
        const result = worldToScreen(10, 5, 0);
        expect(result.x).toBe(1280 + (10 - 5) * 64); // (worldX - worldY) * (TILE_WIDTH/2)
        expect(result.y).toBe(720 + (10 + 5) * 32); // (worldX + worldY) * (TILE_HEIGHT/2)
    });

    it('applies Z height offset to screen Y', () => {
        const result = worldToScreen(0, 0, 2);
        expect(result.x).toBe(1280);
        expect(result.y).toBe(720 - 2 * 100); // Z * HEIGHT_SCALE
    });

    describe('screenToWorldDirection', () => {
        it('converts screen up (W) to world direction that moves straight up on screen', () => {
            const result = screenToWorldDirection(0, -1);
            expect(result.x).toBe(-1);
            expect(result.y).toBe(-1);
        });

        it('converts screen down (S) to world direction that moves straight down on screen', () => {
            const result = screenToWorldDirection(0, 1);
            expect(result.x).toBe(1);
            expect(result.y).toBe(1);
        });

        it('converts screen left (A) to world direction that moves straight left on screen', () => {
            const result = screenToWorldDirection(-1, 0);
            expect(result.x).toBe(-1);
            expect(result.y).toBe(1);
        });

        it('converts screen right (D) to world direction that moves straight right on screen', () => {
            const result = screenToWorldDirection(1, 0);
            expect(result.x).toBe(1);
            expect(result.y).toBe(-1);
        });
    });
});
