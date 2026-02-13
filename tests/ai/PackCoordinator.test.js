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
});
