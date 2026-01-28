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

describe('CombatSystem - Club Melee', () => {
    let mockScene;

    beforeEach(() => {
        mockScene = {
            add: {
                sprite: () => ({
                    setOrigin: () => ({}),
                    setDepth: () => ({}),
                    setTint: () => ({}),
                    play: () => ({})
                })
            }
        };
    });

    it('detects club hit on enemy in range and arc', () => {
        const combat = new CombatSystem();

        // Mock player facing south (0, 1) attacking
        const mockPlayer = {
            worldX: 10,
            worldY: 10,
            facingX: 0,
            facingY: 1,
            attackPhase: 'swing',
            hitEnemiesThisSwing: []
        };

        // Mock enemy directly in front (south)
        const mockEnemy = {
            id: 'enemy1',
            worldX: 10,
            worldY: 12 // 2 units south
        };

        const result = combat.checkClubHit(mockPlayer, mockEnemy);

        expect(result.hit).toBe(true);
        expect(result.damage).toBe(15);
    });

    it('returns no hit when not in swing phase', () => {
        const combat = new CombatSystem();

        const mockPlayer = {
            worldX: 10,
            worldY: 10,
            facingX: 0,
            facingY: 1,
            attackPhase: 'windup', // Not in swing phase
            hitEnemiesThisSwing: []
        };

        const mockEnemy = {
            id: 'enemy1',
            worldX: 10,
            worldY: 12
        };

        const result = combat.checkClubHit(mockPlayer, mockEnemy);

        expect(result.hit).toBe(false);
    });

    it('returns no hit when enemy already hit this swing', () => {
        const combat = new CombatSystem();

        const mockPlayer = {
            worldX: 10,
            worldY: 10,
            facingX: 0,
            facingY: 1,
            attackPhase: 'swing',
            hitEnemiesThisSwing: ['enemy1'] // Already hit
        };

        const mockEnemy = {
            id: 'enemy1',
            worldX: 10,
            worldY: 12
        };

        const result = combat.checkClubHit(mockPlayer, mockEnemy);

        expect(result.hit).toBe(false);
    });

    it('returns no hit when enemy out of range', () => {
        const combat = new CombatSystem();

        const mockPlayer = {
            worldX: 10,
            worldY: 10,
            facingX: 0,
            facingY: 1,
            attackPhase: 'swing',
            hitEnemiesThisSwing: []
        };

        const mockEnemy = {
            id: 'enemy1',
            worldX: 10,
            worldY: 15 // 5 units away, beyond 2.5 range
        };

        const result = combat.checkClubHit(mockPlayer, mockEnemy);

        expect(result.hit).toBe(false);
    });

    it('returns no hit when enemy outside attack cone', () => {
        const combat = new CombatSystem();

        const mockPlayer = {
            worldX: 10,
            worldY: 10,
            facingX: 0,
            facingY: 1, // Facing south
            attackPhase: 'swing',
            hitEnemiesThisSwing: []
        };

        const mockEnemy = {
            id: 'enemy1',
            worldX: 8, // Behind and to the left (north-west)
            worldY: 9
        };

        const result = combat.checkClubHit(mockPlayer, mockEnemy);

        expect(result.hit).toBe(false);
    });

    it('hits enemy within 60 degree arc', () => {
        const combat = new CombatSystem();

        const mockPlayer = {
            worldX: 10,
            worldY: 10,
            facingX: 0,
            facingY: 1, // Facing south
            attackPhase: 'swing',
            hitEnemiesThisSwing: []
        };

        // Enemy 25 degrees to the right (within 30 degree cone)
        const angle = Math.PI / 2 + (25 * Math.PI / 180);
        const distance = 2.0;
        const mockEnemy = {
            id: 'enemy1',
            worldX: 10 + Math.cos(angle) * distance,
            worldY: 10 + Math.sin(angle) * distance
        };

        const result = combat.checkClubHit(mockPlayer, mockEnemy);

        expect(result.hit).toBe(true);
    });
});
