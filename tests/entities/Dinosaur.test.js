import { describe, it, expect, beforeEach, vi } from 'vitest';
import Dinosaur from '../../src/entities/Dinosaur.js';
import { createMockScene } from '../fixtures/mockPhaser.js';

describe('Dinosaur', () => {
    let mockScene;

    beforeEach(() => {
        mockScene = createMockScene();
    });

    it('initializes with health and type', () => {
        const dino = new Dinosaur(mockScene, 'compy', 20, 15, 0);
        expect(dino.type).toBe('compy');
        expect(dino.health).toBeGreaterThan(0);
    });

    it('takes damage and dies at 0 health', () => {
        const dino = new Dinosaur(mockScene, 'compy', 20, 15, 0);
        const initialHealth = dino.health;

        dino.takeDamage(5);
        expect(dino.health).toBe(initialHealth - 5);
        expect(dino.isDead).toBe(false);

        dino.takeDamage(initialHealth);
        expect(dino.health).toBe(0);
        expect(dino.isDead).toBe(true);
    });

    it('initializes with weak points based on type', () => {
        const dino = new Dinosaur(mockScene, 'raptor', 20, 15, 0);
        expect(dino.weakPoints).toBeDefined();
        expect(dino.weakPoints.length).toBeGreaterThan(0);
    });

    describe('Dinosaur AI Integration', () => {
        let scene;

        beforeEach(() => {
            scene = createMockScene();
        });

        it('has initializeAI method', () => {
            const dino = new Dinosaur(scene, 'compy', 20, 15, 0);
            expect(dino.initializeAI).toBeDefined();
            expect(typeof dino.initializeAI).toBe('function');
        });

        it('sets ai=null for compy type and logs creation', () => {
            const dino = new Dinosaur(scene, 'compy', 20, 15, 0);
            const consoleSpy = vi.spyOn(console, 'log');

            dino.initializeAI([], []);

            expect(dino.ai).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith('Compy AI slot created');
            consoleSpy.mockRestore();
        });

        it('warns and returns early if initializeAI called twice', () => {
            const dino = new Dinosaur(scene, 'compy', 20, 15, 0);
            const consoleWarnSpy = vi.spyOn(console, 'warn');

            // First call
            dino.initializeAI([], []);
            const firstAI = dino.ai;

            // Second call should warn and not change ai
            dino.ai = { update: vi.fn() }; // Simulate AI being set
            dino.initializeAI([], []);

            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('already has AI initialized'));
            expect(dino.ai).not.toBeNull(); // Should still have the mock AI we set
            consoleWarnSpy.mockRestore();
        });

        it('calls ai.update if ai is present and dinosaur is alive', () => {
            const dino = new Dinosaur(scene, 'compy', 20, 15, 0);

            // Create a mock AI with update method
            const mockAI = {
                update: vi.fn()
            };
            dino.ai = mockAI;

            // Call update
            dino.update(16); // 16ms delta

            // Verify ai.update was called
            expect(mockAI.update).toHaveBeenCalledWith(16);
        });

        it('does NOT call ai.update if dinosaur is dead', () => {
            const dino = new Dinosaur(scene, 'compy', 20, 15, 0);

            // Create a mock AI with update method
            const mockAI = {
                update: vi.fn()
            };
            dino.ai = mockAI;

            // Kill the dinosaur
            dino.isDead = true;

            // Call update
            dino.update(16);

            // Verify ai.update was NOT called
            expect(mockAI.update).not.toHaveBeenCalled();
        });
    });
});
