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

        it('calls updateVisualState after ai.update', () => {
            const dino = new Dinosaur(scene, 'compy', 20, 15, 0);

            // Mock AI with update method
            const mockAI = {
                update: vi.fn(),
                state: 'CIRCLING',
                stateTimer: 0
            };
            dino.ai = mockAI;

            // Spy on updateVisualState
            const updateVisualStateSpy = vi.spyOn(dino, 'updateVisualState');

            // Call update
            dino.update(16);

            // Verify updateVisualState was called
            expect(updateVisualStateSpy).toHaveBeenCalled();
        });
    });

    describe('Visual State System', () => {
        let scene;
        let dino;
        let mockAI;

        beforeEach(() => {
            scene = createMockScene();
            dino = new Dinosaur(scene, 'compy', 20, 15, 0);

            // Mock AI with state tracking
            mockAI = {
                state: 'CIRCLING',
                stateTimer: 0,
                update: vi.fn()
            };
            dino.ai = mockAI;

            // Clear mock calls from construction
            dino.sprite.setTint.mockClear();
            dino.sprite.setAlpha.mockClear();
        });

        it('returns early if no AI present', () => {
            dino.ai = null;
            expect(() => dino.updateVisualState()).not.toThrow();
        });

        it('resets to default appearance for CIRCLING state', () => {
            mockAI.state = 'CIRCLING';
            dino.updateVisualState();

            expect(dino.sprite.setTint).toHaveBeenCalledWith(0xffffff);
            expect(dino.sprite.setAlpha).toHaveBeenCalledWith(1.0);
        });

        describe('LUNGING state visual feedback', () => {
            beforeEach(() => {
                mockAI.state = 'LUNGING';
            });

            it('applies red tint during telegraph phase (< 0.5s)', () => {
                mockAI.stateTimer = 0.3;
                dino.updateVisualState();

                expect(dino.sprite.setTint).toHaveBeenCalledWith(0xff0000);
            });

            it('applies pulsing alpha during telegraph phase', () => {
                mockAI.stateTimer = 0.3;
                dino.updateVisualState();

                // Check that setAlpha was called (value will vary based on sin calculation)
                expect(dino.sprite.setAlpha).toHaveBeenCalled();
                const alphaValue = dino.sprite.setAlpha.mock.calls[dino.sprite.setAlpha.mock.calls.length - 1][0];
                expect(alphaValue).toBeGreaterThanOrEqual(0.4);
                expect(alphaValue).toBeLessThanOrEqual(1.0);
            });

            it('applies brighter red during charge phase (>= 0.5s)', () => {
                mockAI.stateTimer = 0.6;
                dino.updateVisualState();

                expect(dino.sprite.setTint).toHaveBeenCalledWith(0xffaaaa);
            });

            it('transitions from telegraph to charge tint at 0.5s', () => {
                // Telegraph
                mockAI.stateTimer = 0.49;
                dino.updateVisualState();
                expect(dino.sprite.setTint).toHaveBeenCalledWith(0xff0000);

                // Charge
                mockAI.stateTimer = 0.5;
                dino.updateVisualState();
                expect(dino.sprite.setTint).toHaveBeenCalledWith(0xffaaaa);
            });
        });

        describe('BITING state visual feedback', () => {
            beforeEach(() => {
                mockAI.state = 'BITING';
            });

            it('applies white flash during first 0.1s', () => {
                mockAI.stateTimer = 0.05;
                dino.updateVisualState();

                expect(dino.sprite.setTint).toHaveBeenCalledWith(0xffffff);
            });

            it('returns to default after 0.1s', () => {
                mockAI.stateTimer = 0.2;
                dino.updateVisualState();

                // Should have called setTint twice - once to reset, once for state (which doesn't apply)
                expect(dino.sprite.setTint).toHaveBeenCalledWith(0xffffff);
            });

            it('no special tint at exactly 0.1s', () => {
                mockAI.stateTimer = 0.1;
                dino.updateVisualState();

                // Reset tint should be applied (white)
                expect(dino.sprite.setTint).toHaveBeenCalledWith(0xffffff);
                // setTint is called once for reset
                const calls = dino.sprite.setTint.mock.calls;
                expect(calls.length).toBe(1);
                expect(calls[0][0]).toBe(0xffffff);
            });
        });

        describe('RETREATING state visual feedback', () => {
            beforeEach(() => {
                mockAI.state = 'RETREATING';
            });

            it('applies faded alpha (0.8)', () => {
                dino.updateVisualState();

                expect(dino.sprite.setAlpha).toHaveBeenCalledWith(0.8);
            });

            it('resets tint to white', () => {
                dino.updateVisualState();

                expect(dino.sprite.setTint).toHaveBeenCalledWith(0xffffff);
            });
        });

        it('always resets tint and alpha before applying state effects', () => {
            mockAI.state = 'LUNGING';
            mockAI.stateTimer = 0.3;

            dino.updateVisualState();

            // Check that reset happens first
            const tintCalls = dino.sprite.setTint.mock.calls;
            const alphaCalls = dino.sprite.setAlpha.mock.calls;

            // First call should be reset to white
            expect(tintCalls[0][0]).toBe(0xffffff);
            // Then state-specific red tint
            expect(tintCalls[1][0]).toBe(0xff0000);

            // First alpha call should be reset to 1.0
            expect(alphaCalls[0][0]).toBe(1.0);
            // Then pulsing alpha
            expect(alphaCalls[1][0]).toBeGreaterThanOrEqual(0.4);
            expect(alphaCalls[1][0]).toBeLessThanOrEqual(1.0);
        });
    });
});
