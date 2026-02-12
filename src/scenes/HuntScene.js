import Phaser from 'phaser';
import { worldToScreen, calculateDepth } from '../systems/CoordinateSystem.js';

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

        // Build arena
        this.buildJungleFloor();
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

    update(time, delta) {
        // Increment timers
        this.huntTimer += delta;
        this.totalHuntTime += delta;
    }
}
