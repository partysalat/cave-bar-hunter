import Phaser from 'phaser';

import SessionManager from '../logic/SessionManager.js';
import { getGeneratedSpriteCookAnimation, spriteCookAssetKey } from '../rendering/spritecookAssets.js';
import { SCENE_KEYS } from './sceneKeys.js';

export class CaveBarScene extends Phaser.Scene {
    private sessionManager?: SessionManager;

    constructor() {
        super({ key: SCENE_KEYS.CAVE_BAR });
    }

    init(data: { sessionManager?: SessionManager }): void {
        this.sessionManager = data.sessionManager;
    }

    create(): void {
        const { width, height } = this.scale;
        const playerState = this.sessionManager?.loadPlayerState() ?? [];
        const leadPlayer = playerState[0];

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

        const hunterAnimation = getGeneratedSpriteCookAnimation('red', 'idle');
        const hunterSprite = this.add
            .sprite(
                width * 0.36,
                height * 0.73,
                hunterAnimation?.entity.atlasKey ?? spriteCookAssetKey(['players', 'red', 'idle']),
                hunterAnimation?.data.frames[0],
            )
            .setScale(0.46)
            .setDepth(24);
        if (hunterAnimation) {
            hunterSprite.play(hunterAnimation.key);
        }

        const bartenderAnimation = getGeneratedSpriteCookAnimation('bartender', 'idle');
        const bartenderSprite = this.add
            .sprite(
                width * 0.56,
                height * 0.55,
                bartenderAnimation?.entity.atlasKey ?? spriteCookAssetKey(['players', 'cavebar', 'bartender', 'still']),
                bartenderAnimation?.data.frames[0],
            )
            .setScale(0.42)
            .setDepth(22);
        if (bartenderAnimation) {
            bartenderSprite.play(bartenderAnimation.key);
        }

        this.add
            .image(width * 0.76, height * 0.67, spriteCookAssetKey(['players', 'cavebar', 'props', 'exit-arch']))
            .setScale(0.85)
            .setDepth(18);

        this.add
            .text(width * 0.36, height * 0.82, leadPlayer ? `Hunter ready: P${leadPlayer.playerId + 1}` : 'Hunter ready', {
                color: '#f7efc7',
                fontFamily: 'monospace',
                fontSize: '16px',
                stroke: '#2a1b14',
                strokeThickness: 4,
            })
            .setOrigin(0.5, 0.5)
            .setDepth(50);

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

        const summary = playerState
            .map((player) => `P${player.playerId + 1} HP ${player.health} SCORE ${player.score}`)
            .join('\n');

        if (summary) {
            this.add
                .text(width / 2, height * 0.28, summary, {
                    color: '#ffe9b8',
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    align: 'center',
                })
                .setOrigin(0.5, 0.5)
                .setDepth(50);
        }

        const returnToHunt = (): void => {
            this.scene.start(SCENE_KEYS.HUNT, { sessionManager: this.sessionManager });
        };

        this.input.keyboard?.once('keydown-SPACE', returnToHunt);
        this.input.once('pointerdown', returnToHunt);
    }
}
