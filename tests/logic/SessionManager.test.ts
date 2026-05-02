import { describe, expect, it } from 'vitest';
import { SessionManager } from '../../src/logic/SessionManager.js';

describe('SessionManager', () => {
    it('saves and restores player health and score snapshots', () => {
        const session = new SessionManager();

        session.savePlayerState([
            { playerId: 0, health: 3, score: 18, activeWeapon: 'club' },
            { playerId: 2, health: 1, score: 9, activeWeapon: 'bow' },
        ]);

        expect(session.loadPlayerState()).toEqual([
            { playerId: 0, health: 3, score: 18, activeWeapon: 'club' },
            { playerId: 2, health: 1, score: 9, activeWeapon: 'bow' },
        ]);
    });

    it('overwrites an existing snapshot for the same player', () => {
        const session = new SessionManager();

        session.savePlayerState([{ playerId: 1, health: 2, score: 4, activeWeapon: 'club' }]);
        session.savePlayerState([{ playerId: 1, health: 4, score: 11, activeWeapon: 'bow' }]);

        expect(session.loadPlayerState()).toEqual([
            { playerId: 1, health: 4, score: 11, activeWeapon: 'bow' },
        ]);
    });

    it('persists activeWeapon across save/load', () => {
        const session = new SessionManager();

        session.savePlayerState([{ playerId: 0, health: 4, score: 0, activeWeapon: 'bow' }]);

        expect(session.loadPlayerState()).toEqual([
            { playerId: 0, health: 4, score: 0, activeWeapon: 'bow' },
        ]);
    });
});
