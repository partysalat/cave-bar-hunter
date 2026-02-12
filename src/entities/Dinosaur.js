import Entity from './Entity.js';
import WeakPoint from './WeakPoint.js';

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

        this.id = `dino-${Date.now()}-${Math.random()}`; // Unique ID for hit tracking
        this.type = type;
        this.health = this.getHealthForType(type);
        this.maxHealth = this.health;
        this.isDead = false;

        // Collision
        this.radius = this.getRadiusForType(type);

        // Weak points based on type
        this.weakPoints = this.createWeakPointsForType(type);

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
     * Create weak points based on dinosaur type
     * @param {string} type
     * @returns {Array<WeakPoint>}
     */
    createWeakPointsForType(type) {
        // Default weak points for most dinosaurs
        const points = [
            new WeakPoint('head', 30, 2.0, 0, -1.5, 1.0),  // Front, elevated
            new WeakPoint('tail', 40, 1.5, 0, 1.5, 0.5),   // Rear
            new WeakPoint('legs', 50, 1.0, 0, 0, 0)        // Center, ground level
        ];

        // Type-specific adjustments (can expand later)
        if (type === 'compy') {
            // Small dinosaur, only one weak point
            return [new WeakPoint('body', 20, 1.5, 0, 0, 0.3)];
        }

        return points;
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
     * Initializes AI system for this dinosaur
     * @param {Array<Dinosaur>} allDinosaurs - All dinosaurs in scene (for pack coordination)
     * @param {Array<Player>} players - All players in scene
     */
    initializeAI(allDinosaurs, players) {
        if (this.ai) {
            console.warn(`Dinosaur ${this.id} already has AI initialized`);
            return;
        }

        // For compy type, set up AI slot (will be CompyAI later)
        if (this.type === 'compy') {
            this.ai = null; // Placeholder - will be CompyAI instance in Task 5
            console.log('Compy AI slot created');
        }

        // Other dinosaur types can be added here later
    }

    /**
     * Update AI behavior and weak points
     * @param {number} delta
     */
    update(delta) {
        super.update(delta);

        // Update weak point positions relative to dinosaur
        for (const wp of this.weakPoints) {
            wp.updatePosition(this.worldX, this.worldY, this.worldZ);
        }

        // Update AI if present and dinosaur is alive
        if (this.ai && !this.isDead) {
            this.ai.update(delta);
        }
    }
}
