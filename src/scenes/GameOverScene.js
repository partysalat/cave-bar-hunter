import Phaser from 'phaser';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../systems/WorldConfig.js';
import { gameSession } from '../systems/SessionManager.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        const player = gameSession.getPlayerData(0);

        this.add.rectangle(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT, 0x1b1010);
        this.add.text(SCREEN_WIDTH / 2, 150, 'GAME OVER', {
            color: '#ff7b7b',
            fontSize: '54px',
            fontFamily: 'monospace',
        }).setOrigin(0.5, 0.5);

        this.add.text(SCREEN_WIDTH / 2, 310, `FINAL SCORE ${player.score}\nFAILED ON HUNT ${gameSession.currentHunt}`, {
            color: '#ffffff',
            fontSize: '30px',
            fontFamily: 'monospace',
            align: 'center',
        }).setOrigin(0.5, 0.5);

        this.add.text(SCREEN_WIDTH / 2, 520, 'PRESS C OR SPACE TO RETURN TO ATTRACT', {
            color: '#ffd27a',
            fontSize: '26px',
            fontFamily: 'monospace',
        }).setOrigin(0.5, 0.5);

        this.startKeys = this.input.keyboard.addKeys({
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            c: Phaser.Input.Keyboard.KeyCodes.C,
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.startKeys.space) || Phaser.Input.Keyboard.JustDown(this.startKeys.c)) {
            gameSession.reset();
            this.scene.start('AttractScene');
        }
    }
}
