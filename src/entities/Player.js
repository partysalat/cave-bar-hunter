import { PIXELS_PER_UNIT, PLAYER_COLORS, worldToScreen } from '../systems/WorldConfig.js';

export default class Player {
    constructor(scene, playerNumber, worldX, worldY = 0) {
        this.scene = scene;
        this.playerNumber = playerNumber;
        this.color = PLAYER_COLORS[playerNumber] ?? PLAYER_COLORS[0];

        this.worldX = worldX;
        this.worldY = worldY;
        this.velocityX = 0;
        this.velocityY = 0;

        this.moveSpeed = 10;
        this.jumpVelocity = 18;
        this.dodgeSpeed = 18;
        this.dodgeDuration = 0.22;
        this.dodgeCooldownDuration = 0.8;
        this.invincibilityDuration = 0.5;
        this.meleeCooldownDuration = 0.35;
        this.throwCooldownDuration = 0.6;

        this.width = 0.8;
        this.height = 1.8;
        this.facing = 1;
        this.onGround = worldY <= 0;
        this.health = 3;
        this.maxHealth = 3;
        this.score = 0;
        this.isDodging = false;
        this.dodgeTimeRemaining = 0;
        this.dodgeCooldownRemaining = 0;
        this.invincibilityTimeRemaining = 0;
        this.meleeCooldownRemaining = 0;
        this.throwCooldownRemaining = 0;

        this.sprite = scene.add.rectangle(0, 0, this.width * PIXELS_PER_UNIT, this.height * PIXELS_PER_UNIT, this.color);
        this.sprite.setOrigin(0.5, 1);
        this.updateScreenPosition();
    }

    move(direction) {
        if (this.isDodging) return;
        this.velocityX = direction * this.moveSpeed;
        if (direction !== 0) {
            this.facing = direction > 0 ? 1 : -1;
        }
    }

    stop() {
        if (this.isDodging) return;
        this.velocityX = 0;
    }

    jump() {
        if (!this.onGround || this.isDodging) return false;
        this.velocityY = this.jumpVelocity;
        this.onGround = false;
        return true;
    }

    canDodge() {
        return !this.isDodging && this.dodgeCooldownRemaining <= 0;
    }

    canMelee() {
        return this.meleeCooldownRemaining <= 0;
    }

    canThrow() {
        return this.throwCooldownRemaining <= 0;
    }

    startDodge(direction = this.facing) {
        if (!this.canDodge()) return false;
        this.isDodging = true;
        this.dodgeTimeRemaining = this.dodgeDuration;
        this.dodgeCooldownRemaining = this.dodgeCooldownDuration;
        this.invincibilityTimeRemaining = Math.max(this.invincibilityTimeRemaining, this.dodgeDuration);
        this.facing = direction >= 0 ? 1 : -1;
        this.velocityX = this.facing * this.dodgeSpeed;
        return true;
    }

    startMeleeAttack() {
        if (!this.canMelee()) return false;
        this.meleeCooldownRemaining = this.meleeCooldownDuration;
        return true;
    }

    startThrowAttack() {
        if (!this.canThrow()) return false;
        this.throwCooldownRemaining = this.throwCooldownDuration;
        return true;
    }

    isInvincible() {
        return this.invincibilityTimeRemaining > 0 || this.isDodging;
    }

    takeDamage(amount) {
        if (this.isInvincible()) return false;
        this.health = Math.max(0, this.health - amount);
        this.invincibilityTimeRemaining = this.invincibilityDuration;
        return true;
    }

    addScore(points) {
        this.score += points;
    }

    update(deltaSeconds) {
        if (this.dodgeCooldownRemaining > 0) {
            this.dodgeCooldownRemaining = Math.max(0, this.dodgeCooldownRemaining - deltaSeconds);
        }
        if (this.meleeCooldownRemaining > 0) {
            this.meleeCooldownRemaining = Math.max(0, this.meleeCooldownRemaining - deltaSeconds);
        }
        if (this.throwCooldownRemaining > 0) {
            this.throwCooldownRemaining = Math.max(0, this.throwCooldownRemaining - deltaSeconds);
        }
        if (this.invincibilityTimeRemaining > 0) {
            this.invincibilityTimeRemaining = Math.max(0, this.invincibilityTimeRemaining - deltaSeconds);
        }

        if (this.isDodging) {
            this.dodgeTimeRemaining = Math.max(0, this.dodgeTimeRemaining - deltaSeconds);
            if (this.dodgeTimeRemaining === 0) {
                this.isDodging = false;
                this.velocityX = 0;
            }
        }

        this.sprite.setAlpha(this.isInvincible() ? 0.65 : 1);
    }

    updateScreenPosition() {
        const screen = worldToScreen(this.worldX, this.worldY);
        this.sprite.x = screen.x;
        this.sprite.y = screen.y;
    }
}
