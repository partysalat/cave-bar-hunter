import { describe, expect, it } from 'vitest';
import { applyPlayerPhysics, getGravity } from '../src/systems/PhysicsManager.js';

describe('PhysicsManager', () => {
    it('applies gravity while the player is airborne', () => {
        const player = {
            width: 0.8,
            worldX: 4,
            worldY: 3,
            velocityX: 0,
            velocityY: 0,
            onGround: false,
        };

        applyPlayerPhysics(player, 0.1, [], 48);

        expect(getGravity()).toBeGreaterThan(0);
        expect(player.worldY).toBeLessThan(3);
        expect(player.velocityY).toBeLessThan(0);
    });

    it('lands on the ground when falling below y=0', () => {
        const player = {
            width: 0.8,
            worldX: 4,
            worldY: 0.1,
            velocityX: 0,
            velocityY: -4,
            onGround: false,
        };

        applyPlayerPhysics(player, 0.1, [], 48);

        expect(player.worldY).toBe(0);
        expect(player.velocityY).toBe(0);
        expect(player.onGround).toBe(true);
    });

    it('lands on top of a platform while falling through its height', () => {
        const player = {
            width: 0.8,
            worldX: 10,
            worldY: 2.8,
            velocityX: 0,
            velocityY: -6,
            onGround: false,
        };

        applyPlayerPhysics(player, 0.1, [{ x: 8, y: 2, width: 5 }], 48);

        expect(player.worldY).toBe(2);
        expect(player.velocityY).toBe(0);
        expect(player.onGround).toBe(true);
    });
});
