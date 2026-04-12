import Phaser from 'phaser';
import Player from '../entities/Player.js';
import InputManager from '../systems/InputManager.js';
import { applyPlayerPhysics } from '../systems/PhysicsManager.js';
import CameraController from '../systems/CameraController.js';
import { ARENA, FLOOR_Y, PIXELS_PER_UNIT, SCREEN_HEIGHT, SCREEN_WIDTH, worldToScreen } from '../systems/WorldConfig.js';

const PLATFORMS = [
    { x: 8, y: 2.5, width: 6 },
    { x: 20, y: 4.25, width: 5 },
    { x: 31, y: 3.25, width: 7 },
];

export default class MovementSandboxScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MovementSandboxScene' });
    }

    create() {
        this.inputManager = new InputManager(this);
        this.inputManager.setupKeyboard();
        this.cameraController = new CameraController(this.cameras.main);

        this.drawBackdrop();
        this.drawPlatforms();
        this.drawInstructions();

        this.players = [new Player(this, 0, 4, 0)];
        this.jumpHeld = false;
        this.dodgeHeld = false;

        this.cameras.main.setBounds(0, 0, ARENA.width * PIXELS_PER_UNIT, SCREEN_HEIGHT);
    }

    drawBackdrop() {
        this.add.rectangle((ARENA.width * PIXELS_PER_UNIT) / 2, SCREEN_HEIGHT / 2, ARENA.width * PIXELS_PER_UNIT, SCREEN_HEIGHT, 0x1b2130)
            .setOrigin(0.5, 0.5);

        this.add.rectangle((ARENA.width * PIXELS_PER_UNIT) / 2, FLOOR_Y + 48, ARENA.width * PIXELS_PER_UNIT, 96, 0x5b4027)
            .setOrigin(0.5, 0.5);
    }

    drawPlatforms() {
        PLATFORMS.forEach((platform) => {
            const left = worldToScreen(platform.x, platform.y);
            const width = platform.width * PIXELS_PER_UNIT;
            this.add.rectangle(left.x + width / 2, left.y, width, 16, 0x8a6d3b)
                .setOrigin(0.5, 0.5);
        });
    }

    drawInstructions() {
        this.add.text(24, 24, 'Slice 1 Sandbox\nArrow keys: move / jump\nShift: dodge', {
            color: '#ffffff',
            fontSize: '24px',
            fontFamily: 'monospace',
        }).setScrollFactor(0);

        this.statusText = this.add.text(24, 110, '', {
            color: '#a8d8ff',
            fontSize: '18px',
            fontFamily: 'monospace',
        }).setScrollFactor(0);
    }

    update(_time, delta) {
        const deltaSeconds = delta / 1000;
        const player = this.players[0];
        const input = this.inputManager.getPlayerInputWithKeyboard(0);

        if (input) {
            const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
            if (direction === 0) {
                player.stop();
            } else {
                player.move(direction);
            }

            if (input.jumpPressed && !this.jumpHeld) {
                player.jump();
            }
            if (input.dodgePressed && !this.dodgeHeld) {
                player.startDodge(direction !== 0 ? direction : player.facing);
            }

            this.jumpHeld = input.jumpPressed;
            this.dodgeHeld = input.dodgePressed;
        }

        player.update(deltaSeconds);
        applyPlayerPhysics(player, deltaSeconds, PLATFORMS, ARENA.width);
        player.updateScreenPosition();

        this.cameraController.update(this.players);
        this.statusText.setText(
            `x=${player.worldX.toFixed(2)}  y=${player.worldY.toFixed(2)}  vy=${player.velocityY.toFixed(2)}\n` +
            `ground=${player.onGround}  dodge=${player.isDodging}  cooldown=${player.dodgeCooldownRemaining.toFixed(2)}`
        );
    }
}
