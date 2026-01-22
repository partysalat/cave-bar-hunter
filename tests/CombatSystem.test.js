import { describe, it, expect, beforeEach } from 'vitest';
import CombatSystem from '../src/systems/CombatSystem.js';
import Projectile from '../src/entities/Projectile.js';
import WeakPoint from '../src/entities/WeakPoint.js';

describe('CombatSystem', () => {
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

    it('detects projectile hit on weak point', () => {
        const combat = new CombatSystem();
        const projectile = new Projectile(mockScene, 0, 10, 10, 1, 1, 0, 0);
        const weakPoint = new WeakPoint('head', 50, 2.0, 0, 0, 0);
        weakPoint.updatePosition(10, 10, 1); // Same position as projectile

        const result = combat.checkProjectileHit(projectile, weakPoint);

        expect(result.hit).toBe(true);
        expect(result.damage).toBeGreaterThan(0);
    });

    it('applies damage multiplier from weak point', () => {
        const combat = new CombatSystem();
        const projectile = new Projectile(mockScene, 0, 10, 10, 1, 1, 0, 0);
        const weakPoint = new WeakPoint('head', 50, 2.0, 0, 0, 0);
        weakPoint.updatePosition(10, 10, 1);

        const baseDamage = projectile.damage;
        const result = combat.checkProjectileHit(projectile, weakPoint);

        expect(result.damage).toBe(baseDamage * 2.0); // 2x multiplier for head
    });

    it('returns no hit when projectile misses', () => {
        const combat = new CombatSystem();
        const projectile = new Projectile(mockScene, 0, 10, 10, 1, 1, 0, 0);
        const weakPoint = new WeakPoint('head', 50, 2.0, 0, 0, 0);
        weakPoint.updatePosition(20, 20, 1); // Far away

        const result = combat.checkProjectileHit(projectile, weakPoint);

        expect(result.hit).toBe(false);
    });
});
