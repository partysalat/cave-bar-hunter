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
        this.addTrees();
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
    }
}
