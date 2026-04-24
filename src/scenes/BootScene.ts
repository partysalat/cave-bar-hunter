import Phaser from 'phaser';

import { SCENE_KEYS } from './sceneKeys.js';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.BOOT });
    }

    create(): void {
        const { width, height } = this.scale;

        this.cameras.main.setBackgroundColor('#050806');
        this.add
            .text(width / 2, height / 2, 'Booting the hunt runtime...', {
                color: '#c7f0b5',
                fontFamily: 'monospace',
                fontSize: '20px',
            })
            .setOrigin(0.5);

        this.time.delayedCall(25, () => {
            this.scene.start(SCENE_KEYS.PRELOAD);
        });
    }
}
