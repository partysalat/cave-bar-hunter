import { PIXELS_PER_UNIT, worldToScreen } from '../systems/WorldConfig.js';

export default class TrainingDummy {
    constructor(scene, worldX, worldY = 0) {
        this.scene = scene;
        this.worldX = worldX;
        this.worldY = worldY;
        this.width = 1.2;
        this.height = 2.2;
        this.maxHealth = 12;
        this.health = 12;
        this.attackRange = 2.5;
        this.attackCooldownDuration = 1;
        this.attackCooldownRemaining = 0;

        this.sprite = scene.add.rectangle(0, 0, this.width * PIXELS_PER_UNIT, this.height * PIXELS_PER_UNIT, 0xc96845);
        this.sprite.setOrigin(0.5, 1);
        this.updateScreenPosition();
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }

    update(deltaSeconds) {
        if (this.attackCooldownRemaining > 0) {
            this.attackCooldownRemaining = Math.max(0, this.attackCooldownRemaining - deltaSeconds);
        }
    }

    canAttack() {
        return this.attackCooldownRemaining <= 0 && this.health > 0;
    }

    spendAttack() {
        this.attackCooldownRemaining = this.attackCooldownDuration;
    }

    reset() {
        this.health = this.maxHealth;
    }

    updateScreenPosition() {
        const screen = worldToScreen(this.worldX, this.worldY);
        this.sprite.x = screen.x;
        this.sprite.y = screen.y;
    }
}
