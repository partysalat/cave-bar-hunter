import Entity from './Entity.js';
import { updatePlayerAnimation, updatePlayerSpriteDirection, getPlayerAnimationKey } from '../systems/SpriteDirectionSystem.js';

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
    constructor(scene, playerNumber, worldX, worldY) {
        super(scene, worldX, worldY);
        this.affectedByGravity = true;

        this.playerNumber = playerNumber;
        this.color = PLAYER_COLORS[playerNumber];

        this.sprite.setScale(1.5);

        // Initialize sprite with idle animation
        const initialAnimKey = getPlayerAnimationKey(playerNumber, 'idle');
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
        this.facingX = 1; // Direction player is facing (positive = right)
        this.facingY = 0; // Always 0 in sidescroller (no vertical facing)

        // Jump state
        this.jumpVelocity = 15; // world units/second upward

        // Dodge stats (from design doc)
        this.isDodging = false;
        this.dodgeTimer = 0;
        this.dodgeDuration = 500; // 0.5 seconds (invincibility frames)
        this.dodgeCooldown = 0;
        this.dodgeCooldownTime = 3000; // 3 seconds (from design doc)
        this.dodgeSpeed = 16; // 2× normal speed during roll
        this.dodgeDirectionX = 0;

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
     * Moves player horizontally based on input
     * @param {number} dirX - Horizontal direction (-1, 0, 1)
     */
    move(dirX) {
        if (this.isDodging) return;

        let speed = this.moveSpeed;
        if (this.isDowned) {
            speed = this.crawlSpeed;
        } else if (this.isAttacking) {
            speed = this.moveSpeed * ATTACK_MOVEMENT_SPEED_MULTIPLIER;
        }

        this.velocityX = dirX * speed;

        if (dirX !== 0) {
            this.facingX = dirX;
            this.isMoving = true;
            if (!this.isAttacking) {
                updatePlayerAnimation(this.sprite, this.playerNumber, this.facingX, this.isMoving, !this.onGround, this.velocityY);
            }
        }
    }

    /**
     * Jump if on the ground
     */
    jump() {
        if (!this.onGround || this.isDowned || this.isDodging) return;
        this.velocityY = this.jumpVelocity;
        this.onGround = false;
        updatePlayerAnimation(this.sprite, this.playerNumber, this.facingX, this.isMoving, true, this.velocityY);
    }

    /**
     * Stops player movement
     */
    stop() {
        this.velocityX = 0;
        this.isMoving = false;

        if (!this.isAttacking) {
            this.updateIdleAnimation();
        }
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
        updatePlayerAnimation(this.sprite, this.playerNumber, this.facingX, this.isMoving, !this.onGround, this.velocityY);

        // Start cooldown
        this.spearCooldown = this.spearCooldownTime;

        return {
            worldX: this.worldX,
            worldY: this.worldY,
            dirX,
            dirY,
            damageMultiplier: this.getDamageMultiplier()
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

        // Direction handled by sprite flip, not animation key
        updatePlayerSpriteDirection(this.sprite, this.facingX);
        this.sprite.play(`player-${this.playerNumber}-attack`);
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
        updatePlayerSpriteDirection(this.sprite, this.facingX);
        const idleKey = getPlayerAnimationKey(this.playerNumber, 'idle');
        if (this.sprite.anims.currentAnim?.key !== idleKey) {
            this.sprite.play(idleKey);
        }
    }

    /**
     * Gets current direction string from facing vector
     * @returns {string} Direction name
     */
    getCurrentDirection() {
        return this.facingX >= 0 ? 'right' : 'left';
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
    startDodge(dirX = this.facingX) {
        if (!this.canDodge()) return;

        const dir = dirX >= 0 ? 1 : -1;
        this.isDodging = true;
        this.dodgeTimer = 0;
        this.dodgeDirectionX = dir;
        this.dodgeCooldown = this.dodgeCooldownTime;
        this.velocityX = dir * this.dodgeSpeed;
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
