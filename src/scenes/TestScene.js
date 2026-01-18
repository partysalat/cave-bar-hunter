import Phaser from 'phaser';
import Player from '../entities/Player.js';
import { worldToScreen } from '../systems/CoordinateSystem.js';

/**
 * Test scene for Phase 1 development
 * Renders isometric ground grid and test entities
 */
export default class TestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TestScene' });
    }

    create() {
        // Draw isometric ground grid for visualization
        this.drawGroundGrid();

        // Create test player at arena center
        this.player = new Player(this, 0, 15, 12, 0);

        // Add debug text
        this.debugText = this.add.text(10, 10, '', {
            font: '16px monospace',
            fill: '#00ff00'
        });
        this.debugText.setDepth(10000);
    }

    update(time, delta) {
        if (this.player) {
            this.player.update(delta);

            // Update debug info
            this.debugText.setText([
                `World: (${this.player.worldX.toFixed(1)}, ${this.player.worldY.toFixed(1)}, ${this.player.worldZ.toFixed(1)})`,
                `Screen: (${this.player.sprite.x.toFixed(0)}, ${this.player.sprite.y.toFixed(0)})`,
                `Depth: ${this.player.getDepth()}`
            ]);
        }
    }

    /**
     * Draws isometric grid for ground visualization
     * Helps verify coordinate system accuracy
     */
    drawGroundGrid() {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x00ff00, 0.3);

        // Draw grid lines for 30x25 world units
        for (let x = 0; x <= 30; x += 5) {
            const start = worldToScreen(x, 0, 0);
            const end = worldToScreen(x, 25, 0);
            graphics.lineBetween(start.x, start.y, end.x, end.y);
        }

        for (let y = 0; y <= 25; y += 5) {
            const start = worldToScreen(0, y, 0);
            const end = worldToScreen(30, y, 0);
            graphics.lineBetween(start.x, start.y, end.x, end.y);
        }

        graphics.setDepth(-1000);
    }
}
