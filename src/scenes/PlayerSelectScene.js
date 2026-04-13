import Phaser from 'phaser';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../systems/WorldConfig.js';
import { gameSession } from '../systems/SessionManager.js';

export default class PlayerSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayerSelectScene' });
    }

    create() {
        this.add.rectangle(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT, 0x18212a);
        this.add.text(SCREEN_WIDTH / 2, 140, 'PLAYER SELECT', {
            color: '#ffd27a',
            fontSize: '48px',
            fontFamily: 'monospace',
        }).setOrigin(0.5, 0.5);

        this.add.text(SCREEN_WIDTH / 2, 280, 'SLICE 5 VERSION\nPLAYER 1 IS READY', {
            color: '#ffffff',
            fontSize: '28px',
            fontFamily: 'monospace',
            align: 'center',
        }).setOrigin(0.5, 0.5);

        this.add.text(SCREEN_WIDTH / 2, 500, 'PRESS C OR SPACE TO START THE SESSION', {
            color: '#a8f0c5',
            fontSize: '28px',
            fontFamily: 'monospace',
        }).setOrigin(0.5, 0.5);

        this.startKeys = this.input.keyboard.addKeys({
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            c: Phaser.Input.Keyboard.KeyCodes.C,
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.startKeys.space) || Phaser.Input.Keyboard.JustDown(this.startKeys.c)) {
            gameSession.startNewSession();
            this.scene.start('HuntScene');
        }
    }
}
