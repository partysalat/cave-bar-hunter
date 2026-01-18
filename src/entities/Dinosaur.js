import Entity from './Entity.js';

/**
 * Base dinosaur entity
 * Phase 1: Simple test enemy with no attacks
 */
export default class Dinosaur extends Entity {
    /**
     * @param {Phaser.Scene} scene
     * @param {string} type - Dinosaur type (e.g., 'compy', 'raptor')
     * @param {number} worldX
     * @param {number} worldY
     * @param {number} worldZ
     */
    constructor(scene, type, worldX, worldY, worldZ) {
        super(scene, worldX, worldY, worldZ);

        this.type = type;
        this.health = this.getHealthForType(type);
        this.maxHealth = this.health;
        this.isDead = false;

        // Collision
        this.radius = this.getRadiusForType(type);

        // Color tint based on type (temporary visualization)
        const color = type === 'compy' ? 0xff00ff : 0x00ffff;
        this.sprite.setTint(color);
    }

    /**
     * Gets collision radius for dinosaur type
     * @param {string} type
     * @returns {number}
     */
    getRadiusForType(type) {
        const radiusMap = {
            'compy': 0.8,
            'dilophosaurus': 1.5,
            'raptor': 2.0
        };
        return radiusMap[type] || 1.0;
    }

    /**
     * Gets base health for dinosaur type
     * @param {string} type
     * @returns {number}
     */
    getHealthForType(type) {
        const healthMap = {
            'compy': 20,
            'dilophosaurus': 50,
            'raptor': 100
        };
        return healthMap[type] || 50;
    }

    /**
     * Applies damage to dinosaur
     * @param {number} damage
     */
    takeDamage(damage) {
        if (this.isDead) return;

        this.health -= damage;

        if (this.health <= 0) {
            this.health = 0;
            this.isDead = true;
            this.onDeath();
        }
    }

    /**
     * Called when health reaches 0
     */
    onDeath() {
        // Phase 1: Just mark as dead
        // Later: death animation, score awards, etc.
        console.log(`${this.type} defeated!`);
    }

    /**
     * Update AI behavior
     * @param {number} delta
     */
    update(delta) {
        super.update(delta);

        // Phase 1: No AI yet, just exists
        // Later: state machine, attacks, etc.
    }
}
