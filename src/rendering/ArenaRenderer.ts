import Phaser from 'phaser';

import { spriteCookAssetKey } from './spritecookAssets.js';

export interface ArenaRendererResult {
    background: Phaser.GameObjects.GameObject[];
}

export class ArenaRenderer {
    constructor(private readonly scene: Phaser.Scene) {}

    private textureScaleForHeight(textureKey: string, targetHeight: number): number {
        const sourceImage = this.scene.textures.get(textureKey).getSourceImage() as { height: number };
        return targetHeight / sourceImage.height;
    }

    create(): ArenaRendererResult {
        const { width, height } = this.scene.scale;

        const background: Phaser.GameObjects.GameObject[] = [];

        background.push(
            this.scene.add
                .rectangle(width / 2, height / 2, width, height, 0x06110a, 1)
                .setDepth(0),
        );

        const canopy = this.scene.add
            .tileSprite(0, 0, width, height * 0.34, spriteCookAssetKey(['players', 'arenas', 'dense-jungle', 'tiles', 'canopy']))
            .setOrigin(0, 0)
            .setScrollFactor(0.3)
            .setAlpha(0.92)
            .setDepth(2);

        const midKey = spriteCookAssetKey(['players', 'arenas', 'dense-jungle', 'tiles', 'mid']);
        const midScale = this.textureScaleForHeight(midKey, height * 0.58);
        const midY = height * 0.47;
        const midXPositions = [-0.08, 0.23, 0.5, 0.77, 1.08].map((fraction) => width * fraction);

        const midGlow = this.scene.add
            .rectangle(width / 2, height * 0.35, width, height * 0.5, 0x355d21, 0.18)
            .setDepth(3)
            .setScrollFactor(0.6);

        background.push(canopy, midGlow);

        for (const x of midXPositions) {
            background.push(
                this.scene.add
                    .image(x, midY, midKey)
                    .setOrigin(0.5, 0.5)
                    .setScale(midScale)
                    .setAlpha(0.92)
                    .setDepth(6)
                    .setScrollFactor(0.6),
            );
        }

        const floorBase = this.scene.add
            .rectangle(width / 2, height * 0.84, width, height * 0.36, 0x07140b, 0.96)
            .setDepth(8)
            .setScrollFactor(1);

        const floorKey = spriteCookAssetKey(['players', 'arenas', 'dense-jungle', 'tiles', 'floor']);
        const floorScale = this.textureScaleForHeight(floorKey, height * 0.3);
        const floorY = height * 0.79;
        const floorXPositions = [-0.03, 0.23, 0.5, 0.77, 1.03].map((fraction) => width * fraction);

        background.push(floorBase);

        for (const x of floorXPositions) {
            background.push(
                this.scene.add
                    .image(x, floorY, floorKey)
                    .setOrigin(0.5, 0.5)
                    .setScale(floorScale)
                    .setAlpha(0.98)
                    .setDepth(12)
                    .setScrollFactor(1),
            );
        }

        const propLayout = [
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'tree'], x: width * 0.13, y: height * 0.74, scale: 0.82, depth: 18 },
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'liana'], x: width * 0.40, y: height * 0.29, scale: 0.9, depth: 14 },
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'bush'], x: width * 0.76, y: height * 0.78, scale: 0.95, depth: 20 },
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'tree'], x: width * 0.87, y: height * 0.70, scale: 0.72, depth: 18 },
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
