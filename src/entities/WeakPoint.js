/**
 * Weak point on dinosaur - targetable body part
 * From design doc: Head (small, 2x damage), Tail (medium, breaks cause trip), Legs (large, slow dino)
 */
export default class WeakPoint {
    /**
     * @param {string} type - 'head', 'tail', 'legs', 'back'
     * @param {number} health - Health of this weak point
     * @param {number} damageMultiplier - Damage multiplier for hits
     * @param {number} offsetX - Offset from dinosaur center (world units)
     * @param {number} offsetY
     * @param {number} offsetZ
     */
    constructor(type, health, damageMultiplier, offsetX, offsetY, offsetZ) {
        this.type = type;
        this.health = health;
        this.maxHealth = health;
        this.damageMultiplier = damageMultiplier;
        this.isBroken = false;

        // Position offset from dinosaur center
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.offsetZ = offsetZ;

        // Actual world position (updated by dinosaur)
        this.worldX = 0;
        this.worldY = 0;
        this.worldZ = 0;

        // Collision hitbox size based on type (from design doc)
        this.radius = this.getRadiusForType(type);
    }

    /**
     * Get hitbox radius based on weak point type
     * @param {string} type
     * @returns {number}
     */
    getRadiusForType(type) {
        const radiusMap = {
            'head': 0.5,    // Small hitbox, hard to hit
            'tail': 0.8,    // Medium hitbox
            'legs': 1.2,    // Large hitbox, easy to hit
            'back': 1.0     // Moderate hitbox
        };
        return radiusMap[type] || 0.8;
    }

    /**
     * Apply damage to weak point
     * @param {number} damage
     * @returns {boolean} True if weak point broke this hit
     */
    takeDamage(damage) {
        if (this.isBroken) return false;

        this.health -= damage;

        if (this.health <= 0) {
            this.health = 0;
            this.isBroken = true;
            return true; // Broke on this hit
        }

        return false;
    }

    /**
     * Update weak point position based on dinosaur position
     * @param {number} dinoX
     * @param {number} dinoY
     * @param {number} dinoZ
     */
    updatePosition(dinoX, dinoY, dinoZ) {
        this.worldX = dinoX + this.offsetX;
        this.worldY = dinoY + this.offsetY;
        this.worldZ = dinoZ + this.offsetZ;
    }
}
