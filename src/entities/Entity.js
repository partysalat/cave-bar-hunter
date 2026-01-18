import { worldToScreen, calculateDepth } from '../systems/CoordinateSystem.js';

/**
 * Base class for all game entities (players, dinosaurs, projectiles)
 * Handles world/screen coordinate conversion and sprite management
 */
export default class Entity {
    /**
     * @param {Phaser.Scene} scene - Phaser scene
     * @param {number} worldX - Initial world X position
     * @param {number} worldY - Initial world Y position
     * @param {number} worldZ - Initial world Z position (height)
     */
    constructor(scene, worldX, worldY, worldZ) {
        this.scene = scene;
        this.worldX = worldX;
        this.worldY = worldY;
        this.worldZ = worldZ;

        // Velocity in world units per second
        this.velocityX = 0;
        this.velocityY = 0;
        this.velocityZ = 0;

        // Create sprite (will be overridden by subclasses)
        this.sprite = scene.add.sprite(0, 0, null);
        this.sprite.setOrigin(0.5, 0.5);

        this.updateScreenPosition();
    }

    /**
     * Updates sprite screen position and depth from world coordinates
     * Call this every frame or when world position changes
     */
    updateScreenPosition() {
        const screenPos = worldToScreen(this.worldX, this.worldY, this.worldZ);
        this.sprite.x = screenPos.x;
        this.sprite.y = screenPos.y;
        this.sprite.setDepth(this.getDepth());
    }

    /**
     * Calculates depth for proper sprite layering
     * @returns {number} Depth value
     */
    getDepth() {
        return calculateDepth(this.worldY, this.worldZ);
    }

    /**
     * Updates entity logic (override in subclasses)
     * @param {number} delta - Time since last frame in ms
     */
    update(delta) {
        // Apply velocity to world position
        const deltaSeconds = delta / 1000;
        this.worldX += this.velocityX * deltaSeconds;
        this.worldY += this.velocityY * deltaSeconds;
        this.worldZ += this.velocityZ * deltaSeconds;

        this.updateScreenPosition();
    }

    /**
     * Destroys entity and removes sprite
     */
    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}
