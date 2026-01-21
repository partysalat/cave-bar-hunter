import { describe, it, expect, beforeEach } from 'vitest';
import Projectile from '../src/entities/Projectile.js';

describe('Projectile', () => {
    let mockScene;

    beforeEach(() => {
        mockScene = {
            add: {
                sprite: () => ({
                    setOrigin: () => ({}),
                    setDepth: () => ({}),
                    setTint: () => ({})
                })
            }
        };
    });

    it('initializes with owner and direction', () => {
        const projectile = new Projectile(mockScene, 0, 10, 15, 0, 1, 0, 0);
        expect(projectile.ownerPlayerNumber).toBe(0);
        expect(projectile.damage).toBeGreaterThan(0);
    });

    it('moves in specified direction', () => {
        const projectile = new Projectile(mockScene, 0, 10, 15, 0, 1, 0, 0);
        const initialX = projectile.worldX;

        projectile.update(100); // 100ms

        expect(projectile.worldX).toBeGreaterThan(initialX);
    });

    it('marks as expired after max lifetime', () => {
        const projectile = new Projectile(mockScene, 0, 10, 15, 0, 1, 0, 0);
        expect(projectile.isExpired).toBe(false);

        projectile.update(3000); // 3 seconds (exceeds max range)

        expect(projectile.isExpired).toBe(true);
    });
});
