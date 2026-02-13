import { describe, it, expect, beforeEach, vi } from 'vitest';
import PackCoordinator from '../../src/ai/PackCoordinator.js';
import { createMockCompy, createMockPlayer } from '../fixtures/mockPhaser.js';

describe('PackCoordinator', () => {
    let compys;
    let players;
    let coordinator;

    beforeEach(() => {
        compys = [
            createMockCompy(20, 15, 0),
            createMockCompy(22, 16, 0),
            createMockCompy(18, 14, 0)
        ];
        players = [
            createMockPlayer(0, 15, 12, 0),
            createMockPlayer(1, 16, 13, 0)
        ];
    });

    describe('initialization', () => {
        it('should store references to compys and players', () => {
            coordinator = new PackCoordinator(compys, players);
            expect(coordinator.compys).toBe(compys);
            expect(coordinator.players).toBe(players);
        });

        it('should initialize with empty attackPatterns array', () => {
            coordinator = new PackCoordinator(compys, players);
            expect(coordinator.attackPatterns).toEqual([]);
        });

        it('should initialize coordinationTimer to 2.0', () => {
            coordinator = new PackCoordinator(compys, players);
            expect(coordinator.coordinationTimer).toBe(2.0);
        });

        it('should initialize coordinationInterval to 2.0', () => {
            coordinator = new PackCoordinator(compys, players);
            expect(coordinator.coordinationInterval).toBe(2.0);
        });
    });

    describe('update', () => {
        beforeEach(() => {
            coordinator = new PackCoordinator(compys, players);
        });

        it('should decrement coordinationTimer by delta in seconds', () => {
            coordinator.coordinationTimer = 1.5;
            coordinator.update(500); // 0.5s
            expect(coordinator.coordinationTimer).toBe(1.0);
        });

        it('should reset coordinationTimer when it expires', () => {
            coordinator.coordinationTimer = 0.3;
            coordinator.coordinationInterval = 2.0;
            coordinator.update(500); // 0.5s - timer expires
            expect(coordinator.coordinationTimer).toBe(2.0);
        });

        it('should call analyzeAndCoordinate when timer expires', () => {
            coordinator.coordinationTimer = 0.1;
            coordinator.analyzeAndCoordinate = vi.fn();
            coordinator.update(200); // 0.2s - timer will expire
            expect(coordinator.analyzeAndCoordinate).toHaveBeenCalledOnce();
        });

        it('should reset coordinationTimer to interval when timer expires', () => {
            coordinator.coordinationTimer = 0.1;
            coordinator.coordinationInterval = 3.0;
            coordinator.update(200); // 0.2s
            expect(coordinator.coordinationTimer).toBe(3.0);
        });

        it('should not call analyzeAndCoordinate if timer has not expired', () => {
            coordinator.coordinationTimer = 1.5;
            coordinator.analyzeAndCoordinate = vi.fn();
            coordinator.update(200); // 0.2s
            expect(coordinator.analyzeAndCoordinate).not.toHaveBeenCalled();
        });

        it('should call processAttackPatterns every update', () => {
            coordinator.processAttackPatterns = vi.fn();
            coordinator.update(16);
            expect(coordinator.processAttackPatterns).toHaveBeenCalledWith(0.016);
        });

        it('should call processAttackPatterns with delta in seconds', () => {
            coordinator.processAttackPatterns = vi.fn();
            coordinator.update(33.33);
            expect(coordinator.processAttackPatterns).toHaveBeenCalledWith(expect.closeTo(0.033, 2));
        });
    });

    describe('analyzeAndCoordinate', () => {
        beforeEach(() => {
            coordinator = new PackCoordinator(compys, players);
        });

        it('should call assignTargets', () => {
            coordinator.assignTargets = vi.fn();
            coordinator.analyzeAndCoordinate();
            expect(coordinator.assignTargets).toHaveBeenCalledOnce();
        });

        it('should call scheduleCoordinatedAttacks after assignTargets', () => {
            coordinator.assignTargets = vi.fn();
            coordinator.scheduleCoordinatedAttacks = vi.fn();
            coordinator.analyzeAndCoordinate();
            expect(coordinator.scheduleCoordinatedAttacks).toHaveBeenCalledOnce();
        });

        it('should call assignTargets before scheduleCoordinatedAttacks', () => {
            const callOrder = [];
            coordinator.assignTargets = vi.fn(() => callOrder.push('assign'));
            coordinator.scheduleCoordinatedAttacks = vi.fn(() => callOrder.push('schedule'));
            coordinator.analyzeAndCoordinate();
            expect(callOrder).toEqual(['assign', 'schedule']);
        });
    });

    describe('placeholder methods', () => {
        beforeEach(() => {
            coordinator = new PackCoordinator(compys, players);
        });

        it('should have assignTargets method', () => {
            expect(typeof coordinator.assignTargets).toBe('function');
        });

        it('should have scheduleCoordinatedAttacks method', () => {
            expect(typeof coordinator.scheduleCoordinatedAttacks).toBe('function');
        });

        it('should have processAttackPatterns method', () => {
            expect(typeof coordinator.processAttackPatterns).toBe('function');
        });

        it('assignTargets should not throw', () => {
            expect(() => coordinator.assignTargets()).not.toThrow();
        });

        it('scheduleCoordinatedAttacks should not throw', () => {
            expect(() => coordinator.scheduleCoordinatedAttacks()).not.toThrow();
        });

        it('processAttackPatterns should not throw', () => {
            expect(() => coordinator.processAttackPatterns(0.016)).not.toThrow();
        });
    });

    describe('getPriorityTargets', () => {
        beforeEach(() => {
            coordinator = new PackCoordinator(compys, players);
        });

        it('should identify isolated players (>5 units from all teammates)', () => {
            // Both players are isolated from each other (distance ~18 units)
            players[0].worldX = 5;
            players[0].worldY = 5;
            players[1].worldX = 20;
            players[1].worldY = 15;

            const priorities = coordinator.getPriorityTargets();
            expect(priorities.isolated).toContain(players[0]);
            expect(priorities.isolated).toContain(players[1]);
            expect(priorities.isolated.length).toBe(2);
        });

        it('should identify low-health players (health <= 1)', () => {
            players[0].health = 0.5;
            players[1].health = 1.5;

            const priorities = coordinator.getPriorityTargets();
            expect(priorities.lowHealth).toContain(players[0]);
            expect(priorities.lowHealth).not.toContain(players[1]);
        });

        it('should include players with exactly 1 health as low-health', () => {
            players[0].health = 1.0;
            players[1].health = 1.5;

            const priorities = coordinator.getPriorityTargets();
            expect(priorities.lowHealth).toContain(players[0]);
        });

        it('should only return alive players', () => {
            players[0].isDowned = true;
            players[1].health = 0.5;
            players[1].isDowned = false;

            const priorities = coordinator.getPriorityTargets();
            expect(priorities.isolated).not.toContain(players[0]);
            expect(priorities.lowHealth).not.toContain(players[0]);
        });

        it('should skip dead players', () => {
            players[0].isDead = true;
            players[1].health = 0.5;
            players[1].isDead = false;

            const priorities = coordinator.getPriorityTargets();
            expect(priorities.isolated).not.toContain(players[0]);
            expect(priorities.lowHealth).not.toContain(players[0]);
        });

        it('should return empty arrays if no players meet criteria', () => {
            // All players are grouped and healthy
            players[0].worldX = 15;
            players[0].worldY = 12;
            players[0].health = 2.0;
            players[1].worldX = 16;
            players[1].worldY = 13;
            players[1].health = 2.0;

            const priorities = coordinator.getPriorityTargets();
            expect(priorities.isolated).toEqual([]);
            expect(priorities.lowHealth).toEqual([]);
        });

        it('should identify multiple isolated players', () => {
            players[0].worldX = 5;
            players[0].worldY = 5;
            players[1].worldX = 25;
            players[1].worldY = 20;

            const priorities = coordinator.getPriorityTargets();
            expect(priorities.isolated.length).toBe(2);
            expect(priorities.isolated).toContain(players[0]);
            expect(priorities.isolated).toContain(players[1]);
        });

        it('should identify multiple low-health players', () => {
            players[0].health = 0.5;
            players[1].health = 0.8;

            const priorities = coordinator.getPriorityTargets();
            expect(priorities.lowHealth.length).toBe(2);
            expect(priorities.lowHealth).toContain(players[0]);
            expect(priorities.lowHealth).toContain(players[1]);
        });

        it('should calculate distance correctly for isolation', () => {
            // Player 0 at (0, 0), Player 1 at (5, 0) = exactly 5 units
            // Not isolated (needs >5)
            players[0].worldX = 0;
            players[0].worldY = 0;
            players[1].worldX = 5;
            players[1].worldY = 0;

            const priorities = coordinator.getPriorityTargets();
            expect(priorities.isolated).toEqual([]);
        });

        it('should detect isolation with exactly >5 units', () => {
            // Player 0 at (0, 0), Player 1 at (5.1, 0) = 5.1 units
            // Both are isolated from each other
            players[0].worldX = 0;
            players[0].worldY = 0;
            players[1].worldX = 5.1;
            players[1].worldY = 0;

            const priorities = coordinator.getPriorityTargets();
            expect(priorities.isolated.length).toBe(2);
        });
    });

    describe('assignTargets', () => {
        beforeEach(() => {
            coordinator = new PackCoordinator(compys, players);
            // Add AI objects to compys for testing
            compys.forEach(compy => {
                compy.ai = { target: null };
            });
        });

        it('should assign 2-3 compys to isolated players', () => {
            // Create 5 compys for better testing
            compys = [
                createMockCompy(20, 15, 0),
                createMockCompy(22, 16, 0),
                createMockCompy(18, 14, 0),
                createMockCompy(19, 15, 0),
                createMockCompy(21, 16, 0)
            ];
            compys.forEach(compy => {
                compy.ai = { target: null };
            });

            // Make player 0 isolated
            players[0].worldX = 5;
            players[0].worldY = 5;
            players[1].worldX = 20;
            players[1].worldY = 15;

            coordinator = new PackCoordinator(compys, players);
            coordinator.assignTargets();

            // Count how many compys are targeting the isolated player
            const targetingIsolated = compys.filter(c => c.ai.target === players[0]).length;
            expect(targetingIsolated).toBeGreaterThanOrEqual(2);
            expect(targetingIsolated).toBeLessThanOrEqual(3);
        });

        it('should assign 2 compys to low-health players from priority system', () => {
            // Create exactly 2 compys to test priority assignment without spreading
            compys = [
                createMockCompy(20, 15, 0),
                createMockCompy(22, 16, 0)
            ];
            compys.forEach(compy => {
                compy.ai = { target: null };
            });

            // Make player 0 low-health (not isolated)
            players[0].health = 0.5;
            players[0].worldX = 15;
            players[0].worldY = 12;
            players[1].worldX = 16;
            players[1].worldY = 13;

            coordinator = new PackCoordinator(compys, players);
            coordinator.assignTargets();

            // Both compys should target the low-health player
            const targetingLowHealth = compys.filter(c => c.ai.target === players[0]).length;
            expect(targetingLowHealth).toBe(2);
        });

        it('should spread remaining compys evenly across all players', () => {
            // No priority targets - should spread evenly
            players[0].worldX = 15;
            players[0].worldY = 12;
            players[0].health = 2.0;
            players[1].worldX = 16;
            players[1].worldY = 13;
            players[1].health = 2.0;

            coordinator.assignTargets();

            // Count assignments per player
            const player0Count = compys.filter(c => c.ai.target === players[0]).length;
            const player1Count = compys.filter(c => c.ai.target === players[1]).length;

            // Should be roughly even (difference of at most 1)
            expect(Math.abs(player0Count - player1Count)).toBeLessThanOrEqual(1);
        });

        it('should assign all compys to targets', () => {
            coordinator.assignTargets();

            // Every compy should have a target
            compys.forEach(compy => {
                expect(compy.ai.target).not.toBeNull();
            });
        });

        it('should prioritize isolated over low-health', () => {
            compys = [];
            for (let i = 0; i < 5; i++) {
                const compy = createMockCompy(20 + i, 15, 0);
                compy.ai = { target: null };
                compys.push(compy);
            }

            // Player 0 is isolated, Player 1 is low-health
            players[0].worldX = 5;
            players[0].worldY = 5;
            players[0].health = 2.0;
            players[1].worldX = 20;
            players[1].worldY = 15;
            players[1].health = 0.5;

            coordinator = new PackCoordinator(compys, players);
            coordinator.assignTargets();

            // Isolated player should get 2-3 compys
            const isolatedCount = compys.filter(c => c.ai.target === players[0]).length;
            expect(isolatedCount).toBeGreaterThanOrEqual(2);
            expect(isolatedCount).toBeLessThanOrEqual(3);

            // Low-health player should get 2 compys
            const lowHealthCount = compys.filter(c => c.ai.target === players[1]).length;
            expect(lowHealthCount).toBe(2);
        });

        it('should handle case with no alive players', () => {
            players[0].isDowned = true;
            players[1].isDead = true;

            expect(() => coordinator.assignTargets()).not.toThrow();
        });

        it('should only assign to alive players', () => {
            players[0].isDowned = true;
            players[1].isDowned = false;

            coordinator.assignTargets();

            // All compys should target player 1
            compys.forEach(compy => {
                expect(compy.ai.target).toBe(players[1]);
            });
        });
    });
});
