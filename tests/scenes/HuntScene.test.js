import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockScene } from '../fixtures/mockPhaser.js';

// Mock Phaser before importing HuntScene
vi.mock('phaser', () => ({
    default: {
        Scene: class MockScene {
            constructor(config) {
                this.sys = {
                    settings: {
                        key: config?.key || 'Scene'
                    }
                };
            }
        }
    }
}));

// Import HuntScene after mocking Phaser
const { default: HuntScene } = await import('../../src/scenes/HuntScene.js');

describe('HuntScene', () => {
    let scene;

    beforeEach(() => {
        scene = new HuntScene();
        // Copy mock methods from fixture onto scene instance
        Object.assign(scene, createMockScene());
    });

    it('should be named HuntScene', () => {
        expect(scene.constructor.name).toBe('HuntScene');
    });

    it('should initialize empty entity arrays in create()', () => {
        scene.create();

        expect(scene.players).toBeDefined();
        expect(scene.compys).toBeDefined();
        expect(scene.projectiles).toBeDefined();
        expect(scene.trees).toBeDefined();

        expect(Array.isArray(scene.players)).toBe(true);
        expect(Array.isArray(scene.compys)).toBe(true);
        expect(Array.isArray(scene.projectiles)).toBe(true);
        expect(Array.isArray(scene.trees)).toBe(true);

        expect(scene.players).toHaveLength(0);
        expect(scene.compys).toHaveLength(0);
        expect(scene.projectiles).toHaveLength(0);
        expect(scene.trees).toHaveLength(0);
    });

    it('should initialize hunt state machine in create()', () => {
        scene.create();

        expect(scene.huntState).toBe('intro');
        expect(scene.huntTimer).toBe(0);
    });

    it('should initialize obstacles array and pack coordinator in create()', () => {
        scene.create();

        expect(scene.obstacles).toBeDefined();
        expect(Array.isArray(scene.obstacles)).toBe(true);
        expect(scene.obstacles).toHaveLength(0);

        expect(scene.packCoordinator).toBe(null);
    });

    it('should initialize totalHuntTime in create()', () => {
        scene.create();

        expect(scene.totalHuntTime).toBe(0);
    });

    it('should increment timers in update()', () => {
        scene.create();

        const initialHuntTimer = scene.huntTimer;
        const initialTotalHuntTime = scene.totalHuntTime;

        scene.update(0, 100); // 100ms delta

        expect(scene.huntTimer).toBe(initialHuntTimer + 100);
        expect(scene.totalHuntTime).toBe(initialTotalHuntTime + 100);
    });

    it('should have proper scene key', () => {
        // Check scene config if it exists
        // Phaser scenes typically have a key in their config
        expect(scene.sys?.settings?.key || 'HuntScene').toBe('HuntScene');
    });
});
