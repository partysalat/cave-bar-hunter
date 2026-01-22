import { describe, it, expect } from 'vitest';
import { worldToScreen, screenToWorld, calculateDepth, screenToWorldDirection, worldToScreenDirection } from '../src/systems/CoordinateSystem.js';

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

    describe('worldToScreenDirection', () => {
        it('converts world direction back to screen up (W)', () => {
            const world = screenToWorldDirection(0, -1);
            const screen = worldToScreenDirection(world.x, world.y);
            expect(screen.x).toBeCloseTo(0);
            expect(screen.y).toBeCloseTo(-1);
        });

        it('converts world direction back to screen down (S)', () => {
            const world = screenToWorldDirection(0, 1);
            const screen = worldToScreenDirection(world.x, world.y);
            expect(screen.x).toBeCloseTo(0);
            expect(screen.y).toBeCloseTo(1);
        });

        it('converts world direction back to screen left (A)', () => {
            const world = screenToWorldDirection(-1, 0);
            const screen = worldToScreenDirection(world.x, world.y);
            expect(screen.x).toBeCloseTo(-1);
            expect(screen.y).toBeCloseTo(0);
        });

        it('converts world direction back to screen right (D)', () => {
            const world = screenToWorldDirection(1, 0);
            const screen = worldToScreenDirection(world.x, world.y);
            expect(screen.x).toBeCloseTo(1);
            expect(screen.y).toBeCloseTo(0);
        });

        it('is the inverse of screenToWorldDirection for all directions', () => {
            const screenDirections = [
                { x: 0, y: -1 },   // North
                { x: 1, y: -1 },   // North-East
                { x: 1, y: 0 },    // East
                { x: 1, y: 1 },    // South-East
                { x: 0, y: 1 },    // South
                { x: -1, y: 1 },   // South-West
                { x: -1, y: 0 },   // West
                { x: -1, y: -1 }   // North-West
            ];

            screenDirections.forEach(screenDir => {
                const world = screenToWorldDirection(screenDir.x, screenDir.y);
                const backToScreen = worldToScreenDirection(world.x, world.y);
                expect(backToScreen.x).toBeCloseTo(screenDir.x);
                expect(backToScreen.y).toBeCloseTo(screenDir.y);
            });
        });
    });
});
