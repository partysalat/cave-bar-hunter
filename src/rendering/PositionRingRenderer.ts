import Phaser from 'phaser';

import type { PlayerId } from '../core/types.js';
import type { ScreenPosition } from './positionToScreen.js';

const RING_COLORS: Record<PlayerId, number> = {
    0: 0xff4444,
    1: 0x4488ff,
    2: 0xffee44,
    3: 0x44ee88,
};

export function playerRingColor(playerId: PlayerId): number {
    return RING_COLORS[playerId];
}

export class PositionRingRenderer {
    private readonly rings = new Map<PlayerId, Phaser.GameObjects.Graphics>();
    private readonly tweens = new Map<PlayerId, Phaser.Tweens.Tween>();

    constructor(private readonly scene: Phaser.Scene) {}

    create(playerIds: readonly PlayerId[]): void {
        for (const playerId of playerIds) {
            this.rings.set(playerId, this.scene.add.graphics().setDepth(35));
        }
    }

    update(playerId: PlayerId, pos: ScreenPosition, inCloseZone: boolean): void {
        const graphics = this.rings.get(playerId);
        if (!graphics) {
            return;
        }

        graphics.clear();
        const color = playerRingColor(playerId);
        graphics.fillStyle(color, 0.25);
        graphics.lineStyle(2, color, 0.8);
        graphics.strokeEllipse(pos.x, pos.y + 18, 52, 18);
        graphics.fillEllipse(pos.x, pos.y + 18, 52, 18);

        this.tweens.get(playerId)?.stop();
        this.tweens.set(
            playerId,
            this.scene.tweens.add({
                targets: graphics,
                alpha: { from: 1, to: 0.55 },
                duration: inCloseZone ? 400 : 900,
                yoyo: true,
                repeat: -1,
                ease: 'sine.inout',
            }),
        );
    }

    destroy(): void {
        for (const tween of this.tweens.values()) {
            tween.stop();
        }
        for (const graphics of this.rings.values()) {
            graphics.destroy();
        }
        this.tweens.clear();
        this.rings.clear();
    }
}
