import Entity from './Entity.js';
import { updatePlayerAnimation, getPlayerAnimationKey } from '../systems/SpriteDirectionSystem.js';

// Player color mapping from design doc (kept for reference, now using PixelLab sprites)
const PLAYER_COLORS = [
    0xff0000, // Player 1: Red
    0x0000ff, // Player 2: Blue
    0xffff00, // Player 3: Yellow
    0x00ff00  // Player 4: Green
];

// Club attack timing constants (milliseconds)
const ATTACK_WINDUP_DURATION = 150;
const ATTACK_SWING_DURATION = 300;
const ATTACK_RECOVERY_DURATION = 200;
const ATTACK_COOLDOWN_TIME = 1000;
const ATTACK_MOVEMENT_SPEED_MULTIPLIER = 0.5; // Move at 50% speed while attacking

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

        this.sprite.setScale(1.5);

        // Initialize sprite with idle animation facing south
        const initialAnimKey = getPlayerAnimationKey(playerNumber, 'south', false);
        this.sprite.play(initialAnimKey);

        // Weapon state (weapons are baked into animations)
        this.hasWeaponDrawn = false; // Track if weapon is equipped (switches between breathing-idle and fight-stance-idle)

        // Movement state
        this.isMoving = false;

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
        this.facingX = 0; // Direction player is facing
        this.facingY = 1; // Start facing south

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

        // Attack stats (club melee)
        this.isAttacking = false;
        this.attackTimer = 0;
        this.attackPhase = 'none'; // 'windup', 'swing', 'recovery', 'none'
        this.attackCooldown = 0;
        this.attackCooldownTime = ATTACK_COOLDOWN_TIME;
        this.hitEnemiesThisSwing = []; // Track enemies hit this swing

        // Attack phase durations (must sum to attackDuration)
        this.windupDuration = ATTACK_WINDUP_DURATION;
        this.swingDuration = ATTACK_SWING_DURATION;
        this.recoveryDuration = ATTACK_RECOVERY_DURATION;
        this.attackDuration = this.windupDuration + this.swingDuration + this.recoveryDuration;
    }

    /**
     * Moves player based on D-pad input direction
     * @param {number} dirX - X direction (-1, 0, 1)
     * @param {number} dirY - Y direction (-1, 0, 1)
     */
    move(dirX, dirY) {
        if (this.isDodging) return; // Can't move during dodge

        // Normalize diagonal movement
        if (dirX !== 0 && dirY !== 0) {
            const length = Math.sqrt(dirX * dirX + dirY * dirY);
            dirX /= length;
            dirY /= length;
        }

        // Calculate speed based on state
        let speed = this.moveSpeed;
        if (this.isDowned) {
            speed = this.crawlSpeed;
        } else if (this.isAttacking) {
            speed = this.moveSpeed * ATTACK_MOVEMENT_SPEED_MULTIPLIER;
        }

        this.velocityX = dirX * speed;
        this.velocityY = dirY * speed;

        // Update facing and animation
        if (dirX !== 0 || dirY !== 0) {
            this.facingX = dirX;
            this.facingY = dirY;
            this.isMoving = true;
            updatePlayerAnimation(this.sprite, this.playerNumber, this.facingX, this.facingY, this.isMoving);
        }
    }

    /**
     * Stops player movement
     */
    stop() {
        this.velocityX = 0;
        this.velocityY = 0;
        this.isMoving = false;
        this.updateIdleAnimation(); // Use weapon-aware idle animation
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

        // Update facing direction and animation
        this.facingX = dirX;
        this.facingY = dirY;
        updatePlayerAnimation(this.sprite, this.playerNumber, this.facingX, this.facingY, this.isMoving);

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
     * Check if player can attack
     * @returns {boolean}
     */
    canAttack() {
        return this.attackCooldown === 0 && !this.isDowned && !this.isAttacking;
    }

    /**
     * Start club attack
     */
    startAttack() {
        if (!this.canAttack()) return;

        this.isAttacking = true;
        this.attackTimer = 0;
        this.attackPhase = 'windup';
        this.hitEnemiesThisSwing = [];

        // Play club swing attack animation
        const direction = this.getCurrentDirection();
        const clubSwingKey = `player-${this.playerNumber}-club-swing-${direction}`;
        this.sprite.play(clubSwingKey);
    }

    /**
     * Update attack state
     * @param {number} delta - Time in ms
     */
    updateAttack(delta) {
        if (!this.isAttacking) return;

        this.attackTimer += delta;

        // Progress through attack phases (check all conditions to allow multi-phase transitions in one update)
        if (this.attackPhase === 'windup' && this.attackTimer >= this.windupDuration) {
            this.attackPhase = 'swing';
        }
        if (this.attackPhase === 'swing' && this.attackTimer >= this.windupDuration + this.swingDuration) {
            this.attackPhase = 'recovery';
        }
        if (this.attackPhase === 'recovery' && this.attackTimer >= this.attackDuration) {
            // Attack complete
            this.isAttacking = false;
            this.attackPhase = 'none';
            this.attackTimer = 0;
            this.attackCooldown = this.attackCooldownTime;
            this.hitEnemiesThisSwing = [];

            // Restore appropriate idle animation (fight stance if weapon drawn, else normal idle)
            this.updateIdleAnimation();
        }
    }

    /**
     * Updates idle animation based on weapon state
     */
    updateIdleAnimation() {
        const direction = this.getCurrentDirection();

        if (this.hasWeaponDrawn) {
            // Use fight stance idle when weapon is equipped
            const fightStanceKey = `player-${this.playerNumber}-fight-stance-${direction}`;
            if (this.sprite.anims.currentAnim?.key !== fightStanceKey) {
                this.sprite.play(fightStanceKey);
            }
        } else {
            // Use normal breathing idle when no weapon
            const idleKey = `player-${this.playerNumber}-idle-${direction}`;
            if (this.sprite.anims.currentAnim?.key !== idleKey) {
                this.sprite.play(idleKey);
            }
        }
    }

    /**
     * Gets current direction string from facing vector
     * @returns {string} Direction name
     */
    getCurrentDirection() {
        // Map facing vector to direction string
        const angle = Math.atan2(this.facingY, this.facingX);
        const degrees = angle * (180 / Math.PI);

        // Normalize to 0-360
        const normalizedDegrees = (degrees + 360) % 360;

        // Map to 8 directions (45 degree segments)
        if (normalizedDegrees < 22.5 || normalizedDegrees >= 337.5) return 'east';
        if (normalizedDegrees < 67.5) return 'south-east';
        if (normalizedDegrees < 112.5) return 'south';
        if (normalizedDegrees < 157.5) return 'south-west';
        if (normalizedDegrees < 202.5) return 'west';
        if (normalizedDegrees < 247.5) return 'north-west';
        if (normalizedDegrees < 292.5) return 'north';
        return 'north-east';
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
     * Sets whether the player has a weapon equipped
     * This switches between breathing-idle and fight-stance-idle animations
     * @param {boolean} equipped - Whether weapon is equipped
     */
    setWeaponEquipped(equipped) {
        this.hasWeaponDrawn = equipped;

        // Switch to appropriate idle animation if not moving or attacking
        if (!this.isMoving && !this.isAttacking) {
            this.updateIdleAnimation();
        }
    }

    /**
     * Override update to include downed state and weapon position
     */
    update(delta) {
        super.update(delta);
        this.updateCooldowns(delta);
        this.updateDodge(delta);
        this.updateDownedState(delta);
        this.updateAttack(delta); // Add attack update

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

        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= delta;
            if (this.attackCooldown < 0) this.attackCooldown = 0;
        }
    }
}
