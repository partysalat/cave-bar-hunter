import { describe, expect, it } from 'vitest';
import SessionManager from '../src/systems/SessionManager.js';

describe('Cave bar persistence', () => {
    it('persists purchased combat upgrades into the next hunt load', () => {
        const session = new SessionManager();
        const player = {
            score: 20,
            health: 4,
            maxHealth: 4,
            meleeDamage: 4,
            throwDamage: 3,
            moveSpeedMultiplier: 1.2,
            dodgeCooldownMultiplier: 0.8,
        };

        session.playerData[0].upgrades.weapon = true;
        session.playerData[0].upgrades.painting = true;
        session.playerData[0].upgrades.drink = true;
        session.savePlayerState([player]);

        const loaded = {
            score: 0,
            health: 0,
            maxHealth: 0,
            meleeDamage: 0,
            throwDamage: 0,
            moveSpeedMultiplier: 0,
            dodgeCooldownMultiplier: 0,
        };

        session.loadPlayerState([loaded]);

        expect(loaded.meleeDamage).toBe(4);
        expect(loaded.throwDamage).toBe(3);
        expect(loaded.maxHealth).toBe(4);
        expect(loaded.moveSpeedMultiplier).toBe(1.2);
        expect(loaded.dodgeCooldownMultiplier).toBe(0.8);
    });
});
