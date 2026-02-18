import { describe, it, expect, beforeEach } from 'vitest';
import SessionManager from '../src/systems/SessionManager.js';

describe('SessionManager', () => {
    let session;
    beforeEach(() => { session = new SessionManager(); });

    it('startHunt logs current hunt number', () => {
        // startHunt is called at the beginning of each hunt
        // it should not throw and currentHunt should still be 1
        session.startHunt();
        expect(session.getCurrentHunt()).toBe(1);
    });

    it('advanceHunt records defeat and increments hunt number', () => {
        session.advanceHunt('compy-pack');
        expect(session.getCurrentHunt()).toBe(2);
        expect(session.getDefeatedDinosaurs()).toContain('compy-pack');
    });

    it('advanceHunt without dinosaurId still increments', () => {
        session.advanceHunt();
        expect(session.getCurrentHunt()).toBe(2);
    });

    it('cocktail buffs are cleared after advanceHunt', () => {
        session.playerData[0].cocktailBuffs = [{ effect: { type: 'shield', value: 1 } }];
        session.advanceHunt('compy-pack');
        expect(session.playerData[0].cocktailBuffs).toHaveLength(0);
    });

    it('isSessionComplete returns true after 5 hunts', () => {
        for (let i = 0; i < 5; i++) session.advanceHunt(`dino-${i}`);
        expect(session.isSessionComplete()).toBe(true);
    });
});
