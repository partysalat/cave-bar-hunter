import Phaser from 'phaser';

import { spriteCookAssetKey } from './spritecookAssets.js';
import { ARENA_LAYOUT } from './arenaLayout.js';

export interface ArenaRendererResult {
    background: Phaser.GameObjects.GameObject[];
}

export class ArenaRenderer {
    constructor(private readonly scene: Phaser.Scene) {}

    create(): ArenaRendererResult {
        const { width, height } = this.scene.scale;
        const gridLeft = width * ARENA_LAYOUT.gridLeft;
        const gridRight = width * ARENA_LAYOUT.gridRight;
        const gridTop = height * ARENA_LAYOUT.gridTop;
        const gridBottom = height * ARENA_LAYOUT.gridBottom;
        const farBoundary = width * ARENA_LAYOUT.farBoundary;
        const closeBoundary = width * ARENA_LAYOUT.closeBoundary;
        const seam1 = height * ARENA_LAYOUT.seam1Y;
        const seam2 = height * ARENA_LAYOUT.seam2Y;

        const background: Phaser.GameObjects.GameObject[] = [];

        background.push(
            this.scene.add
                .rectangle(width / 2, height / 2, width, height, 0x060f09, 1)
                .setDepth(0),
        );

        background.push(
            this.scene.add
                .tileSprite(
                    0,
                    0,
                    width,
                    height * 0.28,
                    spriteCookAssetKey(['players', 'arenas', 'dense-jungle', 'tiles', 'canopy']),
                )
                .setOrigin(0, 0)
                .setAlpha(0.88)
                .setDepth(2),
        );

        background.push(
            this.scene.add
                .rectangle(
                    (gridLeft + farBoundary) / 2,
                    (gridTop + gridBottom) / 2,
                    farBoundary - gridLeft,
                    gridBottom - gridTop,
                    0x08160c,
                    1,
                )
                .setDepth(1),
        );
        background.push(
            this.scene.add
                .rectangle(
                    (farBoundary + closeBoundary) / 2,
                    (gridTop + gridBottom) / 2,
                    closeBoundary - farBoundary,
                    gridBottom - gridTop,
                    0x0d1f10,
                    1,
                )
                .setDepth(1),
        );
        background.push(
            this.scene.add
                .rectangle(
                    (closeBoundary + gridRight) / 2,
                    (gridTop + gridBottom) / 2,
                    gridRight - closeBoundary,
                    gridBottom - gridTop,
                    0x1a140a,
                    1,
                )
                .setDepth(1),
        );

        const columnDividers = this.scene.add.graphics().setDepth(6);
        columnDividers.lineStyle(3, 0x1e3a1e, 0.6);
        columnDividers.lineBetween(farBoundary, gridTop, farBoundary, gridBottom);
        columnDividers.lineBetween(closeBoundary, gridTop, closeBoundary, gridBottom);
        background.push(columnDividers);

        const seams = this.scene.add.graphics().setDepth(7);
        seams.lineStyle(2, 0x2a3a22, 0.5);
        seams.lineBetween(gridLeft, seam1, gridRight, seam1);
        seams.lineBetween(gridLeft, seam2, gridRight, seam2);
        background.push(seams);

        background.push(
            this.scene.add
                .image(
                    gridLeft,
                    height * 0.34,
                    spriteCookAssetKey(['players', 'arenas', 'dense-jungle', 'props', 'tree']),
                )
                .setOrigin(0.5, 0.5)
                .setScale(0.55)
                .setAlpha(0.85)
                .setDepth(8),
        );
        background.push(
            this.scene.add
                .image(
                    gridLeft + 18,
                    height * 0.56 + 8,
                    spriteCookAssetKey(['players', 'arenas', 'dense-jungle', 'props', 'bush']),
                )
                .setOrigin(0.5, 0.85)
                .setScale(0.78)
                .setAlpha(0.92)
                .setDepth(8),
        );
        background.push(
            this.scene.add
                .image(
                    gridLeft - 8,
                    height * 0.76 + 4,
                    spriteCookAssetKey(['players', 'arenas', 'dense-jungle', 'props', 'bush']),
                )
                .setOrigin(0.5, 0.9)
                .setScale(0.62)
                .setAlpha(0.88)
                .setDepth(8),
        );
        background.push(
            this.scene.add
                .image(
                    gridLeft + 20,
                    height * 0.76 - 10,
                    spriteCookAssetKey(['players', 'arenas', 'dense-jungle', 'props', 'liana']),
                )
                .setScale(0.48)
                .setAlpha(0.82)
                .setDepth(8),
        );

        for (const xFraction of [0.22, 0.58] as const) {
            background.push(
                this.scene.add
                    .image(
                        width * xFraction,
                        height * 0.26,
                        spriteCookAssetKey(['players', 'arenas', 'dense-jungle', 'props', 'liana']),
                    )
                    .setScale(0.96)
                    .setAlpha(0.85)
                    .setDepth(7),
            );
        }

        for (const prop of [
            { xFraction: 0.18, depth: 22 },
            { xFraction: 0.50, depth: 22 },
            { xFraction: 0.82, depth: 22 },
        ] as const) {
            background.push(
                this.scene.add
                    .image(
                        gridLeft + (gridRight - gridLeft) * prop.xFraction,
                        gridBottom,
                        spriteCookAssetKey(['players', 'arenas', 'dense-jungle', 'props', 'bush']),
                    )
                    .setOrigin(0.5, 1)
                    .setScale(0.9)
                    .setDepth(prop.depth),
            );
        }

        return { background };
    }
}
