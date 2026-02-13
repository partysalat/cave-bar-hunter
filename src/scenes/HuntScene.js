import Phaser from 'phaser';
import { worldToScreen, calculateDepth } from '../systems/CoordinateSystem.js';
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
        this.addTrees();

        // Spawn players and create animations
        this.spawnPlayers();
        this.createPlayerAnimations();

        // Spawn enemies
        this.spawnCompys();

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

        // Create grid of green placeholder tiles
        for (let worldY = this.arenaMinY; worldY < this.arenaMaxY; worldY += tileSize) {
            for (let worldX = this.arenaMinX; worldX < this.arenaMaxX; worldX += tileSize) {
                // Convert world position to screen coordinates
                const screenPos = worldToScreen(worldX, worldY, 0);
                const depth = calculateDepth(worldY, 0);

                // Create placeholder green rectangle
                const tile = this.add.graphics();
                tile.fillStyle(0x3a5f3a, 1); // Dark green
                tile.fillRect(screenPos.x - 32, screenPos.y - 16, 64, 32);
                tile.setDepth(depth);

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

            // Create brown circle sprite for tree
            const treeSprite = this.add.circle(
                screenPos.x,
                screenPos.y,
                treeRadius * 32, // Convert world radius to screen pixels (approximate)
                0x4a3728 // Brown color
            );
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

            // Get input from gamepad/keyboard
            const input = this.inputManager.getPlayerInput(player.playerNumber);

            // Skip if no input device connected
            if (!input) {
                player.velocityX = 0;
                player.velocityY = 0;
                player.isMoving = false;
                player.update(delta);
                return;
            }

            // Apply movement
            if (input.moveX !== 0 || input.moveY !== 0) {
                const speedMultiplier = delta / 1000;
                player.velocityX = input.moveX * player.moveSpeed * speedMultiplier;
                player.velocityY = input.moveY * player.moveSpeed * speedMultiplier;
                player.isMoving = true;

                // Update facing direction
                if (input.moveX !== 0 || input.moveY !== 0) {
                    player.facingX = input.moveX;
                    player.facingY = input.moveY;
                }
            } else {
                player.velocityX = 0;
                player.velocityY = 0;
                player.isMoving = false;
            }

            // Update player
            player.update(delta);

            // Constrain to arena bounds
            player.worldX = Math.max(this.arenaMinX, Math.min(this.arenaMaxX, player.worldX));
            player.worldY = Math.max(this.arenaMinY, Math.min(this.arenaMaxY, player.worldY));

            // Update animation
            const direction = player.getCurrentDirection();
            if (player.isMoving) {
                const runKey = `player-${player.playerNumber}-run-${direction}`;
                if (player.sprite.anims.currentAnim?.key !== runKey) {
                    player.sprite.play(runKey);
                }
            } else {
                const idleKey = `player-${player.playerNumber}-idle-${direction}`;
                if (player.sprite.anims.currentAnim?.key !== idleKey) {
                    player.sprite.play(idleKey);
                }
            }
        });

        // Update compys
        this.compys.forEach(compy => {
            if (!compy.isDead) {
                compy.update(delta);
            }
        });

        // Check for hunt completion
        this.checkHuntCompletion();
    }
}
