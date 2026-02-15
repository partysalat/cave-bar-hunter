import { worldToScreen, calculateDepth } from '../systems/CoordinateSystem.js';

/**
 * Base class for all game entities (players, dinosaurs, projectiles)
 * worldX = horizontal, worldY = vertical height (0 = ground)
 */
export default class Entity {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} worldX - Initial horizontal position
     * @param {number} worldY - Initial vertical height (0 = ground)
     */
    constructor(scene, worldX, worldY) {
        this.scene = scene;
        this.worldX = worldX;
        this.worldY = worldY;

        // Velocity in world units per second
        this.velocityX = 0;
        this.velocityY = 0;

        // Physics state
        this.onGround = worldY <= 0;
        this.affectedByGravity = false; // opt-in per entity type

        // Create sprite (will be overridden by subclasses)
        this.sprite = scene.add.sprite(0, 0, null);
        this.sprite.setOrigin(0.5, 0.5);

        this.updateScreenPosition();
    }

    /**
     * Updates sprite screen position from world coordinates
     */
    updateScreenPosition() {
        const screenPos = worldToScreen(this.worldX, this.worldY);
        this.sprite.x = screenPos.x;
        this.sprite.y = screenPos.y;
        this.sprite.setDepth(this.getDepth());
    }

    /**
     * @returns {number} Depth value for sprite layering
     */
    getDepth() {
        return calculateDepth();
    }

    /**
     * Updates entity position from velocity.
     * Gravity is applied by PhysicsManager.applyGravity(), not here.
     * @param {number} delta - Time since last frame in ms
     */
    update(delta) {
        const dt = delta / 1000;
        this.worldX += this.velocityX * dt;
        // Note: worldY is updated by PhysicsManager.applyGravity() for gravity-affected entities.
        // For non-gravity entities (e.g. projectiles with explicit trajectories), update here.
        if (!this.affectedByGravity) {
            this.worldY += this.velocityY * dt;
        }

        this.updateScreenPosition();
    }

    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}
