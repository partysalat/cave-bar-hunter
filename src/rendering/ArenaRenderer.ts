import Phaser from 'phaser';

import { spriteCookAssetKey } from './spritecookAssets.js';

export interface ArenaRendererResult {
    background: Phaser.GameObjects.GameObject[];
}

export class ArenaRenderer {
    constructor(private readonly scene: Phaser.Scene) {}

    create(): ArenaRendererResult {
        const { width, height } = this.scene.scale;

        const background: Phaser.GameObjects.GameObject[] = [];

        const canopy = this.scene.add
            .tileSprite(0, 0, width, height * 0.55, spriteCookAssetKey(['arenas', 'dense-jungle', 'tiles', 'canopy']))
            .setOrigin(0, 0)
            .setScrollFactor(0.3)
            .setAlpha(0.95);

        const mid = this.scene.add
            .tileSprite(0, height * 0.1, width, height * 0.75, spriteCookAssetKey(['arenas', 'dense-jungle', 'tiles', 'mid']))
            .setOrigin(0, 0)
            .setScrollFactor(0.6)
            .setAlpha(0.96);

        const floor = this.scene.add
            .tileSprite(0, height * 0.52, width, height * 0.48, spriteCookAssetKey(['arenas', 'dense-jungle', 'tiles', 'floor']))
            .setOrigin(0, 0)
            .setScrollFactor(1)
            .setAlpha(0.98);

        background.push(canopy, mid, floor);

        const propLayout = [
            { key: ['arenas', 'dense-jungle', 'props', 'tree'], x: width * 0.13, y: height * 0.74, scale: 0.82, depth: 18 },
            { key: ['arenas', 'dense-jungle', 'props', 'liana'], x: width * 0.40, y: height * 0.29, scale: 0.9, depth: 14 },
            { key: ['arenas', 'dense-jungle', 'props', 'bush'], x: width * 0.76, y: height * 0.78, scale: 0.95, depth: 20 },
            { key: ['arenas', 'dense-jungle', 'props', 'tree'], x: width * 0.87, y: height * 0.70, scale: 0.72, depth: 18 },
        ] as const;

        for (const prop of propLayout) {
            background.push(
                this.scene.add
                    .image(prop.x, prop.y, spriteCookAssetKey(prop.key))
                    .setOrigin(0.5, 1)
                    .setScale(prop.scale)
                    .setDepth(prop.depth)
                    .setScrollFactor(1),
            );
        }

        this.scene.add
            .rectangle(width / 2, height / 2, width, height, 0x06110a, 0.08)
            .setDepth(1);

        return { background };
    }
}
