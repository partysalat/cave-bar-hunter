import Phaser from 'phaser';

import { ArenaRenderer } from '../rendering/ArenaRenderer.js';
import { spriteCookAssetKey } from '../rendering/spritecookAssets.js';
import { SCENE_KEYS } from './sceneKeys.js';

export class HuntScene extends Phaser.Scene {
    private arena?: ArenaRenderer;

    constructor() {
        super({ key: SCENE_KEYS.HUNT });
    }

    create(): void {
        const { width, height } = this.scale;

        this.cameras.main.setBackgroundColor('#06110a');

        this.arena = new ArenaRenderer(this);
        this.arena.create();

        const rosterY = height * 0.66;
        const playerSprites = [
            { key: spriteCookAssetKey(['players', 'red', 'idle']), x: width * 0.18 },
            { key: spriteCookAssetKey(['players', 'blue', 'idle']), x: width * 0.34 },
            { key: spriteCookAssetKey(['players', 'yellow', 'idle']), x: width * 0.50 },
            { key: spriteCookAssetKey(['players', 'green', 'idle']), x: width * 0.66 },
        ] as const;

        const roster = playerSprites.map((player, index) => {
            const sprite = this.add
                .image(player.x, rosterY, player.key)
                .setScale(0.42)
                .setDepth(40 + index)
                .setOrigin(0.5, 0.5);

            this.tweens.add({
                targets: sprite,
                y: rosterY - 10,
                duration: 1500 + index * 200,
                yoyo: true,
                repeat: -1,
                ease: 'sine.inOut',
            });

            return sprite;
        });

        const dino = this.add
            .image(width * 0.76, height * 0.62, spriteCookAssetKey(['enemies', 'dilophosaurus', 'still']))
            .setScale(0.48)
            .setDepth(55);

        this.tweens.add({
            targets: dino,
            y: dino.y - 8,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
        });

        this.add
            .text(width / 2, 28, 'Dense Jungle Hunt', {
                color: '#efffe7',
                fontFamily: 'monospace',
                fontSize: '24px',
            })
            .setOrigin(0.5, 0.5)
            .setDepth(100);

        this.add
            .text(width / 2, height - 24, 'Press C to visit the Cave Bar stub', {
                color: '#c7f0b5',
                fontFamily: 'monospace',
                fontSize: '16px',
            })
            .setOrigin(0.5, 0.5)
            .setDepth(100);

        this.cameras.main.startFollow(roster[0], true, 0.05, 0.05);

        const onGoToCaveBar = (): void => {
            this.scene.start(SCENE_KEYS.CAVE_BAR);
        };

        this.input.keyboard?.on('keydown-C', onGoToCaveBar);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard?.off('keydown-C', onGoToCaveBar);
        });
    }
}
