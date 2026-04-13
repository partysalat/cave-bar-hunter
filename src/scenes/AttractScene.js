import Phaser from 'phaser';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../systems/WorldConfig.js';

export default class AttractScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AttractScene' });
    }

    create() {
        this.add.rectangle(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT, 0x11161f);
        this.add.text(SCREEN_WIDTH / 2, 150, 'PREHISTORIC HUNTER', {
            color: '#ffd27a',
            fontSize: '54px',
            fontFamily: 'monospace',
        }).setOrigin(0.5, 0.5);

        this.rotatingText = this.add.text(SCREEN_WIDTH / 2, 290, '', {
            color: '#ffffff',
            fontSize: '28px',
            fontFamily: 'monospace',
            align: 'center',
        }).setOrigin(0.5, 0.5);

        this.callToAction = this.add.text(SCREEN_WIDTH / 2, 520, 'PRESS C OR SPACE TO BEGIN', {
            color: '#a8f0c5',
            fontSize: '30px',
            fontFamily: 'monospace',
        }).setOrigin(0.5, 0.5);

        this.slides = [
            'CO-OP SIDESCROLLER DINOSAUR HUNTS\n1-4 PLAYERS',
            'EARN POINTS, BUY UPGRADES,\nSURVIVE FIVE HUNTS',
            'DODGE, FLANK, REVIVE,\nAND CHASE MVP',
        ];
        this.slideIndex = 0;
        this.rotatingText.setText(this.slides[this.slideIndex]);

        this.time.addEvent({
            delay: 2200,
            loop: true,
            callback: () => {
                this.slideIndex = (this.slideIndex + 1) % this.slides.length;
                this.rotatingText.setText(this.slides[this.slideIndex]);
                this.callToAction.setVisible(!this.callToAction.visible);
            },
        });

        this.startKeys = this.input.keyboard.addKeys({
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            c: Phaser.Input.Keyboard.KeyCodes.C,
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.startKeys.space) || Phaser.Input.Keyboard.JustDown(this.startKeys.c)) {
            this.scene.start('PlayerSelectScene');
        }
    }
}
