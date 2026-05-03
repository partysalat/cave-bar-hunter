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

    it('begins the next round from resolve using adapter-supplied player state', () => {
        const loop = createHuntRoundLoop({
            playerIds: [0, 1],
            planDurationMs: 10,
            submitDurationMs: 5,
        });

        loop.advance({ type: 'begin_hunt' });
        loop.advance({ type: 'submit_planned_action', playerId: 0, action: { type: 'attack' } });
        loop.advance({ type: 'submit_planned_action', playerId: 1, action: { type: 'brace' } });
        loop.advance({ type: 'tick', deltaMs: 5 });

        const nextRound = loop.advance({
            type: 'begin_next_round',
            players: {
                0: {
                    health: 3,
                    score: 11,
                    activeWeapon: 'bow',
                    downed: false,
                    position: { zone: 'mid', flank: 'left' },
                },
                1: {
                    health: 0,
                    score: 7,
                    activeWeapon: 'club',
                    downed: true,
                    position: { zone: 'far', flank: 'center' },
                },
            },
        });

        expect(nextRound.ok).toBe(true);
        if (!nextRound.ok) {
            return;
        }

        expect(nextRound.snapshot.round).toBe(2);
        expect(nextRound.snapshot.phase.kind).toBe('plan');
        expect(nextRound.snapshot.players[0]).toMatchObject({
            health: 3,
            score: 11,
            activeWeapon: 'bow',
            downed: false,
            position: { zone: 'mid', flank: 'left' },
        });
        expect(nextRound.snapshot.players[0].submittedAction).toBeUndefined();
        expect(nextRound.snapshot.players[1]).toMatchObject({
            health: 0,
            score: 7,
            activeWeapon: 'club',
            downed: true,
            position: { zone: 'far', flank: 'center' },
        });
        expect(nextRound.emissions).toEqual([
            { type: 'phase_changed', from: 'resolve', to: 'plan' },
            { type: 'telegraph_announced', telegraph: nextRound.snapshot.dino.currentTelegraph! },
        ]);
    });

    it('resolves submitted actions and opens QTE phases from the loop seam', () => {
        const loop = createHuntRoundLoop({
            playerIds: [0, 1],
        });

        loop.advance({ type: 'begin_hunt' });
        loop.advance({ type: 'submit_planned_action', playerId: 0, action: { type: 'attack' } });
        loop.advance({ type: 'submit_planned_action', playerId: 1, action: { type: 'aimed_strike', target: 'head' } });
        loop.advance({ type: 'tick', deltaMs: 500 });

        const resolved = loop.advance({ type: 'resolve_submitted_actions' });

        expect(resolved.ok).toBe(true);
        if (!resolved.ok) {
            return;
        }

        expect(resolved.snapshot.phase.kind).toBe('attack_qte');
        expect(resolved.snapshot.pending.attackingPlayers).toEqual([
            { playerId: 0, weaponType: 'club', action: 'attack' },
            { playerId: 1, weaponType: 'club', action: 'aimed_strike' },
        ]);
        expect(resolved.emissions).toEqual([
            {
                type: 'round_resolved',
                result: {
                    damageDealt: { 0: 3, 1: 3, 2: 0, 3: 0 },
                    weakPointHits: [{ playerId: 1, weakPoint: 'head', damage: 3 }],
                    staggerTriggered: false,
                    playersHit: [],
                    attackingPlayers: [
                        { playerId: 0, weaponType: 'club', action: 'attack' },
                        { playerId: 1, weaponType: 'club', action: 'aimed_strike' },
                    ],
                },
            },
            { type: 'phase_changed', from: 'resolve', to: 'attack_qte' },
            {
                type: 'attack_qte_opened',
                attackers: [
                    { playerId: 0, weaponType: 'club', action: 'attack' },
                    { playerId: 1, weaponType: 'club', action: 'aimed_strike' },
                ],
            },
        ]);
    });

    it('records attack and dodge QTE submissions and finalizes the round from the loop seam', () => {
        const loop = createHuntRoundLoop({
            playerIds: [0],
        });

        loop.advance({ type: 'begin_hunt' });
        loop.advance({ type: 'submit_planned_action', playerId: 0, action: { type: 'attack' } });
        loop.advance({ type: 'tick', deltaMs: 500 });
        loop.advance({ type: 'resolve_submitted_actions' });

        const attackQte = loop.advance({ type: 'submit_attack_qte', playerId: 0 });
        const dodgeQte = loop.advance({ type: 'submit_dodge_qte', playerId: 0 });
        const finished = loop.advance({ type: 'complete_qte_round' });

        expect(attackQte.ok).toBe(true);
        if (attackQte.ok) {
            expect(attackQte.emissions).toEqual([
                {
                    type: 'attack_qte_result',
                    playerId: 0,
                    weaponType: 'club',
                    critical: false,
                    weakPoint: null,
                },
            ]);
        }

        expect(dodgeQte.ok).toBe(true);
        if (dodgeQte.ok) {
            expect(dodgeQte.emissions).toEqual([
                {
                    type: 'dodge_qte_result',
                    playerId: 0,
                    success: true,
                    perfect: true,
                },
            ]);
        }

        expect(finished.ok).toBe(true);
        if (!finished.ok) {
            return;
        }

        expect(finished.snapshot.phase.kind).toBe('plan');
        expect(finished.snapshot.players[0].score).toBe(8);
        expect(finished.snapshot.dino.health).toBe(27);
        expect(finished.emissions).toEqual([
            {
                type: 'qte_round_finished',
                result: {
                    damageDealt: { 0: 3, 1: 0, 2: 0, 3: 0 },
                    weakPointHits: [],
                    staggerTriggered: false,
                    playersHit: [],
                    attackingPlayers: [
                        { playerId: 0, weaponType: 'club', action: 'attack' },
                    ],
                },
                failedDodges: [],
                perfectDodges: [0],
            },
            { type: 'points_earned', playerId: 0, amount: 3, reason: 'damage' },
            { type: 'points_earned', playerId: 0, amount: 5, reason: 'perfect_dodge' },
            { type: 'dino_health_changed', amount: -3, newHealth: 27 },
            { type: 'phase_changed', from: 'attack_qte', to: 'plan' },
            { type: 'telegraph_announced', telegraph: finished.snapshot.dino.currentTelegraph! },
        ]);
    });

    it('finalizes an active QTE round when the loop deadline expires', () => {
        const loop = createHuntRoundLoop({
            playerIds: [0],
        });

        loop.advance({ type: 'begin_hunt' });
        loop.advance({ type: 'submit_planned_action', playerId: 0, action: { type: 'attack' } });
        loop.advance({ type: 'tick', deltaMs: 500 });
        loop.advance({ type: 'resolve_submitted_actions' });

        const expired = loop.advance({ type: 'tick', deltaMs: 2200 });

        expect(expired.ok).toBe(true);
        if (!expired.ok) {
            return;
        }

        expect(expired.snapshot.phase.kind).toBe('hunt_end');
        expect(expired.emissions).toEqual([
            {
                type: 'qte_round_finished',
                result: {
                    damageDealt: { 0: 3, 1: 0, 2: 0, 3: 0 },
                    weakPointHits: [],
                    staggerTriggered: false,
                    playersHit: [],
                    attackingPlayers: [
                        { playerId: 0, weaponType: 'club', action: 'attack' },
                    ],
                },
                failedDodges: [0],
                perfectDodges: [],
            },
            { type: 'points_earned', playerId: 0, amount: 3, reason: 'damage' },
            { type: 'dino_health_changed', amount: -3, newHealth: 27 },
            { type: 'player_damaged', playerId: 0, amount: 6, newHealth: 0 },
            { type: 'player_downed', playerId: 0 },
            { type: 'hunt_ended', outcome: 'party_wiped' },
        ]);
    });

    it('applies non-QTE aftermath directly from resolve when no QTEs are needed', () => {
        const loop = createHuntRoundLoop({
            playerIds: [],
        });

        loop.advance({ type: 'begin_hunt' });
        loop.advance({ type: 'tick', deltaMs: 6000 });
        loop.advance({ type: 'tick', deltaMs: 500 });

        const resolved = loop.advance({ type: 'resolve_submitted_actions' });

        expect(resolved.ok).toBe(true);
        if (!resolved.ok) {
            return;
        }

        expect(resolved.snapshot.phase.kind).toBe('hunt_end');
        expect(resolved.snapshot.dino.health).toBe(30);
        expect(resolved.emissions).toEqual([
            {
                type: 'round_resolved',
                result: {
                    damageDealt: { 0: 0, 1: 0, 2: 0, 3: 0 },
                    weakPointHits: [],
                    staggerTriggered: false,
                    playersHit: [],
                    attackingPlayers: [],
                },
            },
            { type: 'dino_health_changed', amount: -0, newHealth: 30 },
            { type: 'hunt_ended', outcome: 'party_wiped' },
        ]);
    });
});
