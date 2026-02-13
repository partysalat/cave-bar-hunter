import { describe, it, expect, beforeEach, vi } from 'vitest';
import CompyAI from '../../src/ai/CompyAI.js';
import { createMockCompy, createMockPlayer } from '../fixtures/mockPhaser.js';

describe('CompyAI', () => {
    let compy;
    let allCompys;
    let players;
    let ai;

    beforeEach(() => {
        compy = createMockCompy(20, 15, 0);
        allCompys = [
            compy,
            createMockCompy(22, 16, 0),
            createMockCompy(18, 14, 0)
        ];
        players = [
            createMockPlayer(0, 15, 12, 0),
            createMockPlayer(1, 16, 13, 0)
        ];
    });

    describe('initialization', () => {
        it('should initialize with CIRCLING state', () => {
            ai = new CompyAI(compy, allCompys, players);
            expect(ai.state).toBe('CIRCLING');
        });

        it('should initialize target to null', () => {
            ai = new CompyAI(compy, allCompys, players);
            expect(ai.target).toBeNull();
        });

        it('should initialize attackCooldown to 0', () => {
            ai = new CompyAI(compy, allCompys, players);
            expect(ai.attackCooldown).toBe(0);
        });

        it('should initialize stateTimer to 0', () => {
            ai = new CompyAI(compy, allCompys, players);
            expect(ai.stateTimer).toBe(0);
        });

        it('should store references to compy, allCompys, and players', () => {
            ai = new CompyAI(compy, allCompys, players);
            expect(ai.compy).toBe(compy);
            expect(ai.allCompys).toBe(allCompys);
            expect(ai.players).toBe(players);
        });

        it('should initialize orbitRadius to 4', () => {
            ai = new CompyAI(compy, allCompys, players);
            expect(ai.orbitRadius).toBe(4);
        });

        it('should initialize orbitAngle to a random value between 0 and 2π', () => {
            ai = new CompyAI(compy, allCompys, players);
            expect(ai.orbitAngle).toBeGreaterThanOrEqual(0);
            expect(ai.orbitAngle).toBeLessThan(Math.PI * 2);
        });

        it('should initialize different orbitAngles for multiple instances', () => {
            const ai1 = new CompyAI(compy, allCompys, players);
            const ai2 = new CompyAI(createMockCompy(22, 16, 0), allCompys, players);
            const ai3 = new CompyAI(createMockCompy(18, 14, 0), allCompys, players);

            // With very high probability, at least two should be different
            const angles = [ai1.orbitAngle, ai2.orbitAngle, ai3.orbitAngle];
            const uniqueAngles = new Set(angles);
            expect(uniqueAngles.size).toBeGreaterThan(1);
        });

        it('should initialize lungeDirX to 0', () => {
            ai = new CompyAI(compy, allCompys, players);
            expect(ai.lungeDirX).toBe(0);
        });

        it('should initialize lungeDirY to 0', () => {
            ai = new CompyAI(compy, allCompys, players);
            expect(ai.lungeDirY).toBe(0);
        });
    });

    describe('update', () => {
        beforeEach(() => {
            ai = new CompyAI(compy, allCompys, players);
        });

        it('should decrement attackCooldown by delta in seconds', () => {
            ai.attackCooldown = 2.5;
            ai.update(1000); // 1000ms = 1s
            expect(ai.attackCooldown).toBe(1.5);
        });

        it('should clamp attackCooldown to 0', () => {
            ai.attackCooldown = 0.3;
            ai.update(500); // 0.5s
            expect(ai.attackCooldown).toBe(0);
        });

        it('should not allow attackCooldown to go negative', () => {
            ai.attackCooldown = 0;
            ai.update(1000);
            expect(ai.attackCooldown).toBe(0);
        });

        it('should increment stateTimer by delta in seconds', () => {
            ai.stateTimer = 1.5;
            ai.update(1000); // 1s
            expect(ai.stateTimer).toBe(2.5);
        });

        it('should increment stateTimer on multiple updates', () => {
            ai.stateTimer = 0;
            ai.update(500); // 0.5s
            ai.update(300); // 0.3s
            ai.update(200); // 0.2s
            expect(ai.stateTimer).toBeCloseTo(1.0, 5);
        });

        it('should call updateCircling when state is CIRCLING', () => {
            ai.state = 'CIRCLING';
            ai.updateCircling = vi.fn();
            ai.update(16);
            expect(ai.updateCircling).toHaveBeenCalledWith(0.016);
        });

        it('should call updateLunging when state is LUNGING', () => {
            ai.state = 'LUNGING';
            ai.updateLunging = vi.fn();
            ai.update(16);
            expect(ai.updateLunging).toHaveBeenCalledWith(0.016);
        });

        it('should call updateBiting when state is BITING', () => {
            ai.state = 'BITING';
            ai.updateBiting = vi.fn();
            ai.update(16);
            expect(ai.updateBiting).toHaveBeenCalledWith(0.016);
        });

        it('should call updateRetreating when state is RETREATING', () => {
            ai.state = 'RETREATING';
            ai.updateRetreating = vi.fn();
            ai.update(16);
            expect(ai.updateRetreating).toHaveBeenCalledWith(0.016);
        });

        it('should handle state transitions during update', () => {
            ai.state = 'CIRCLING';
            ai.updateCircling = vi.fn(() => {
                ai.state = 'LUNGING';
            });
            ai.updateLunging = vi.fn();

            ai.update(16);

            // First update calls updateCircling (which changes state to LUNGING)
            expect(ai.updateCircling).toHaveBeenCalledOnce();
            expect(ai.updateLunging).not.toHaveBeenCalled();

            // Second update should now call updateLunging
            ai.update(16);
            expect(ai.updateLunging).toHaveBeenCalledOnce();
        });

        it('should pass delta in seconds to state update methods', () => {
            ai.state = 'CIRCLING';
            ai.updateCircling = vi.fn();

            ai.update(33.33); // ~33ms
            expect(ai.updateCircling).toHaveBeenCalledWith(expect.closeTo(0.033, 2));

            ai.update(16.67); // ~16.67ms
            expect(ai.updateCircling).toHaveBeenCalledWith(expect.closeTo(0.017, 2));
        });

        it('should handle multiple updates with different deltas', () => {
            ai.attackCooldown = 3.0;
            ai.stateTimer = 0;

            ai.update(1000); // 1s
            expect(ai.attackCooldown).toBe(2.0);
            expect(ai.stateTimer).toBe(1.0);

            ai.update(500); // 0.5s
            expect(ai.attackCooldown).toBe(1.5);
            expect(ai.stateTimer).toBe(1.5);

            ai.update(1600); // 1.6s
            expect(ai.attackCooldown).toBe(0);
            expect(ai.stateTimer).toBe(3.1);
        });
    });

    describe('state update methods', () => {
        beforeEach(() => {
            ai = new CompyAI(compy, allCompys, players);
        });

        it('should have updateCircling method', () => {
            expect(typeof ai.updateCircling).toBe('function');
        });

        it('should have updateLunging method', () => {
            expect(typeof ai.updateLunging).toBe('function');
        });

        it('should have updateBiting method', () => {
            expect(typeof ai.updateBiting).toBe('function');
        });

        it('should have updateRetreating method', () => {
            expect(typeof ai.updateRetreating).toBe('function');
        });

        it('updateCircling should accept delta parameter', () => {
            expect(ai.updateCircling.length).toBe(1);
        });

        it('updateLunging should accept delta parameter', () => {
            expect(ai.updateLunging.length).toBe(1);
        });

        it('updateBiting should accept delta parameter', () => {
            expect(ai.updateBiting.length).toBe(1);
        });

        it('updateRetreating should accept delta parameter', () => {
            expect(ai.updateRetreating.length).toBe(1);
        });

        it('state methods should not throw errors when called', () => {
            expect(() => ai.updateCircling(0.016)).not.toThrow();
            expect(() => ai.updateLunging(0.016)).not.toThrow();
            expect(() => ai.updateBiting(0.016)).not.toThrow();
            expect(() => ai.updateRetreating(0.016)).not.toThrow();
        });
    });
});
