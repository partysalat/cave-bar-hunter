import Phaser from 'phaser';

import {
    ensureGeneratedSpriteCookAnimations,
    listGeneratedSpriteCookEntities,
    listSpriteCookStaticAssets,
    spriteCookAssetUrl,
} from '../rendering/spritecookAssets.js';
import { SCENE_KEYS } from './sceneKeys.js';

export class PreloadScene extends Phaser.Scene {
    private statusText?: Phaser.GameObjects.Text;
    private progressText?: Phaser.GameObjects.Text;

    constructor() {
        super({ key: SCENE_KEYS.PRELOAD });
    }

    preload(): void {
        const { width, height } = this.scale;
        const staticAssets = listSpriteCookStaticAssets();
        const generatedEntities = listGeneratedSpriteCookEntities();
        const queuedAssets = staticAssets.length + generatedEntities.length;

        this.cameras.main.setBackgroundColor('#08120a');

        this.add
            .text(width / 2, height / 2 - 40, 'Loading SpriteCook assets...', {
                color: '#f2ffe9',
                fontFamily: 'monospace',
                fontSize: '20px',
            })
            .setOrigin(0.5);

        this.progressText = this.add
            .text(width / 2, height / 2 + 4, '0%', {
                color: '#c7f0b5',
                fontFamily: 'monospace',
                fontSize: '18px',
            })
            .setOrigin(0.5);

        this.statusText = this.add
            .text(width / 2, height / 2 + 34, `${queuedAssets} files queued`, {
                color: '#9ad28a',
                fontFamily: 'monospace',
                fontSize: '14px',
            })
            .setOrigin(0.5);

        for (const asset of staticAssets) {
            this.load.image(asset.key, spriteCookAssetUrl(asset.file));
        }

        for (const entity of generatedEntities) {
            this.load.atlas(entity.atlasKey, entity.imageUrl, entity.atlasData);
        }

        this.load.on(Phaser.Loader.Events.PROGRESS, (value: number) => {
            this.progressText?.setText(`${Math.round(value * 100)}%`);
        });

        this.load.on(Phaser.Loader.Events.COMPLETE, () => {
            this.statusText?.setText('Assets ready');
        });
    }

    create(): void {
        ensureGeneratedSpriteCookAnimations(this.anims);
        this.time.delayedCall(75, () => {
            this.scene.start(SCENE_KEYS.HUNT);
        });
    }
}
