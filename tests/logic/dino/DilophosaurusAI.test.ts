import { describe, expect, it } from 'vitest';
import { DilophosaurusAI } from '../../../src/logic/dino/DilophosaurusAI.js';

describe('DilophosaurusAI', () => {
    it('chooses spit when two players share a zone', () => {
        const ai = new DilophosaurusAI();
        const players = {
            0: { zone: 'mid', flank: 'left' },
            1: { zone: 'mid', flank: 'right' },
            2: { zone: 'close', flank: 'center' },
            3: { zone: 'far', flank: 'left' },
        } as const;

        const attack = ai.selectTelegraph(players);

        expect(attack.type).toBe('spit');
        expect(attack.affectedZones).toEqual([
            { zone: 'mid', flank: 'left' },
            { zone: 'mid', flank: 'center' },
            { zone: 'mid', flank: 'right' },
        ]);
        expect(attack.qteType).toBe('timing');
        expect(attack.damage).toBe(4);
    });

    it('chooses bite when no zone has two players and targets the close player', () => {
        const ai = new DilophosaurusAI();
        const players = {
            0: { zone: 'close', flank: 'center' },
            1: { zone: 'mid', flank: 'left' },
            2: { zone: 'far', flank: 'center' },
        } as const;

        const attack = ai.selectTelegraph(players);

        expect(attack.type).toBe('bite');
        expect(attack.affectedZones).toEqual([{ zone: 'close', flank: 'center' }]);
        expect(attack.qteType).toBe('smash');
        expect(attack.damage).toBe(6);
    });

    it('falls back to a deterministic bite target when no player is in close', () => {
        const ai = new DilophosaurusAI();
        const players = {
            0: { zone: 'mid', flank: 'left' },
            1: { zone: 'far', flank: 'center' },
        } as const;

        const attack = ai.selectTelegraph(players);

        expect(attack.type).toBe('bite');
        expect(attack.affectedZones).toEqual([{ zone: 'mid', flank: 'left' }]);
    });

    it('exposes the weak point thresholds used by the spike', () => {
        const ai = new DilophosaurusAI();

        expect(ai.getWeakPointThresholds()).toEqual({
            head: 15,
            legs: 20,
        });
    });
});
