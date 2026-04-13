import { PIXELS_PER_UNIT, worldToScreen } from '../systems/WorldConfig.js';

export default class Projectile {
    constructor(scene, worldX, worldY, direction, damage = 2) {
        this.scene = scene;
        this.worldX = worldX;
        this.worldY = worldY;
        this.direction = direction >= 0 ? 1 : -1;
        this.speed = 18;
        this.radius = 0.22;
        this.damage = damage;
        this.active = true;

        this.sprite = scene.add.rectangle(0, 0, this.radius * PIXELS_PER_UNIT * 2, this.radius * PIXELS_PER_UNIT * 2, 0xf5f1a9);
        this.sprite.setOrigin(0.5, 0.5);
        this.updateScreenPosition();
    }

    update(deltaSeconds, arenaWidth) {
        if (!this.active) return;
        this.worldX += this.direction * this.speed * deltaSeconds;
        if (this.worldX < 0 || this.worldX > arenaWidth) {
            this.destroy();
            return;
        }
        this.updateScreenPosition();
    }

    destroy() {
        this.active = false;
        this.sprite.destroy();
    }

    updateScreenPosition() {
        const screen = worldToScreen(this.worldX, this.worldY);
        this.sprite.x = screen.x;
        this.sprite.y = screen.y - this.radius * PIXELS_PER_UNIT;
    }
}
