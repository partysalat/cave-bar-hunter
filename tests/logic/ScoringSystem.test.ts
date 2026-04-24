import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/EventBus.js';
import { EVENTS } from '../../src/core/events.js';
import { ScoringSystem } from '../../src/logic/ScoringSystem.js';

describe('ScoringSystem', () => {
    it('awards the correct score for each combat event and emits point events', () => {
        const bus = new EventBus();
        const pointsEarned = vi.fn();
        const scoring = new ScoringSystem(bus);

        bus.on(EVENTS.POINTS_EARNED, pointsEarned);

        scoring.awardDamage(0, 2);
        scoring.awardWeakPointHit(0);
        scoring.awardPerfectDodge(1);
        scoring.awardStaggerContribution(1);
        scoring.awardRevive(2);

        expect(scoring.getTotals()).toEqual({
            0: 5,
            1: 8,
            2: 10,
            3: 0,
        });
        expect(pointsEarned).toHaveBeenCalledWith({ playerId: 0, amount: 2, reason: 'damage' });
        expect(pointsEarned).toHaveBeenCalledWith({ playerId: 2, amount: 10, reason: 'revive' });
    });
});
