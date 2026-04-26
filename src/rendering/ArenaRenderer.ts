import Phaser from 'phaser';

import { spriteCookAssetKey } from './spritecookAssets.js';

export interface ArenaRendererResult {
    background: Phaser.GameObjects.GameObject[];
}

export class ArenaRenderer {
    constructor(private readonly scene: Phaser.Scene) {}

    create(): ArenaRendererResult {
        const { width, height } = this.scene.scale;
        const canopyHeight = height * 0.46;
        const midBandTop = height * 0.43;
        const midBandHeight = height * 0.18;
        const groundTop = height * 0.72;
        const groundHeight = height * 0.28;
        const floorTileY = height * 0.9;
        const floorTileScale = 1.08;
        const floorTileXFractions = [-0.05, 0.075, 0.2, 0.325, 0.45, 0.575, 0.7, 0.825] as const;
        const lianaY = height * 0.26;
        const rearTreeY = height * 0.72;
        const frontTreeY = height * 0.82;
        const rearBushY = height * 0.73;
        const frontBushY = height * 0.84;
        const rearTreeScale = 1.08;
        const rearBushScale = 0.78;
        const frontTreeScale = 0.94;
        const frontBushScale = 1.02;
        const floorTileKey = spriteCookAssetKey(['players', 'arenas', 'dense-jungle', 'tiles', 'floor']);

        const background: Phaser.GameObjects.GameObject[] = [];

        background.push(
            this.scene.add
                .rectangle(width / 2, height / 2, width, height, 0x06110a, 1)
                .setDepth(0),
        );

        const canopy = this.scene.add
            .tileSprite(0, 0, width, canopyHeight, spriteCookAssetKey(['players', 'arenas', 'dense-jungle', 'tiles', 'canopy']))
            .setOrigin(0, 0)
            .setScrollFactor(0.3)
            .setAlpha(0.92)
            .setDepth(2);

        const undergrowthBand = this.scene.add
            .rectangle(width / 2, midBandTop + midBandHeight / 2, width, midBandHeight, 0x102a16, 0.88)
            .setDepth(4)
            .setScrollFactor(0.6);

        const groundBand = this.scene.add
            .rectangle(width / 2, groundTop + groundHeight / 2, width, groundHeight, 0x07140b, 0.98)
            .setDepth(8)
            .setScrollFactor(1);

        background.push(canopy, undergrowthBand, groundBand);

        for (const fraction of floorTileXFractions) {
            background.push(
                this.scene.add
                    .image(width * fraction, floorTileY, floorTileKey)
                    .setOrigin(0, 1)
                    .setScale(floorTileScale)
                    .setAlpha(0.96)
                    .setDepth(9)
                    .setScrollFactor(1),
            );
        }

        const midPropLayout = [
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'tree'], x: width * 0.03, y: rearTreeY, scale: rearTreeScale, alpha: 0.58, depth: 5 },
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'tree'], x: width * 0.22, y: rearTreeY, scale: rearTreeScale, alpha: 0.64, depth: 5 },
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'tree'], x: width * 0.41, y: rearTreeY, scale: rearTreeScale, alpha: 0.62, depth: 6 },
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'liana'], x: width * 0.4, y: lianaY, scale: 1.02, alpha: 0.9, depth: 7 },
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'liana'], x: width * 0.62, y: lianaY, scale: 0.94, alpha: 0.82, depth: 7 },
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'tree'], x: width * 0.6, y: rearTreeY, scale: rearTreeScale, alpha: 0.64, depth: 6 },
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'tree'], x: width * 0.79, y: rearTreeY, scale: rearTreeScale, alpha: 0.6, depth: 5 },
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'tree'], x: width * 0.98, y: rearTreeY, scale: rearTreeScale, alpha: 0.58, depth: 5 },
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'bush'], x: width * 0.12, y: rearBushY, scale: rearBushScale, alpha: 0.74, depth: 7 },
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'bush'], x: width * 0.31, y: rearBushY, scale: rearBushScale, alpha: 0.7, depth: 7 },
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'bush'], x: width * 0.52, y: rearBushY, scale: rearBushScale, alpha: 0.72, depth: 7 },
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'bush'], x: width * 0.72, y: rearBushY, scale: rearBushScale, alpha: 0.7, depth: 7 },
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'bush'], x: width * 0.91, y: rearBushY, scale: rearBushScale, alpha: 0.74, depth: 7 },
        ] as const;

        for (const prop of midPropLayout) {
            background.push(
                this.scene.add
                    .image(prop.x, prop.y, spriteCookAssetKey(prop.key))
                    .setOrigin(0.5, 1)
                    .setScale(prop.scale)
                    .setAlpha(prop.alpha)
                    .setDepth(prop.depth)
                    .setScrollFactor(0.6),
            );
        }

        const propLayout = [
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'tree'], x: width * 0.07, y: frontTreeY, scale: frontTreeScale, depth: 18 },
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'tree'], x: width * 0.34, y: frontTreeY, scale: frontTreeScale, depth: 18 },
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'bush'], x: width * 0.2, y: frontBushY, scale: frontBushScale, depth: 20 },
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'bush'], x: width * 0.53, y: frontBushY, scale: frontBushScale, depth: 20 },
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'bush'], x: width * 0.78, y: frontBushY, scale: frontBushScale, depth: 20 },
            { key: ['players', 'arenas', 'dense-jungle', 'props', 'tree'], x: width * 0.93, y: frontTreeY, scale: frontTreeScale, depth: 18 },
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
