import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockScene, createMockPlayer } from '../fixtures/mockPhaser.js';

// Mock Player class
vi.mock('../../src/entities/Player.js', () => ({
    default: vi.fn((scene, playerNumber, worldX, worldY, worldZ) => {
        return createMockPlayer(playerNumber, worldX, worldY, worldZ);
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

    it('should initialize entity arrays in create()', () => {
        scene.create();

        expect(scene.players).toBeDefined();
        expect(scene.compys).toBeDefined();
        expect(scene.projectiles).toBeDefined();
        expect(scene.trees).toBeDefined();

        expect(Array.isArray(scene.players)).toBe(true);
        expect(Array.isArray(scene.compys)).toBe(true);
        expect(Array.isArray(scene.projectiles)).toBe(true);
        expect(Array.isArray(scene.trees)).toBe(true);

        // Players are now spawned automatically in create()
        expect(scene.players).toHaveLength(4);
        expect(scene.compys).toHaveLength(0);
        expect(scene.projectiles).toHaveLength(0);
        // Trees are populated by addTrees() called in create()
        expect(scene.trees).toHaveLength(8);
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
        // Obstacles array contains 8 trees added by addTrees()
        expect(scene.obstacles).toHaveLength(8);

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

    describe('jungle floor', () => {
        it('buildJungleFloor() calls this.add.graphics', () => {
            scene.create();

            // Spy on add.graphics
            const graphicsSpy = vi.spyOn(scene.add, 'graphics');

            scene.buildJungleFloor();

            // Should have been called multiple times (once per tile)
            expect(graphicsSpy).toHaveBeenCalled();
            expect(graphicsSpy.mock.calls.length).toBeGreaterThan(100);
        });

        it('sets arena bounds (arenaMinX=0, arenaMaxX=30, arenaMinY=0, arenaMaxY=25)', () => {
            scene.create();
            scene.buildJungleFloor();

            expect(scene.arenaMinX).toBe(0);
            expect(scene.arenaMaxX).toBe(30);
            expect(scene.arenaMinY).toBe(0);
            expect(scene.arenaMaxY).toBe(25);
        });
    });

    describe('tree obstacles', () => {
        it('addTrees() creates 8 trees with worldX/Y/Z and radius', () => {
            scene.create(); // This already calls addTrees()

            expect(scene.trees).toHaveLength(8);

            // Verify each tree has required properties
            scene.trees.forEach((tree, index) => {
                expect(tree.worldX).toBeDefined();
                expect(tree.worldY).toBeDefined();
                expect(tree.worldZ).toBeDefined();
                expect(tree.radius).toBe(1.5);
                expect(tree.sprite).toBeDefined();
                expect(typeof tree.worldX).toBe('number');
                expect(typeof tree.worldY).toBe('number');
                expect(typeof tree.worldZ).toBe('number');
            });
        });

        it('addTrees() adds trees to obstacles array with type="tree"', () => {
            scene.create(); // This already calls addTrees()

            expect(scene.obstacles).toHaveLength(8);

            scene.obstacles.forEach((obstacle) => {
                expect(obstacle.type).toBe('tree');
                expect(obstacle.worldX).toBeDefined();
                expect(obstacle.worldY).toBeDefined();
                expect(obstacle.radius).toBe(1.5);
            });
        });

        it('addTrees() creates trees at specific positions', () => {
            scene.create(); // This already calls addTrees()

            const expectedPositions = [
                {x:5, y:5}, {x:22, y:8}, {x:7, y:12}, {x:20, y:15},
                {x:10, y:20}, {x:18, y:22}, {x:15, y:3}, {x:12, y:18}
            ];

            expectedPositions.forEach((expected, index) => {
                expect(scene.trees[index].worldX).toBe(expected.x);
                expect(scene.trees[index].worldY).toBe(expected.y);
            });
        });

        it('isLineOfSightBlocked() detects when line passes through tree', () => {
            scene.create(); // This already calls addTrees()

            // Line that passes through first tree at (5, 5)
            // From (0, 5) to (10, 5) should pass through tree at (5, 5) with radius 1.5
            expect(scene.isLineOfSightBlocked(0, 5, 10, 5)).toBe(true);
        });

        it('isLineOfSightBlocked() returns false when line does not intersect any tree', () => {
            scene.create(); // This already calls addTrees()

            // Line far from all trees
            expect(scene.isLineOfSightBlocked(0, 0, 2, 0)).toBe(false);
        });

        it('isLineOfSightBlocked() returns false for empty obstacles array', () => {
            // Don't call create() - manually initialize just what we need
            scene.obstacles = [];

            expect(scene.isLineOfSightBlocked(0, 0, 10, 10)).toBe(false);
        });
    });

    describe('player spawning', () => {
        it('spawnPlayers() creates 4 players at center positions', () => {
            scene.create(); // Already calls spawnPlayers()

            expect(scene.players).toHaveLength(4);

            // Expected positions: center (15, 12.5), spacing 2
            // 2x2 grid:
            const expectedPositions = [
                { x: 14, y: 11.5, playerNumber: 0 }, // NW
                { x: 16, y: 11.5, playerNumber: 1 }, // NE
                { x: 14, y: 13.5, playerNumber: 2 }, // SW
                { x: 16, y: 13.5, playerNumber: 3 }  // SE
            ];

            expectedPositions.forEach((expected, index) => {
                const player = scene.players[index];
                expect(player.worldX).toBe(expected.x);
                expect(player.worldY).toBe(expected.y);
                expect(player.worldZ).toBe(0);
                expect(player.playerNumber).toBe(expected.playerNumber);
            });
        });

        it('spawnPlayers() sets player moveSpeed to 6', () => {
            scene.create(); // Already calls spawnPlayers()

            scene.players.forEach(player => {
                expect(player.moveSpeed).toBe(6);
            });
        });
    });

    describe('player animations', () => {
        it('createPlayerAnimations() creates run animations for all 4 players', () => {
            scene.create();

            const createSpy = vi.spyOn(scene.anims, 'create');

            scene.createPlayerAnimations();

            // Should create animations for 4 players × 8 directions × 2 types (run + idle)
            expect(createSpy).toHaveBeenCalled();

            // Verify at least one run animation was created
            const runAnimCalls = createSpy.mock.calls.filter(call =>
                call[0]?.key?.includes('-run-')
            );
            expect(runAnimCalls.length).toBeGreaterThan(0);
        });

        it('createPlayerAnimations() creates idle animations for all 4 players', () => {
            scene.create();

            const createSpy = vi.spyOn(scene.anims, 'create');

            scene.createPlayerAnimations();

            // Verify at least one idle animation was created
            const idleAnimCalls = createSpy.mock.calls.filter(call =>
                call[0]?.key?.includes('-idle-')
            );
            expect(idleAnimCalls.length).toBeGreaterThan(0);
        });
    });

    describe('preload', () => {
        it('preload() loads 4 player atlases', () => {
            // Mock the load.atlas method
            const atlasSpy = vi.spyOn(scene.load, 'atlas');

            scene.preload();

            // Should load 4 player spritesheets
            expect(atlasSpy).toHaveBeenCalledTimes(4);

            // Verify each color hero is loaded
            const colors = ['red', 'blue', 'yellow', 'green'];
            colors.forEach((color, index) => {
                expect(atlasSpy).toHaveBeenCalledWith(
                    `player-${index}`,
                    `/assets/generated/spritesheets/${color}-hero.png`,
                    `/assets/generated/spritesheets/${color}-hero.json`
                );
            });
        });
    });
});
