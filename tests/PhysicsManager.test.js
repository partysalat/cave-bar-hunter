import { describe, it, expect } from 'vitest';
import {
    sphereVsSphere, distance2D, boxVsBox, sphereVsBox,
    applyGravity, checkPlatform, GRAVITY
} from '../src/systems/PhysicsManager.js';

describe('PhysicsManager', () => {
    describe('distance2D', () => {
        it('calculates 2D distance between two points', () => {
            expect(distance2D(0, 0, 3, 4)).toBe(5); // 3-4-5 triangle
        });

        it('returns 0 for same point', () => {
            expect(distance2D(5, 5, 5, 5)).toBe(0);
        });

        it('works with horizontal distance only', () => {
            expect(distance2D(0, 0, 5, 0)).toBe(5);
        });
    });

    describe('sphereVsSphere', () => {
        it('detects collision when spheres overlap', () => {
            const a = { worldX: 0, worldY: 0, radius: 2 };
            const b = { worldX: 3, worldY: 0, radius: 2 };
            expect(sphereVsSphere(a, b)).toBe(true); // distance 3 < radius sum 4
        });

        it('detects no collision when spheres are apart', () => {
            const a = { worldX: 0, worldY: 0, radius: 1 };
            const b = { worldX: 5, worldY: 0, radius: 1 };
            expect(sphereVsSphere(a, b)).toBe(false); // distance 5 > radius sum 2
        });

        it('considers vertical separation', () => {
            const a = { worldX: 0, worldY: 0, radius: 1 };
            const b = { worldX: 0, worldY: 3, radius: 1 };
            expect(sphereVsSphere(a, b)).toBe(false); // separated vertically
        });
    });

    describe('boxVsBox', () => {
        it('detects overlapping boxes', () => {
            const a = { worldX: 0, worldY: 0, width: 4, height: 4 };
            const b = { worldX: 2, worldY: 0, width: 4, height: 4 };
            expect(boxVsBox(a, b)).toBe(true);
        });

        it('detects non-overlapping boxes', () => {
            const a = { worldX: 0, worldY: 0, width: 2, height: 2 };
            const b = { worldX: 5, worldY: 0, width: 2, height: 2 };
            expect(boxVsBox(a, b)).toBe(false);
        });
    });

    describe('applyGravity', () => {
        it('does nothing to entities without affectedByGravity', () => {
            const entity = { affectedByGravity: false, worldY: 5, velocityY: 0, onGround: false };
            applyGravity(entity, 100);
            expect(entity.worldY).toBe(5);
        });

        it('accelerates entity downward each frame', () => {
            // Use 100ms delta - at GRAVITY=-40, worldY only drops 0.2 units, stays airborne
            const entity = { affectedByGravity: true, worldY: 10, velocityY: 0, onGround: false };
            applyGravity(entity, 100); // 0.1 second
            expect(entity.velocityY).toBeCloseTo(GRAVITY * 0.1); // -4
            expect(entity.worldY).toBeLessThan(10);
        });

        it('stops entity at ground (worldY=0)', () => {
            const entity = { affectedByGravity: true, worldY: 0.1, velocityY: -20, onGround: false };
            applyGravity(entity, 100);
            expect(entity.worldY).toBe(0);
            expect(entity.velocityY).toBe(0);
            expect(entity.onGround).toBe(true);
        });

        it('sets onGround false when airborne', () => {
            const entity = { affectedByGravity: true, worldY: 5, velocityY: 0, onGround: true };
            applyGravity(entity, 16);
            expect(entity.onGround).toBe(false);
        });
    });

    describe('checkPlatform', () => {
        it('lands entity on platform when falling onto it', () => {
            const platform = { x: 10, y: 5, width: 6 };
            const entity = { worldX: 10, worldY: 4.9, velocityY: -5, onGround: false };
            checkPlatform(entity, platform, 5.1); // prevY was above platform
            expect(entity.worldY).toBe(5);
            expect(entity.onGround).toBe(true);
        });

        it('ignores entity outside platform horizontal bounds', () => {
            const platform = { x: 10, y: 5, width: 6 };
            const entity = { worldX: 20, worldY: 4.9, velocityY: -5, onGround: false };
            checkPlatform(entity, platform, 5.1);
            expect(entity.onGround).toBe(false); // unchanged
        });

        it('allows jumping through platform from below', () => {
            const platform = { x: 10, y: 5, width: 6 };
            const entity = { worldX: 10, worldY: 5.5, velocityY: 10, onGround: false };
            checkPlatform(entity, platform, 4.5); // was below, now above - jumping up
            expect(entity.onGround).toBe(false); // should not land
        });
    });
});
