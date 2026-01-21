import Entity from './Entity.js';

/**
 * Projectile entity - spears, sling stones, etc.
 */
export default class Projectile extends Entity {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} ownerPlayerNumber - Player who fired this
     * @param {number} worldX - Starting position
     * @param {number} worldY
     * @param {number} worldZ
     * @param {number} dirX - Direction vector (normalized)
     * @param {number} dirY
     * @param {number} dirZ
     * @param {number} damageMultiplier - Buff multiplier from player (default 1.0)
     */
    constructor(scene, ownerPlayerNumber, worldX, worldY, worldZ, dirX, dirY, dirZ = 0, damageMultiplier = 1.0) {
        super(scene, worldX, worldY, worldZ);

        this.ownerPlayerNumber = ownerPlayerNumber;

        // Combat stats
        this.baseDamage = 10; // Base damage
        this.damage = this.baseDamage * damageMultiplier; // Apply buff multiplier
        this.weakPointMultiplier = 2.0; // Damage multiplier on weak points

        // Physics
        this.speed = 15; // world units per second
        this.velocityX = dirX * this.speed;
        this.velocityY = dirY * this.speed;
        this.velocityZ = dirZ * this.speed;

        // Collision
        this.radius = 0.2; // Small hitbox for projectiles

        // Lifetime tracking
        this.lifetime = 0;
        this.maxLifetime = 2000; // 2 seconds max flight time
        this.isExpired = false;

        // Apply player color tint (same as owner)
        const colors = [0xff0000, 0x0000ff, 0xffff00, 0x00ff00];
        this.sprite.setTint(colors[ownerPlayerNumber]);
    }

    /**
     * Update projectile position and lifetime
     * @param {number} delta - Time in ms
     */
    update(delta) {
        if (this.isExpired) return;

        super.update(delta);

        this.lifetime += delta;

        // Expire after max lifetime
        if (this.lifetime >= this.maxLifetime) {
            this.isExpired = true;
        }
    }

    /**
     * Mark projectile as hit
     */
    onHit() {
        this.isExpired = true;
    }
}
