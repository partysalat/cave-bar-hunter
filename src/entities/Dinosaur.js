import { PIXELS_PER_UNIT, worldToScreen } from '../systems/WorldConfig.js';
import { createAtlasSpriteOrFallback, textureExists } from '../systems/AssetLoader.js';

export default class Dinosaur {
    constructor(scene, worldX, worldY = 0) {
        this.scene = scene;
        this.worldX = worldX;
        this.worldY = worldY;
        this.velocityX = 0;
        this.velocityY = 0;

        this.width = 1.1;
        this.height = 1.2;
        this.moveSpeed = 5;
        this.attackRange = 1.2;
        this.maxHealth = 5;
        this.health = 5;
        this.attackCooldownDuration = 0.9;
        this.attackCooldownRemaining = 0;
        this.active = true;

        this.sprite = createAtlasSpriteOrFallback(
            scene,
            0,
            0,
            'compy',
            'compy-idle-0',
            this.width * PIXELS_PER_UNIT,
            this.height * PIXELS_PER_UNIT,
            0x63c174
        );
        this.sprite.setOrigin?.(0.5, 1);
        this.sprite.setScale?.(1.5);
        this.updateScreenPosition();
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        if (this.health === 0) {
            this.active = false;
            this.sprite.setAlpha?.(0.35);
        }
    }

    canAttack() {
        return this.active && this.attackCooldownRemaining <= 0;
    }

    spendAttack() {
        this.attackCooldownRemaining = this.attackCooldownDuration;
    }

    update(deltaSeconds) {
        if (this.attackCooldownRemaining > 0) {
            this.attackCooldownRemaining = Math.max(0, this.attackCooldownRemaining - deltaSeconds);
        }

        this.worldX += this.velocityX * deltaSeconds;
        this.updateVisualState();
        this.updateScreenPosition();
    }

    updateScreenPosition() {
        const screen = worldToScreen(this.worldX, this.worldY);
        this.sprite.x = screen.x;
        this.sprite.y = screen.y;
    }

    updateVisualState() {
        this.sprite.setFlipX?.(this.velocityX < 0);
        if (!textureExists(this.scene, 'compy') || !this.sprite.setTexture) return;

        let frame = 'compy-idle-0';
        if (!this.active) frame = 'compy-downed-0';
        else if (Math.abs(this.velocityX) > 4) frame = 'compy-run-0';
        else if (Math.abs(this.velocityX) > 0.1) frame = 'compy-walk-0';

        this.sprite.setTexture('compy', frame);
    }
}
