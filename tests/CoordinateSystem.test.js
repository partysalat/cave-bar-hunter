import { describe, it, expect } from 'vitest';
import {
    worldToScreen, screenToWorld, calculateDepth,
    PIXELS_PER_UNIT, SCREEN_FLOOR_Y, DEPTH_LAYERS
} from '../src/systems/CoordinateSystem.js';

describe('CoordinateSystem', () => {
    describe('worldToScreen', () => {
        it('places ground origin at SCREEN_FLOOR_Y', () => {
            const result = worldToScreen(0, 0);
            expect(result.x).toBe(0);
            expect(result.y).toBe(SCREEN_FLOOR_Y);
        });

        it('maps worldX linearly to screenX', () => {
            const result = worldToScreen(10, 0);
            expect(result.x).toBe(10 * PIXELS_PER_UNIT);
            expect(result.y).toBe(SCREEN_FLOOR_Y);
        });

        it('higher worldY produces lower screenY (up is up)', () => {
            const ground = worldToScreen(0, 0);
            const elevated = worldToScreen(0, 5);
            expect(elevated.y).toBeLessThan(ground.y);
            expect(elevated.y).toBe(SCREEN_FLOOR_Y - 5 * PIXELS_PER_UNIT);
        });

        it('maps worldX and worldY independently', () => {
            const result = worldToScreen(3, 4);
            expect(result.x).toBe(3 * PIXELS_PER_UNIT);
            expect(result.y).toBe(SCREEN_FLOOR_Y - 4 * PIXELS_PER_UNIT);
        });
    });

    describe('screenToWorld', () => {
        it('is the inverse of worldToScreen', () => {
            const positions = [
                { worldX: 0, worldY: 0 },
                { worldX: 10, worldY: 5 },
                { worldX: 15, worldY: 0 },
                { worldX: 5, worldY: 8 },
            ];
            positions.forEach(({ worldX, worldY }) => {
                const screen = worldToScreen(worldX, worldY);
                const back = screenToWorld(screen.x, screen.y);
                expect(back.worldX).toBeCloseTo(worldX);
                expect(back.worldY).toBeCloseTo(worldY);
            });
        });
    });

    describe('calculateDepth', () => {
        it('returns the ENTITIES layer depth', () => {
            expect(calculateDepth()).toBe(DEPTH_LAYERS.ENTITIES);
        });
    });

    describe('DEPTH_LAYERS', () => {
        it('layers are ordered correctly', () => {
            expect(DEPTH_LAYERS.BACKGROUND).toBeLessThan(DEPTH_LAYERS.PLATFORMS);
            expect(DEPTH_LAYERS.PLATFORMS).toBeLessThan(DEPTH_LAYERS.ENTITIES);
            expect(DEPTH_LAYERS.ENTITIES).toBeLessThan(DEPTH_LAYERS.FOREGROUND);
            expect(DEPTH_LAYERS.FOREGROUND).toBeLessThan(DEPTH_LAYERS.UI);
        });
    });
});
