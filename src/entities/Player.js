import Entity from './Entity.js';

// Player color mapping from design doc
const PLAYER_COLORS = [
    0xff0000, // Player 1: Red
    0x0000ff, // Player 2: Blue
    0xffff00, // Player 3: Yellow
    0x00ff00  // Player 4: Green
];

/**
 * Player entity - represents one of 1-4 caveman hunters
 */
export default class Player extends Entity {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} playerNumber - 0-3 player index
     * @param {number} worldX
     * @param {number} worldY
     * @param {number} worldZ
     */
    constructor(scene, playerNumber, worldX, worldY, worldZ) {
        super(scene, worldX, worldY, worldZ);

        this.playerNumber = playerNumber;
        this.color = PLAYER_COLORS[playerNumber];

        // Combat stats
        this.health = 2; // Takes 2 hits before downed
        this.maxHealth = 2;
        this.isDowned = false;

        // Equipment
        this.weapon = 'stone-spear'; // Starting weapon
        this.passiveAbilities = [];
        this.cocktailBuffs = [];

        // Score tracking
        this.score = 0;

        // Movement stats
        this.moveSpeed = 8; // world units per second

        // Collision
        this.radius = 0.5; // world units

        // Attack stats
        this.spearCooldown = 0; // ms until can throw again
        this.spearCooldownTime = 2000; // 2 seconds (from design doc)
        this.facingX = 1; // Direction player is facing
        this.facingY = 0;

        // Dodge stats (from design doc)
        this.isDodging = false;
        this.dodgeTimer = 0;
        this.dodgeDuration = 500; // 0.5 seconds (invincibility frames)
        this.dodgeCooldown = 0;
        this.dodgeCooldownTime = 3000; // 3 seconds (from design doc)
        this.dodgeSpeed = 16; // 2× normal speed during roll
        this.dodgeDirectionX = 0;
        this.dodgeDirectionY = 0;

        // Perfect dodge buff
        this.perfectDodgeBuff = 0; // ms remaining of damage buff
        this.perfectDodgeMultiplier = 1.5; // 1.5× damage

        // Downed state (from design doc)
        this.downedTimer = 0; // Time spent downed
        this.downedMaxTime = 10000; // 10 seconds before death (from design doc)
        this.crawlSpeed = 2; // Slower than normal movement

        // Apply color tint to sprite
        this.sprite.setTint(this.color);
    }

    /**
     * Moves player based on D-pad input direction
     * @param {number} dirX - X direction (-1, 0, 1)
     * @param {number} dirY - Y direction (-1, 0, 1)
     */
    move(dirX, dirY) {
        if (this.isDodging) return; // Can't change direction during dodge

        // Normalize diagonal movement
        if (dirX !== 0 && dirY !== 0) {
            const length = Math.sqrt(dirX * dirX + dirY * dirY);
            dirX /= length;
            dirY /= length;
        }

        // Use crawl speed if downed, normal speed otherwise
        const speed = this.isDowned ? this.crawlSpeed : this.moveSpeed;

        this.velocityX = dirX * speed;
        this.velocityY = dirY * speed;

        // Update facing
        if (dirX !== 0 || dirY !== 0) {
            this.facingX = dirX;
            this.facingY = dirY;
        }
    }

    /**
     * Stops player movement
     */
    stop() {
        this.velocityX = 0;
        this.velocityY = 0;
    }

    /**
     * Takes damage from dinosaur attack
     * @param {number} damage - Amount of damage (usually 1)
     */
    takeDamage(damage) {
        if (this.isInvincible() || this.isDowned) return;

        this.health -= damage;

        if (this.health <= 0) {
            this.health = 0;
            this.isDowned = true;
        }
    }

    /**
     * Revives downed player
     */
    revive() {
        this.isDowned = false;
        this.downedTimer = 0;
        this.health = 1; // Revive with partial health (from design doc)
    }

    /**
     * Adds points to player score
     * @param {number} points
     */
    addScore(points) {
        this.score += points;
    }

    /**
     * Constrains player position to arena boundaries
     * @param {number} minX - Min world X
     * @param {number} maxX - Max world X
     * @param {number} minY - Min world Y
     * @param {number} maxY - Max world Y
     */
    constrainToArena(minX, maxX, minY, maxY) {
        this.worldX = Math.max(minX, Math.min(maxX, this.worldX));
        this.worldY = Math.max(minY, Math.min(maxY, this.worldY));
    }

    /**
     * Updates cooldowns
     * @param {number} delta - Time in ms
     */
    updateCooldowns(delta) {
        if (this.spearCooldown > 0) {
            this.spearCooldown -= delta;
            if (this.spearCooldown < 0) this.spearCooldown = 0;
        }
    }

    /**
     * Check if player can throw spear
     * @returns {boolean}
     */
    canThrowSpear() {
        return this.spearCooldown === 0 && !this.isDowned;
    }

    /**
     * Throws spear in specified direction
     * @param {number} dirX - Direction to throw
     * @param {number} dirY
     * @returns {Object|null} Projectile data or null if can't throw
     */
    throwSpear(dirX, dirY) {
        if (!this.canThrowSpear()) return null;

        // Normalize direction
        const length = Math.sqrt(dirX * dirX + dirY * dirY);
        if (length === 0) return null;

        dirX /= length;
        dirY /= length;

        // Update facing direction
        this.facingX = dirX;
        this.facingY = dirY;

        // Start cooldown
        this.spearCooldown = this.spearCooldownTime;

        // Return projectile creation data with damage multiplier
        return {
            worldX: this.worldX,
            worldY: this.worldY,
            worldZ: this.worldZ + 0.5, // Throw from chest height
            dirX,
            dirY,
            dirZ: 0,
            damageMultiplier: this.getDamageMultiplier() // Include buffs
        };
    }

    /**
     * Check if player can dodge
     * @returns {boolean}
     */
    canDodge() {
        return this.dodgeCooldown === 0 && !this.isDowned && !this.isDodging;
    }

    /**
     * Start dodge roll
     * @param {number} dirX - Direction to dodge (optional, uses facing if not provided)
     * @param {number} dirY
     */
    startDodge(dirX = this.facingX, dirY = this.facingY) {
        if (!this.canDodge()) return;

        // Normalize direction
        const length = Math.sqrt(dirX * dirX + dirY * dirY);
        if (length === 0) {
            dirX = this.facingX;
            dirY = this.facingY;
        } else {
            dirX /= length;
            dirY /= length;
        }

        this.isDodging = true;
        this.dodgeTimer = 0;
        this.dodgeDirectionX = dirX;
        this.dodgeDirectionY = dirY;
        this.dodgeCooldown = this.dodgeCooldownTime;

        // Set dodge velocity
        this.velocityX = dirX * this.dodgeSpeed;
        this.velocityY = dirY * this.dodgeSpeed;
    }

    /**
     * Check if player has invincibility frames
     * @returns {boolean}
     */
    isInvincible() {
        return this.isDodging;
    }

    /**
     * Update dodge state
     * @param {number} delta - Time in ms
     */
    updateDodge(delta) {
        if (!this.isDodging) return;

        this.dodgeTimer += delta;

        if (this.dodgeTimer >= this.dodgeDuration) {
            // End dodge
            this.isDodging = false;
            this.dodgeTimer = 0;
            this.velocityX = 0;
            this.velocityY = 0;
        }
    }

    /**
     * Grant perfect dodge damage buff
     */
    grantPerfectDodgeBuff() {
        this.perfectDodgeBuff = 3000; // 3 seconds
        console.log('PERFECT DODGE! +50% damage for 3s');
    }

    /**
     * Check if player has perfect dodge buff active
     * @returns {boolean}
     */
    hasPerfectDodgeBuff() {
        return this.perfectDodgeBuff > 0;
    }

    /**
     * Get current damage multiplier from buffs
     * @returns {number}
     */
    getDamageMultiplier() {
        let multiplier = 1.0;

        if (this.hasPerfectDodgeBuff()) {
            multiplier *= this.perfectDodgeMultiplier;
        }

        // Can add cocktail buffs here later

        return multiplier;
    }

    /**
     * Update downed state timer
     * @param {number} delta - Time in ms
     */
    updateDownedState(delta) {
        if (!this.isDowned) return;

        this.downedTimer += delta;

        // Permanent death after 10 seconds (design doc)
        if (this.downedTimer >= this.downedMaxTime) {
            // Phase 2: Just mark as dead
            // Later: game over, respawn system, etc.
            console.log(`Player ${this.playerNumber + 1} died permanently!`);
        }
    }

    /**
     * Override update to include downed state
     */
    update(delta) {
        super.update(delta);
        this.updateCooldowns(delta);
        this.updateDodge(delta);
        this.updateDownedState(delta);

        // Update dodge cooldown
        if (this.dodgeCooldown > 0) {
            this.dodgeCooldown -= delta;
            if (this.dodgeCooldown < 0) this.dodgeCooldown = 0;
        }

        // Update perfect dodge buff
        if (this.perfectDodgeBuff > 0) {
            this.perfectDodgeBuff -= delta;
            if (this.perfectDodgeBuff < 0) this.perfectDodgeBuff = 0;
        }
    }
}
