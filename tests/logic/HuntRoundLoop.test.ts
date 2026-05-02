import { describe, expect, it } from 'vitest';

import { createHuntRoundLoop } from '../../src/logic/HuntRoundLoop.js';

describe('HuntRoundLoop', () => {
    it('begins a Hunt in the plan phase with an announced telegraph', () => {
        const loop = createHuntRoundLoop({
            playerIds: [0, 1],
            sessionState: [
                { playerId: 0, health: 4, score: 12, activeWeapon: 'club' },
                { playerId: 1, health: 3, score: 8, activeWeapon: 'bow' },
            ],
        });

        const result = loop.advance({ type: 'begin_hunt' });

        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }

        expect(result.snapshot.round).toBe(1);
        expect(result.snapshot.phase.kind).toBe('plan');
        expect(result.snapshot.dino.currentTelegraph).not.toBeNull();
        expect(result.snapshot.players[0].score).toBe(12);
        expect(result.snapshot.players[1].activeWeapon).toBe('bow');
        expect(result.emissions).toEqual([
            { type: 'phase_changed', from: 'idle', to: 'plan' },
            { type: 'telegraph_announced', telegraph: result.snapshot.dino.currentTelegraph! },
        ]);
    });

    it('records planned actions and transitions to submit when all eligible players commit', () => {
        const loop = createHuntRoundLoop({
            playerIds: [0, 1],
        });

        loop.advance({ type: 'begin_hunt' });
        const first = loop.advance({
            type: 'submit_planned_action',
            playerId: 0,
            action: { type: 'brace' },
        });
        const second = loop.advance({
            type: 'submit_planned_action',
            playerId: 1,
            action: { type: 'aimed_strike', target: 'head' },
        });

        expect(first.ok).toBe(true);
        if (first.ok) {
            expect(first.snapshot.phase.kind).toBe('plan');
            expect(first.snapshot.players[0].submittedAction).toEqual({ type: 'brace' });
            expect(first.emissions).toEqual([
                { type: 'planned_action_submitted', playerId: 0, action: { type: 'brace' } },
            ]);
        }

        expect(second.ok).toBe(true);
        if (second.ok) {
            expect(second.snapshot.phase.kind).toBe('submit');
            expect(second.emissions).toEqual([
                { type: 'planned_action_submitted', playerId: 1, action: { type: 'aimed_strike', target: 'head' } },
                { type: 'phase_changed', from: 'plan', to: 'submit' },
            ]);
        }
    });

    it('closes the plan phase when the deadline expires', () => {
        const loop = createHuntRoundLoop({
            playerIds: [0],
            planDurationMs: 10,
            submitDurationMs: 5,
        });

        loop.advance({ type: 'begin_hunt' });
        const afterPlan = loop.advance({ type: 'tick', deltaMs: 10 });
        const afterSubmit = loop.advance({ type: 'tick', deltaMs: 5 });

        expect(afterPlan.ok).toBe(true);
        if (afterPlan.ok) {
            expect(afterPlan.snapshot.phase.kind).toBe('submit');
            expect(afterPlan.emissions).toEqual([
                { type: 'phase_changed', from: 'plan', to: 'submit' },
            ]);
        }

        expect(afterSubmit.ok).toBe(true);
        if (afterSubmit.ok) {
            expect(afterSubmit.snapshot.phase.kind).toBe('resolve');
            expect(afterSubmit.emissions).toEqual([
                { type: 'phase_changed', from: 'submit', to: 'resolve' },
            ]);
        }
    });
});
