import Phaser from 'phaser';
import { worldToScreen, PIXELS_PER_UNIT, SCREEN_WIDTH, DEPTH_LAYERS } from '../systems/CoordinateSystem.js';
import { updatePlayerAnimation, getPlayerAnimationKey } from '../systems/SpriteDirectionSystem.js';
import { applyGravity, checkPlatform } from '../systems/PhysicsManager.js';
import Player from '../entities/Player.js';
import Dinosaur from '../entities/Dinosaur.js';
import InputManager from '../systems/InputManager.js';
import CameraController from '../systems/CameraController.js';
import PackCoordinator from '../ai/PackCoordinator.js';
import CompyAI from '../ai/CompyAI.js';
import { gameSession } from '../systems/SessionManager.js';

/**
 * Jungle arena layout in world units.
 * worldX = horizontal, worldY = vertical height (0 = ground level)
 */
export const JUNGLE_ARENA = {
    width: 80,           // world units wide
    platforms: [
        { x: 10, y: 5, width: 8 },   // left mid platform
        { x: 35, y: 8, width: 6 },   // center high platform
        { x: 60, y: 5, width: 8 },   // right mid platform
    ],
    spawnPoints: [
        { x: 15, y: 0 },  // player 1
        { x: 20, y: 0 },  // player 2
        { x: 25, y: 0 },  // player 3
        { x: 30, y: 0 },  // player 4
    ],
    enemySpawnPoints: [
        { x: 5,  y: 0 },  // left edge
        { x: 75, y: 0 },  // right edge
    ],
};

/**
 * HuntScene - Compy Pack Hunt (sidescroller)
 *
 * Players fight 5 Compys in a jungle sidescroller arena.
 * Features pack AI coordination, gravity, and platform traversal.
 */
export default class HuntScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HuntScene' });
    }

    preload() {
        // Load player spritesheets
        const colors = ['red', 'blue', 'yellow', 'green'];
        colors.forEach((color, index) => {
            this.load.atlas(
                `player-${index}`,
                `/assets/generated/spritesheets/${color}-hero.png`,
                `/assets/generated/spritesheets/${color}-hero.json`
            );
        });

        // Load Compy sprite (temporary - M6 will replace with proper side-view sprites)
        this.load.image('compy-south', '/assets/enemies/compy-dino/rotations/south.png');
    }

    create() {
        // Hunt state machine: active → victory/failure
        this.huntState = 'active';

        // Timers
        this.huntTimer = 0;
        this.totalHuntTime = 0;

        // Entity arrays
        this.players = [];
        this.compys = [];
        this.projectiles = [];

        // Initialize input manager
        this.inputManager = new InputManager(this);
        this.inputManager.setupKeyboard();

        // Build arena background and platforms
        this.buildArena();

        // Spawn players and create animations
        this.spawnPlayers();
        this.createPlayerAnimations();

        // Spawn enemies
        this.spawnCompys();

        // Initialize camera controller
        this.cameraController = new CameraController(this.cameras.main);

        console.log('HuntScene ready: sidescroller jungle arena');
    }

    /**
     * Draw background color fill and platform rectangles.
     * Platforms are defined in JUNGLE_ARENA and rendered as colored rects.
     * Placeholder visuals - M6 will replace with tileset sprites.
     */
    buildArena() {
        // Dark jungle background (full arena width)
        const arenaScreenWidth = JUNGLE_ARENA.width * PIXELS_PER_UNIT;

        // Background - deep green fill
        const bg = this.add.rectangle(
            arenaScreenWidth / 2, 0,
            arenaScreenWidth, 2000,
            0x1a3d1a
        );
        bg.setDepth(DEPTH_LAYERS.BACKGROUND);
        bg.setOrigin(0.5, 0);

        // Ground platform - full width of arena, at screen Y for worldY=0
        const groundScreenY = worldToScreen(0, 0).y;
        const ground = this.add.rectangle(
            arenaScreenWidth / 2, groundScreenY,
            arenaScreenWidth, 40,
            0x5c3d1a
        );
        ground.setDepth(DEPTH_LAYERS.PLATFORMS);
        ground.setOrigin(0.5, 0);

        // Elevated platforms
        for (const platform of JUNGLE_ARENA.platforms) {
            const leftX  = (platform.x - platform.width / 2) * PIXELS_PER_UNIT;
            const topY   = worldToScreen(0, platform.y).y;
            const pxWidth  = platform.width * PIXELS_PER_UNIT;
            const pxHeight = 20;

            const rect = this.add.rectangle(leftX, topY, pxWidth, pxHeight, 0x5c3d1a);
            rect.setDepth(DEPTH_LAYERS.PLATFORMS);
            rect.setOrigin(0, 0.5);
        }
    }

    /**
     * Spawn 4 players at arena spawn points
     */
    spawnPlayers() {
        JUNGLE_ARENA.spawnPoints.forEach((spawnPoint, index) => {
            const player = new Player(this, index, spawnPoint.x, spawnPoint.y);
            player.moveSpeed = 8;
            this.players.push(player);
        });

        console.log(`Spawned ${this.players.length} players`);
    }

    /**
     * Create sidescroller animations for all 4 players.
     * Keys: player-{n}-idle, player-{n}-run, player-{n}-jump, player-{n}-fall, player-{n}-attack
     * Direction handled via sprite.setFlipX() in SpriteDirectionSystem.
     * Uses existing south-facing spritesheet frames as placeholders until M6 assets arrive.
     */
    createPlayerAnimations() {
        for (let playerIndex = 0; playerIndex < 4; playerIndex++) {
            // Idle — breathing-idle east frames: player-N-idle-0 ... player-N-idle-3
            this.anims.create({
                key: `player-${playerIndex}-idle`,
                frames: this.anims.generateFrameNames(`player-${playerIndex}`, {
                    prefix: `player-${playerIndex}-idle-`,
                    start: 0,
                    end: 3
                }),
                frameRate: 6,
                repeat: -1
            });

            // Run — running-8-frames east: player-N-run-0 ... player-N-run-7
            this.anims.create({
                key: `player-${playerIndex}-run`,
                frames: this.anims.generateFrameNames(`player-${playerIndex}`, {
                    prefix: `player-${playerIndex}-run-`,
                    start: 0,
                    end: 7
                }),
                frameRate: 12,
                repeat: -1
            });

            // Jump — jumping-1 east: player-N-jump-0 ...
            this.anims.create({
                key: `player-${playerIndex}-jump`,
                frames: this.anims.generateFrameNames(`player-${playerIndex}`, {
                    prefix: `player-${playerIndex}-jump-`,
                    start: 0,
                    end: 3
                }),
                frameRate: 8,
                repeat: 0
            });

            // Fall — same source frames as jump (build script copies them as player-N-fall-N)
            this.anims.create({
                key: `player-${playerIndex}-fall`,
                frames: this.anims.generateFrameNames(`player-${playerIndex}`, {
                    prefix: `player-${playerIndex}-fall-`,
                    start: 0,
                    end: 3
                }),
                frameRate: 8,
                repeat: 0
            });

            // Attack — cross-punch east: player-N-attack-0 ...
            this.anims.create({
                key: `player-${playerIndex}-attack`,
                frames: this.anims.generateFrameNames(`player-${playerIndex}`, {
                    prefix: `player-${playerIndex}-attack-`,
                    start: 0,
                    end: 7
                }),
                frameRate: 12,
                repeat: 0
            });
        }

        console.log('Created player animations for 4 players (side-view)');
    }

    /**
     * Spawn 5 Compys distributed across the arena
     */
    spawnCompys() {
        const spawnPositions = [
            { x: 8,  y: 0 },
            { x: 25, y: 0 },
            { x: 40, y: 0 },
            { x: 58, y: 0 },
            { x: 72, y: 0 },
        ];

        const alivePlayerCount = this.players.filter(p => !p.isDowned).length;
        const healthScales = [1.0, 1.2, 1.3, 1.4];
        const healthScale = healthScales[alivePlayerCount - 1] || 1.0;

        spawnPositions.forEach(pos => {
            const compy = new Dinosaur(this, 'compy', pos.x, pos.y, 0);
            compy.health = Math.floor(compy.health * healthScale);
            compy.maxHealth = compy.health;
            this.compys.push(compy);
        });

        this.compys.forEach(compy => {
            compy.ai = new CompyAI(compy, this.compys, this.players);
        });

        this.packCoordinator = new PackCoordinator(this.compys, this.players);

        console.log(`Spawned ${this.compys.length} Compys`);
    }

    /**
     * Check if hunt has ended (victory or failure)
     */
    checkHuntCompletion() {
        if (this.compys.every(c => c.isDead)) {
            this.huntState = 'victory';
            console.log('VICTORY! All Compys defeated!');
            return;
        }

        if (this.players.every(p => p.isDowned)) {
            this.huntState = 'failure';
            console.log('FAILURE! All players downed!');
        }
    }

    update(time, delta) {
        this.huntTimer += delta;
        this.totalHuntTime += delta;

        if (this.huntState !== 'active') {
            return;
        }

        // Update pack coordinator
        if (this.packCoordinator) {
            this.packCoordinator.update(delta);
        }

        // Update players: input → movement → physics → position sync
        this.players.forEach(player => {
            if (player.isDowned) return;

            const input = this.inputManager.getPlayerInputWithKeyboard(player.playerNumber);

            if (input) {
                // Horizontal movement: left = -1, right = +1
                const horizontal = (input.dpad.right ? 1 : 0) - (input.dpad.left ? 1 : 0);

                if (horizontal !== 0) {
                    player.move(horizontal);
                } else {
                    player.stop();
                }

                // Jump: D-pad up
                if (input.dpad.up) {
                    player.jump();
                }
            }

            // Capture Y before physics for platform one-way landing detection
            const prevY = player.worldY;

            // Apply X movement and player-specific timers
            player.update(delta);

            // Apply gravity and ground collision
            applyGravity(player, delta);

            // Resolve platform collisions (one-way: can jump through from below)
            for (const platform of JUNGLE_ARENA.platforms) {
                checkPlatform(player, platform, prevY);
            }

            // Clamp to arena horizontal bounds
            player.worldX = Math.max(0, Math.min(JUNGLE_ARENA.width, player.worldX));

            // Sync screen position after physics moved worldY
            player.updateScreenPosition();
        });

        // Update compys
        this.compys.forEach(compy => {
            if (!compy.isDead) {
                compy.update(delta);
                // Clamp to arena
                compy.worldX = Math.max(0, Math.min(JUNGLE_ARENA.width, compy.worldX));
            }
        });

        // Camera: horizontal follow, clamped to arena
        if (this.cameraController) {
            this.cameraController.update(this.players, JUNGLE_ARENA.width);
        }

        this.checkHuntCompletion();
    }
}
