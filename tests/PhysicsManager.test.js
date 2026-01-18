import { describe, it, expect } from 'vitest';
import { sphereVsSphere, distance3D } from '../src/systems/PhysicsManager.js';

describe('PhysicsManager', () => {
    describe('distance3D', () => {
        it('calculates 3D distance between two points', () => {
            const dist = distance3D(0, 0, 0, 3, 4, 0);
            expect(dist).toBe(5); // 3-4-5 triangle
        });

        it('includes Z axis in distance', () => {
            const dist = distance3D(0, 0, 0, 0, 0, 5);
            expect(dist).toBe(5);
        });
    });

    describe('sphereVsSphere', () => {
        it('detects collision when spheres overlap', () => {
            const a = { worldX: 0, worldY: 0, worldZ: 0, radius: 2 };
            const b = { worldX: 3, worldY: 0, worldZ: 0, radius: 2 };

            expect(sphereVsSphere(a, b)).toBe(true); // distance 3 < radius sum 4
        });

        it('detects no collision when spheres apart', () => {
            const a = { worldX: 0, worldY: 0, worldZ: 0, radius: 1 };
            const b = { worldX: 5, worldY: 0, worldZ: 0, radius: 1 };

            expect(sphereVsSphere(a, b)).toBe(false); // distance 5 > radius sum 2
        });

        it('considers Z axis for 3D collision', () => {
            const a = { worldX: 0, worldY: 0, worldZ: 0, radius: 1 };
            const b = { worldX: 0, worldY: 0, worldZ: 3, radius: 1 };

            expect(sphereVsSphere(a, b)).toBe(false); // separated on Z axis
        });
    });
});
