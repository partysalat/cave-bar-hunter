import { describe, expect, it } from 'vitest';
import SessionManager from '../src/systems/SessionManager.js';

describe('SessionManager', () => {
    it('loads and saves player score across hunt boundaries', () => {
        const session = new SessionManager();
        const player = { score: 12, health: 2, maxHealth: 3 };

        session.savePlayerState([player]);
        const restored = { score: 0, health: 0, maxHealth: 0 };
        session.loadPlayerState([restored]);

        expect(restored.score).toBe(12);
        expect(restored.health).toBe(2);
        expect(restored.maxHealth).toBe(3);
    });

    it('starts a new session with the rebuilt baseline survivability', () => {
        const session = new SessionManager();

        session.startNewSession();

        expect(session.playerData[0].health).toBe(4);
        expect(session.playerData[0].maxHealth).toBe(4);
    });

    it('advances the hunt and heals players to max health on victory', () => {
        const session = new SessionManager();
        const player = { score: 8, health: 1, maxHealth: 3 };

        session.completeHunt([player]);

        expect(session.currentHunt).toBe(2);
        expect(session.huntsCompleted).toBe(1);
        expect(session.playerData[0].score).toBe(8);
        expect(session.playerData[0].health).toBe(3);
    });

    it('marks the session as failed while preserving the last score for GameOverScene', () => {
        const session = new SessionManager();
        session.startNewSession();
        session.currentHunt = 3;
        session.huntsCompleted = 2;
        session.playerData[0].score = 44;

        session.failHunt([{ score: 44, health: 0, maxHealth: 3, meleeDamage: 3, throwDamage: 2, moveSpeedMultiplier: 1, dodgeCooldownMultiplier: 1 }]);

        expect(session.currentHunt).toBe(3);
        expect(session.huntsCompleted).toBe(2);
        expect(session.playerData[0].score).toBe(44);
        expect(session.sessionState).toBe('failure');
    });
});
