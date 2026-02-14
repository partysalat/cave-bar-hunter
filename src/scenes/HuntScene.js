import Phaser from 'phaser';
import { worldToScreen, calculateDepth, screenToWorldDirection } from '../systems/CoordinateSystem.js';
import { updatePlayerAnimation } from '../systems/SpriteDirectionSystem.js';
import Player from '../entities/Player.js';
import Dinosaur from '../entities/Dinosaur.js';
import InputManager from '../systems/InputManager.js';
import PackCoordinator from '../ai/PackCoordinator.js';
import CompyAI from '../ai/CompyAI.js';
import { gameSession } from '../systems/SessionManager.js';

/**
 * HuntScene - Compy Pack Hunt
 *
 * A hunt scene where 4 players fight 5 Compys in a dense jungle arena.
 * Features pack AI coordination, tree obstacles, and dynamic combat.
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

        // Load Compy rotation sprites
        const directions = ['north', 'north-east', 'east', 'south-east',
                           'south', 'south-west', 'west', 'north-west'];
        directions.forEach(direction => {
            this.load.image(
                `compy-${direction}`,
                `/assets/enemies/compy-dino/rotations/${direction}.png`
            );
        });

        // Load jungle floor tiles
        this.load.image('jungle-floor', '/assets/environments/arena-3-dense-jungle/tiles/jungle-floor.png');
        this.load.image('grass-patch', '/assets/environments/arena-3-dense-jungle/tiles/grass-patch.png');
        this.load.image('root-covered-ground', '/assets/environments/arena-3-dense-jungle/tiles/root-covered-ground.png');

        // Load floor variety tiles
        this.load.image('tile-leafy', '/assets/environments/arena-3-dense-jungle/variety/tile-leafy.png');
        this.load.image('tile-muddy', '/assets/environments/arena-3-dense-jungle/variety/tile-muddy.png');

        // Load props
        this.load.image('large-tree-trunk', '/assets/environments/arena-3-dense-jungle/props/large-tree-trunk.png');
        this.load.image('rock-formation', '/assets/environments/arena-3-dense-jungle/props/rock-formation.png');
        this.load.image('hanging-vines', '/assets/environments/arena-3-dense-jungle/props/hanging-vines.png');
        this.load.image('prop-mushrooms', '/assets/environments/arena-3-dense-jungle/variety/prop-mushrooms.png');

        // Load elevation assets
        this.load.image('platform-low', '/assets/environments/arena-3-dense-jungle/elevation/platform-low.png');
        this.load.image('platform-mid', '/assets/environments/arena-3-dense-jungle/elevation/platform-mid.png');
        this.load.image('platform-high', '/assets/environments/arena-3-dense-jungle/elevation/platform-high.png');
        this.load.image('ramp', '/assets/environments/arena-3-dense-jungle/elevation/ramp.png');
    }

    create() {
        // Hunt state machine: intro → active → victory/failure
        this.huntState = 'intro';

        // Timers
        this.huntTimer = 0;           // Time in current state
        this.totalHuntTime = 0;       // Total time elapsed in hunt

        // Entity arrays
        this.players = [];
        this.compys = [];
        this.projectiles = [];
        this.trees = [];

        // Collision tracking
        this.obstacles = [];

        // Pack coordinator
        this.packCoordinator = null;

        // Initialize input manager
        this.inputManager = new InputManager(this);
        this.inputManager.setupKeyboard();

        // Build arena
        this.buildJungleFloor();
        this.addElevation();
        this.addTrees();
        this.addRocks();
        this.addDecorations();

        // Spawn players and create animations
        this.spawnPlayers();
        this.createPlayerAnimations();

        // Spawn enemies
        this.spawnCompys();

        // Center camera on arena (15, 12.5 = center of 30×25 arena)
        const arenaCenter = worldToScreen(15, 12.5, 0);
        this.cameras.main.centerOn(arenaCenter.x, arenaCenter.y);

        // Start hunt
        this.huntState = 'active';
    }

    /**
     * Build jungle floor arena with 30×25 world units of dense foliage
     */
    buildJungleFloor() {
        // Arena bounds in world units
        this.arenaMinX = 0;
        this.arenaMaxX = 30;
        this.arenaMinY = 0;
        this.arenaMaxY = 25;

        const tileSize = 0.64; // World units per tile
        let tileCount = 0;

        // Create grid of jungle tiles with variety
        for (let worldY = this.arenaMinY; worldY < this.arenaMaxY; worldY += tileSize) {
            for (let worldX = this.arenaMinX; worldX < this.arenaMaxX; worldX += tileSize) {
                // Floor tiles at worldZ = -0.5 (below ground level)
                const tileWorldZ = -0.5;

                // Convert world position to screen coordinates
                const screenPos = worldToScreen(worldX, worldY, tileWorldZ);
                const depth = calculateDepth(worldY, tileWorldZ);

                // Pick tile with variety (50% jungle-floor, 18% grass-patch, 10% roots, 14% leafy, 8% muddy)
                const rand = Math.random();
                let tileKey;
                if (rand < 0.50) {
                    tileKey = 'jungle-floor';
                } else if (rand < 0.68) {
                    tileKey = 'grass-patch';
                } else if (rand < 0.78) {
                    tileKey = 'root-covered-ground';
                } else if (rand < 0.92) {
                    tileKey = 'tile-leafy';
                } else {
                    tileKey = 'tile-muddy';
                }

                // Create tile sprite
                const tile = this.add.sprite(screenPos.x, screenPos.y, tileKey);
                tile.setDepth(depth); // Uses proper depth calculation with worldZ -0.5

                tileCount++;
            }
        }

        console.log(`Built jungle floor with ${tileCount} tiles`);
    }

    /**
     * Add tree obstacles throughout the arena
     * Trees block line-of-sight and projectiles
     */
    addTrees() {
        const treePositions = [
            {x: 5, y: 5},
            {x: 22, y: 8},
            {x: 7, y: 12},
            {x: 20, y: 15},
            {x: 10, y: 20},
            {x: 18, y: 22},
            {x: 15, y: 3},
            {x: 12, y: 18}
        ];

        const treeRadius = 1.5;

        treePositions.forEach(pos => {
            // Convert world position to screen coordinates
            const screenPos = worldToScreen(pos.x, pos.y, 0);
            const depth = calculateDepth(pos.y, 0);

            // Create tree trunk sprite
            const treeSprite = this.add.image(screenPos.x, screenPos.y, 'large-tree-trunk');
            treeSprite.setScale(0.75);
            treeSprite.setDepth(depth);

            // Create tree object
            const tree = {
                type: 'tree',
                worldX: pos.x,
                worldY: pos.y,
                worldZ: 0,
                radius: treeRadius,
                sprite: treeSprite
            };

            // Add to both trees and obstacles arrays
            this.trees.push(tree);
            this.obstacles.push(tree);
        });

        console.log(`Added ${this.trees.length} tree obstacles`);
    }

    /**
     * Add rock formation obstacles at positions that don't overlap trees
     */
    addRocks() {
        const rockPositions = [
            { x: 2, y: 8 },
            { x: 27, y: 18 },
            { x: 8, y: 2 },
            { x: 23, y: 22 },
            { x: 14, y: 10 }
        ];

        const rockRadius = 1.2;

        rockPositions.forEach(pos => {
            const screenPos = worldToScreen(pos.x, pos.y, 0);
            const depth = calculateDepth(pos.y, 0);

            const rockSprite = this.add.image(screenPos.x, screenPos.y, 'rock-formation');
            rockSprite.setScale(0.65);
            rockSprite.setDepth(depth);

            const rock = {
                type: 'rock',
                worldX: pos.x,
                worldY: pos.y,
                worldZ: 0,
                radius: rockRadius,
                sprite: rockSprite
            };

            this.obstacles.push(rock);
        });

        console.log(`Added ${rockPositions.length} rock obstacles`);
    }

    /**
     * Add decorative props: hanging vines and mushroom clusters
     */
    addDecorations() {
        // Hanging vines near tree edges (decoration only, no collision)
        const vinePositions = [
            { x: 5, y: 4 },
            { x: 15, y: 2.5 },
            { x: 22, y: 7.5 },
            { x: 7, y: 11 },
            { x: 20, y: 14.5 }
        ];

        vinePositions.forEach(pos => {
            const screenPos = worldToScreen(pos.x, pos.y, 0.5);
            const depth = calculateDepth(pos.y, 0.5);

            const vineSprite = this.add.image(screenPos.x, screenPos.y, 'hanging-vines');
            vineSprite.setScale(0.75);
            vineSprite.setDepth(depth);
        });

        // Mushroom clusters scattered around open areas
        const mushroomPositions = [
            { x: 3, y: 15 },
            { x: 11, y: 6 },
            { x: 25, y: 10 },
            { x: 16, y: 20 },
            { x: 9, y: 24 },
            { x: 26, y: 4 },
            { x: 1, y: 20 }
        ];

        mushroomPositions.forEach(pos => {
            const screenPos = worldToScreen(pos.x, pos.y, 0);
            const depth = calculateDepth(pos.y, 0) + 1;

            const mushSprite = this.add.image(screenPos.x, screenPos.y, 'prop-mushrooms');
            mushSprite.setScale(0.5);
            mushSprite.setDepth(depth);
        });

        console.log(`Added ${vinePositions.length} vine decorations and ${mushroomPositions.length} mushroom clusters`);
    }

    /**
     * Add elevation platforms (visual only) to give the arena height variation
     */
    addElevation() {
        const elevationPieces = [
            { x: 2, y: 2, worldZ: 1.5, key: 'platform-high' },
            { x: 28, y: 4, worldZ: 1.0, key: 'platform-mid' },
            { x: 1, y: 22, worldZ: 1.0, key: 'platform-mid' },
            { x: 28, y: 23, worldZ: 1.5, key: 'platform-high' },
            { x: 12, y: 2, worldZ: 0.5, key: 'platform-low' },
            { x: 24, y: 24, worldZ: 0.5, key: 'platform-low' },
            // Ramps leading up to platforms
            { x: 3, y: 3, worldZ: 0.5, key: 'ramp' },
            { x: 27, y: 5, worldZ: 0.5, key: 'ramp' },
            { x: 2, y: 21, worldZ: 0.5, key: 'ramp' },
            { x: 27, y: 22, worldZ: 0.5, key: 'ramp' }
        ];

        elevationPieces.forEach(piece => {
            const screenPos = worldToScreen(piece.x, piece.y, piece.worldZ);
            const depth = calculateDepth(piece.y, piece.worldZ);

            const sprite = this.add.image(screenPos.x, screenPos.y, piece.key);
            sprite.setDepth(depth);
        });

        console.log(`Added ${elevationPieces.length} elevation pieces`);
    }

    /**
     * Spawn 4 players in center formation (2x2 grid)
     */
    spawnPlayers() {
        // Center position and spacing
        const centerX = 15;
        const centerY = 12.5;
        const spacing = 2;

        // 2x2 grid positions
        const positions = [
            { x: centerX - spacing/2, y: centerY - spacing/2 }, // Player 0: NW
            { x: centerX + spacing/2, y: centerY - spacing/2 }, // Player 1: NE
            { x: centerX - spacing/2, y: centerY + spacing/2 }, // Player 2: SW
            { x: centerX + spacing/2, y: centerY + spacing/2 }  // Player 3: SE
        ];

        positions.forEach((pos, index) => {
            const player = new Player(this, index, pos.x, pos.y, 0);
            player.moveSpeed = 6; // Hunt speed (faster than normal)
            this.players.push(player);
        });

        console.log(`Spawned ${this.players.length} players in center formation`);
    }

    /**
     * Create animations for all 4 players
     * Each player has run and idle animations for 8 directions
     */
    createPlayerAnimations() {
        const directions = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];

        for (let playerIndex = 0; playerIndex < 4; playerIndex++) {
            directions.forEach(direction => {
                // Run animation
                this.anims.create({
                    key: `player-${playerIndex}-run-${direction}`,
                    frames: this.anims.generateFrameNames(`player-${playerIndex}`, {
                        prefix: `player-${playerIndex}-run-${direction}-`,
                        start: 0,
                        end: 7
                    }),
                    frameRate: 12,
                    repeat: -1
                });

                // Idle animation
                this.anims.create({
                    key: `player-${playerIndex}-idle-${direction}`,
                    frames: this.anims.generateFrameNames(`player-${playerIndex}`, {
                        prefix: `player-${playerIndex}-idle-${direction}-`,
                        start: 0,
                        end: 3
                    }),
                    frameRate: 6,
                    repeat: -1
                });
            });
        }

        console.log('Created player animations for 4 players × 8 directions × 2 types');
    }

    /**
     * Spawn 5 Compys in jungle arena positions
     * Health scales based on number of active players
     */
    spawnCompys() {
        // Spawn positions around the arena (avoid center where players spawn)
        const spawnPositions = [
            { x: 15, y: 3 },   // North center
            { x: 25, y: 12 },  // East
            { x: 12, y: 22 },  // South-west
            { x: 18, y: 22 },  // South-east
            { x: 5, y: 12 }    // West
        ];

        // Count alive (not downed) players for health scaling
        const alivePlayerCount = this.players.filter(p => !p.isDowned).length;
        const healthScales = [1.0, 1.2, 1.3, 1.4];
        const healthScale = healthScales[alivePlayerCount - 1] || 1.0;

        spawnPositions.forEach(pos => {
            // Create Compy
            const compy = new Dinosaur(this, 'compy', pos.x, pos.y, 0);

            // Scale health based on player count
            compy.health = Math.floor(compy.health * healthScale);
            compy.maxHealth = compy.health;

            // Add to array
            this.compys.push(compy);
        });

        // Initialize AI for each Compy
        this.compys.forEach(compy => {
            compy.ai = new CompyAI(compy, this.compys, this.players);
        });

        // Initialize pack coordinator
        this.packCoordinator = new PackCoordinator(this.compys, this.players);

        console.log(`Spawned ${this.compys.length} Compys with ${healthScale}x health scaling`);
    }

    /**
     * Check if hunt has ended (victory or failure)
     */
    checkHuntCompletion() {
        // Check for victory: all compys dead
        const allCompysDead = this.compys.every(c => c.isDead);
        if (allCompysDead) {
            this.huntState = 'victory';
            console.log('VICTORY! All Compys defeated!');
            return;
        }

        // Check for failure: all players downed
        const allPlayersDowned = this.players.every(p => p.isDowned);
        if (allPlayersDowned) {
            this.huntState = 'failure';
            console.log('FAILURE! All players downed!');
            return;
        }
    }

    /**
     * Check if a line segment between two points is blocked by any obstacle
     * Uses ray-circle intersection algorithm
     * @param {number} x1 - Start point X in world coordinates
     * @param {number} y1 - Start point Y in world coordinates
     * @param {number} x2 - End point X in world coordinates
     * @param {number} y2 - End point Y in world coordinates
     * @returns {boolean} True if line is blocked by an obstacle
     */
    isLineOfSightBlocked(x1, y1, x2, y2) {
        // Check each obstacle for intersection
        for (const obstacle of this.obstacles) {
            if (this.lineIntersectsCircle(x1, y1, x2, y2, obstacle.worldX, obstacle.worldY, obstacle.radius)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Test if a line segment intersects a circle
     * @param {number} x1 - Line start X
     * @param {number} y1 - Line start Y
     * @param {number} x2 - Line end X
     * @param {number} y2 - Line end Y
     * @param {number} cx - Circle center X
     * @param {number} cy - Circle center Y
     * @param {number} r - Circle radius
     * @returns {boolean} True if line intersects circle
     */
    lineIntersectsCircle(x1, y1, x2, y2, cx, cy, r) {
        // Vector from line start to circle center
        const dx = cx - x1;
        const dy = cy - y1;

        // Line direction vector
        const lineDx = x2 - x1;
        const lineDy = y2 - y1;

        // Line length squared
        const lineLengthSq = lineDx * lineDx + lineDy * lineDy;

        // If line is effectively a point, check distance to that point
        if (lineLengthSq < 0.0001) {
            const distSq = dx * dx + dy * dy;
            return distSq <= r * r;
        }

        // Project circle center onto line (find closest point on line)
        // t is the parameter along the line (0 = start, 1 = end)
        let t = (dx * lineDx + dy * lineDy) / lineLengthSq;

        // Clamp t to [0, 1] to stay on the line segment
        t = Math.max(0, Math.min(1, t));

        // Find closest point on line segment
        const closestX = x1 + t * lineDx;
        const closestY = y1 + t * lineDy;

        // Distance from closest point to circle center
        const distX = cx - closestX;
        const distY = cy - closestY;
        const distSq = distX * distX + distY * distY;

        // Check if closest point is within circle radius
        return distSq <= r * r;
    }

    update(time, delta) {
        // Increment timers
        this.huntTimer += delta;
        this.totalHuntTime += delta;

        // Only update gameplay during active hunt
        if (this.huntState !== 'active') {
            return;
        }

        // Update pack coordinator
        if (this.packCoordinator) {
            this.packCoordinator.update(delta);
        }

        // Update players
        this.players.forEach(player => {
            if (player.isDowned) return;

            // Get input from gamepad/keyboard (keyboard fallback for testing)
            const input = this.inputManager.getPlayerInputWithKeyboard(player.playerNumber);

            if (input) {
                // Convert D-pad to screen-space direction
                const screenDirection = this.inputManager.getDPadDirection(input.dpad);

                if (screenDirection.x !== 0 || screenDirection.y !== 0) {
                    // Convert screen-space input to world-space direction (critical for isometric)
                    const worldDirection = screenToWorldDirection(screenDirection.x, screenDirection.y);

                    // Apply movement
                    const moveSpeed = player.moveSpeed;
                    const deltaSeconds = delta / 1000;
                    player.worldX += worldDirection.x * moveSpeed * deltaSeconds;
                    player.worldY += worldDirection.y * moveSpeed * deltaSeconds;

                    // Constrain to arena boundaries
                    player.worldX = Math.max(this.arenaMinX, Math.min(this.arenaMaxX, player.worldX));
                    player.worldY = Math.max(this.arenaMinY, Math.min(this.arenaMaxY, player.worldY));

                    // Update facing direction
                    player.facingX = worldDirection.x;
                    player.facingY = worldDirection.y;
                    player.isMoving = true;
                } else {
                    player.isMoving = false;
                }

                // Update player animation
                updatePlayerAnimation(
                    player.sprite,
                    player.playerNumber,
                    player.facingX,
                    player.facingY,
                    player.isMoving
                );
            }

            // Update player entity
            player.update(delta);
        });

        // Update compys
        this.compys.forEach(compy => {
            if (!compy.isDead) {
                compy.update(delta);

                // Constrain to arena boundaries (prevent retreating out of bounds)
                compy.worldX = Math.max(this.arenaMinX, Math.min(this.arenaMaxX, compy.worldX));
                compy.worldY = Math.max(this.arenaMinY, Math.min(this.arenaMaxY, compy.worldY));
            }
        });

        // Check for hunt completion
        this.checkHuntCompletion();
    }
}
