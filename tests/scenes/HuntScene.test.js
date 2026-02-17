import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockScene, createMockPlayer } from '../fixtures/mockPhaser.js';

// Mock Player class
vi.mock('../../src/entities/Player.js', () => ({
    default: vi.fn((scene, playerNumber, worldX, worldY) => {
        return createMockPlayer(playerNumber, worldX, worldY);
    })
}));

// Mock InputManager
vi.mock('../../src/systems/InputManager.js', () => ({
    default: vi.fn(() => ({
        setupKeyboard: vi.fn(),
        getPlayerInput: vi.fn(() => null),
        getPlayerInputWithKeyboard: vi.fn(() => null),
        getDPadDirection: vi.fn(() => ({ x: 0, y: 0 }))
    }))
}));

// Mock SessionManager
vi.mock('../../src/systems/SessionManager.js', () => ({
    gameSession: {
        currentHunt: 1,
        totalHunts: 5,
        playerData: [
            { playerIndex: 0, score: 0, weapon: 'stone-spear' },
            { playerIndex: 1, score: 0, weapon: 'stone-spear' },
            { playerIndex: 2, score: 0, weapon: 'stone-spear' },
            { playerIndex: 3, score: 0, weapon: 'stone-spear' }
        ]
    }
}));

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
const { default: HuntScene, JUNGLE_ARENA } = await import('../../src/scenes/HuntScene.js');

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

    it('should initialize entity arrays in create()', () => {
        scene.create();

        expect(scene.players).toBeDefined();
        expect(scene.compys).toBeDefined();
        expect(scene.projectiles).toBeDefined();

        expect(Array.isArray(scene.players)).toBe(true);
        expect(Array.isArray(scene.compys)).toBe(true);
        expect(Array.isArray(scene.projectiles)).toBe(true);

        expect(scene.players).toHaveLength(4);
        expect(scene.compys).toHaveLength(5);
        expect(scene.projectiles).toHaveLength(0);
    });

    it('should initialize hunt state machine in create()', () => {
        scene.create();

        expect(scene.huntState).toBe('active');
        expect(scene.huntTimer).toBe(0);
    });

    it('should initialize totalHuntTime in create()', () => {
        scene.create();

        expect(scene.totalHuntTime).toBe(0);
    });

    it('should initialize packCoordinator in create()', () => {
        scene.create();

        expect(scene.packCoordinator).toBeDefined();
    });

    it('should initialize cameraController in create()', () => {
        scene.create();

        expect(scene.cameraController).toBeDefined();
    });

    it('should have proper scene key', () => {
        expect(scene.sys?.settings?.key || 'HuntScene').toBe('HuntScene');
    });

    it('should increment timers in update()', () => {
        scene.create();

        const initialHuntTimer = scene.huntTimer;
        const initialTotalHuntTime = scene.totalHuntTime;

        scene.update(0, 100); // 100ms delta

        expect(scene.huntTimer).toBe(initialHuntTimer + 100);
        expect(scene.totalHuntTime).toBe(initialTotalHuntTime + 100);
    });

    describe('JUNGLE_ARENA data', () => {
        it('defines arena width', () => {
            expect(JUNGLE_ARENA.width).toBe(80);
        });

        it('defines 3 platforms', () => {
            expect(JUNGLE_ARENA.platforms).toHaveLength(3);
            JUNGLE_ARENA.platforms.forEach(p => {
                expect(p).toHaveProperty('x');
                expect(p).toHaveProperty('y');
                expect(p).toHaveProperty('width');
            });
        });

        it('defines 4 spawn points', () => {
            expect(JUNGLE_ARENA.spawnPoints).toHaveLength(4);
        });

        it('defines 2 enemy spawn points', () => {
            expect(JUNGLE_ARENA.enemySpawnPoints).toHaveLength(2);
        });
    });

    describe('arena building', () => {
        it('buildArena() calls add.rectangle for background and platforms', () => {
            const rectangleSpy = vi.spyOn(scene.add, 'rectangle');

            scene.buildArena();

            // Background + ground + 3 platforms = at least 5 rectangles
            expect(rectangleSpy).toHaveBeenCalled();
            expect(rectangleSpy.mock.calls.length).toBeGreaterThanOrEqual(5);
        });
    });

    describe('player spawning', () => {
        it('spawnPlayers() creates 4 players at JUNGLE_ARENA spawn points', () => {
            scene.create();

            expect(scene.players).toHaveLength(4);

            JUNGLE_ARENA.spawnPoints.forEach((spawnPoint, index) => {
                const player = scene.players[index];
                expect(player.worldX).toBe(spawnPoint.x);
                expect(player.worldY).toBe(spawnPoint.y);
                expect(player.playerNumber).toBe(index);
            });
        });

        it('spawnPlayers() sets player moveSpeed to 8', () => {
            scene.create();

            scene.players.forEach(player => {
                expect(player.moveSpeed).toBe(8);
            });
        });
    });

    describe('player animations', () => {
        it('createPlayerAnimations() creates idle animations for all 4 players', () => {
            scene.create();

            const createSpy = vi.spyOn(scene.anims, 'create');
            scene.createPlayerAnimations();

            const idleAnimCalls = createSpy.mock.calls.filter(call =>
                call[0]?.key?.match(/player-\d-idle$/)
            );
            expect(idleAnimCalls.length).toBe(4);
        });

        it('createPlayerAnimations() creates run animations for all 4 players', () => {
            scene.create();

            const createSpy = vi.spyOn(scene.anims, 'create');
            scene.createPlayerAnimations();

            const runAnimCalls = createSpy.mock.calls.filter(call =>
                call[0]?.key?.match(/player-\d-run$/)
            );
            expect(runAnimCalls.length).toBe(4);
        });

        it('createPlayerAnimations() creates jump and fall animations', () => {
            scene.create();

            const createSpy = vi.spyOn(scene.anims, 'create');
            scene.createPlayerAnimations();

            const jumpCalls = createSpy.mock.calls.filter(call =>
                call[0]?.key?.match(/player-\d-jump$/)
            );
            const fallCalls = createSpy.mock.calls.filter(call =>
                call[0]?.key?.match(/player-\d-fall$/)
            );
            expect(jumpCalls.length).toBe(4);
            expect(fallCalls.length).toBe(4);
        });
    });

    describe('preload', () => {
        it('preload() loads 4 player atlases and the compy atlas', () => {
            const atlasSpy = vi.spyOn(scene.load, 'atlas');

            scene.preload();

            expect(atlasSpy).toHaveBeenCalledTimes(5); // 4 players + compy

            const colors = ['red', 'blue', 'yellow', 'green'];
            colors.forEach((color, index) => {
                expect(atlasSpy).toHaveBeenCalledWith(
                    `player-${index}`,
                    `/assets/generated/spritesheets/${color}-hero.png`,
                    `/assets/generated/spritesheets/${color}-hero.json`
                );
            });
            expect(atlasSpy).toHaveBeenCalledWith(
                'compy',
                '/assets/generated/spritesheets/compy.png',
                '/assets/generated/spritesheets/compy.json'
            );
        });
    });

    describe('hunt completion', () => {
        it('checkHuntCompletion() sets huntState to victory when all compys dead', () => {
            scene.create();
            scene.compys.forEach(c => { c.isDead = true; });

            scene.checkHuntCompletion();

            expect(scene.huntState).toBe('victory');
        });

        it('checkHuntCompletion() sets huntState to failure when all players downed', () => {
            scene.create();
            scene.players.forEach(p => { p.isDowned = true; });

            scene.checkHuntCompletion();

            expect(scene.huntState).toBe('failure');
        });
    });
});
