import { describe, expect, it } from 'vitest';
import SessionManager from '../src/systems/SessionManager.js';

describe('Session flow session rules', () => {
    it('starts a new session in active state at hunt 1', () => {
        const session = new SessionManager();
        session.currentHunt = 3;
        session.startNewSession();

        expect(session.sessionState).toBe('active');
        expect(session.currentHunt).toBe(1);
        expect(session.huntsCompleted).toBe(0);
    });

    it('marks session victory after completing the final hunt', () => {
        const session = new SessionManager();
        session.startNewSession();
        session.currentHunt = 5;

        session.completeHunt([{ score: 10, health: 2, maxHealth: 3, meleeDamage: 3, throwDamage: 2, moveSpeedMultiplier: 1, dodgeCooldownMultiplier: 1 }]);

        expect(session.sessionState).toBe('victory');
        expect(session.isSessionComplete()).toBe(true);
    });

    it('marks session failure without erasing the last saved score immediately', () => {
        const session = new SessionManager();
        session.startNewSession();

        session.failHunt([{ score: 22, health: 0, maxHealth: 3, meleeDamage: 3, throwDamage: 2, moveSpeedMultiplier: 1, dodgeCooldownMultiplier: 1 }]);

        expect(session.sessionState).toBe('failure');
        expect(session.playerData[0].score).toBe(22);
    });
});
