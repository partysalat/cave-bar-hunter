import Phaser from 'phaser';

import { spriteCookAssetKey } from '../rendering/spritecookAssets.js';
import { SCENE_KEYS } from './sceneKeys.js';

export class CaveBarScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.CAVE_BAR });
    }

    create(): void {
        const { width, height } = this.scale;

        this.cameras.main.setBackgroundColor('#130f12');

        this.add
            .tileSprite(0, 0, width, height, spriteCookAssetKey(['players', 'cavebar', 'tiles', 'wall-far']))
            .setOrigin(0, 0)
            .setScrollFactor(0.2)
            .setAlpha(0.65);

        this.add
            .tileSprite(0, height * 0.42, width, height * 0.58, spriteCookAssetKey(['players', 'cavebar', 'tiles', 'floor']))
            .setOrigin(0, 0)
            .setScrollFactor(1)
            .setAlpha(0.95);

        this.add
            .image(width * 0.5, height * 0.58, spriteCookAssetKey(['players', 'cavebar', 'props', 'scoreboard']))
            .setScale(0.9)
            .setDepth(20);

        this.add
            .image(width * 0.25, height * 0.67, spriteCookAssetKey(['players', 'cavebar', 'props', 'bar-counter']))
            .setScale(0.92)
            .setDepth(18);

        this.add
            .image(width * 0.76, height * 0.67, spriteCookAssetKey(['players', 'cavebar', 'props', 'exit-arch']))
            .setScale(0.85)
            .setDepth(18);

        this.add
            .text(width / 2, 32, 'Cave Bar Ready Stub', {
                color: '#ffe9b8',
                fontFamily: 'monospace',
                fontSize: '24px',
            })
            .setOrigin(0.5, 0.5)
            .setDepth(50);

        this.add
            .text(width / 2, 66, '1 / 1 ready - press Space or click to return to the hunt', {
                color: '#f2ffe9',
                fontFamily: 'monospace',
                fontSize: '16px',
            })
            .setOrigin(0.5, 0.5)
            .setDepth(50);

        const returnToHunt = (): void => {
            this.scene.start(SCENE_KEYS.HUNT);
        };

        this.input.keyboard?.once('keydown-SPACE', returnToHunt);
        this.input.once('pointerdown', returnToHunt);
    }
}
