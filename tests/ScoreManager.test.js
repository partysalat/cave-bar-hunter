import { describe, it, expect } from 'vitest';
import ScoreManager from '../src/systems/ScoreManager.js';

describe('ScoreManager', () => {
    it('awards points for damage dealt', () => {
        const scoreMgr = new ScoreManager();

        scoreMgr.awardDamagePoints(0, 10); // Player 0 deals 10 damage

        expect(scoreMgr.getScore(0)).toBe(10); // 1 point per damage
    });

    it('awards bonus points for weak point hits', () => {
        const scoreMgr = new ScoreManager();

        scoreMgr.awardWeakPointHit(0, 10); // Player 0 hits weak point for 10 damage

        expect(scoreMgr.getScore(0)).toBe(30); // 3 points per damage on weak points
    });

    it('awards points for perfect dodge', () => {
        const scoreMgr = new ScoreManager();

        scoreMgr.awardPerfectDodge(0);

        expect(scoreMgr.getScore(0)).toBe(5); // 5 points (from design doc)
    });

    it('tracks scores for 4 players independently', () => {
        const scoreMgr = new ScoreManager();

        scoreMgr.awardDamagePoints(0, 10);
        scoreMgr.awardDamagePoints(1, 20);
        scoreMgr.awardPerfectDodge(2);

        expect(scoreMgr.getScore(0)).toBe(10);
        expect(scoreMgr.getScore(1)).toBe(20);
        expect(scoreMgr.getScore(2)).toBe(5);
        expect(scoreMgr.getScore(3)).toBe(0);
    });
});
