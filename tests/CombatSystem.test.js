import { describe, expect, it } from 'vitest';
import CombatSystem from '../src/systems/CombatSystem.js';

describe('CombatSystem', () => {
    it('lands a melee hit when the target is in range and in front', () => {
        const system = new CombatSystem();
        const player = {
            worldX: 5,
            worldY: 0,
            facing: 1,
            score: 0,
            canMelee: () => true,
            startMeleeAttack: () => true,
            addScore(points) {
                this.score += points;
            },
        };
        const target = {
            worldX: 6,
            worldY: 0,
            takeDamage(amount) {
                this.lastDamage = amount;
            },
        };

        const result = system.tryMeleeHit(player, target);

        expect(result.hit).toBe(true);
        expect(result.damage).toBe(3);
        expect(target.lastDamage).toBe(3);
        expect(player.score).toBe(3);
    });

    it('does not land a melee hit when the target is behind the player', () => {
        const system = new CombatSystem();
        const player = {
            worldX: 5,
            worldY: 0,
            facing: 1,
            canMelee: () => true,
            startMeleeAttack: () => true,
            addScore() {},
        };
        const target = { worldX: 3, worldY: 0, takeDamage() {} };

        expect(system.tryMeleeHit(player, target).hit).toBe(false);
    });

    it('damages the player when an enemy touch attack is in range and off cooldown', () => {
        const system = new CombatSystem();
        const enemy = {
            worldX: 6,
            worldY: 0,
            attackRange: 2,
            canAttack: () => true,
            spendAttack() {
                this.spent = true;
            },
        };
        const player = {
            worldX: 5,
            worldY: 0,
            takeDamage(amount) {
                this.lastDamage = amount;
                return true;
            },
        };

        expect(system.tryEnemyTouchAttack(enemy, player)).toBe(true);
        expect(player.lastDamage).toBe(1);
        expect(enemy.spent).toBe(true);
    });
});
