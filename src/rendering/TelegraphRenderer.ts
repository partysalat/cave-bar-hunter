import Phaser from 'phaser';

import type { AttackDeclaration } from '../core/types.js';
import { COLUMN_BOUNDS, ROW_BOUNDS } from './arenaLayout.js';

export interface CellRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

export type TelegraphStage1Mode = 'cone' | 'sweep';

export function telegraphCellRects(
    declaration: AttackDeclaration,
    width: number,
    height: number,
): CellRect[] {
    return declaration.affectedZones.map((position) => {
        const column = COLUMN_BOUNDS[position.zone];
        const row = ROW_BOUNDS[position.flank];
        return {
            x: column.left * width,
            y: row.top * height,
            w: (column.right - column.left) * width,
            h: (row.bottom - row.top) * height,
        };
    });
}

export function telegraphStage1Mode(declaration: AttackDeclaration): TelegraphStage1Mode {
    return declaration.type === 'bite' ? 'cone' : 'sweep';
}

const STAGE1_DURATION_MS = 1500;
const DANGER_COLOR = 0xff3300;
const DANGER_PULSE = 0xff6622;
const STAGE1_LINE_COLOR = 0xffd28a;

export class TelegraphRenderer {
    private stage1?: Phaser.GameObjects.Graphics;
    private stage2?: Phaser.GameObjects.Graphics;
    private stage1Timer?: Phaser.Time.TimerEvent;
    private pulseTimer?: Phaser.Time.TimerEvent;

    constructor(private readonly scene: Phaser.Scene) {}

    show(declaration: AttackDeclaration): void {
        this.clear();

        const { width, height } = this.scene.scale;
        const rects = telegraphCellRects(declaration, width, height);
        const stage1 = this.scene.add.graphics().setDepth(38).setAlpha(0.55);
        this.drawStage1(stage1, declaration, rects, width);
        this.stage1 = stage1;

        this.stage1Timer = this.scene.time.delayedCall(STAGE1_DURATION_MS, () => {
            this.stage1?.destroy();
            this.stage1 = undefined;
            this.startStage2(rects);
        });
    }

    private drawStage1(
        graphics: Phaser.GameObjects.Graphics,
        declaration: AttackDeclaration,
        rects: CellRect[],
        width: number,
    ): void {
        graphics.clear();
        graphics.lineStyle(3, STAGE1_LINE_COLOR, 0.9);

        if (telegraphStage1Mode(declaration) === 'cone') {
            const [rect] = rects;
            if (!rect) {
                return;
            }

            const tipX = width * 0.83;
            const tipY = rect.y + rect.h / 2;
            const baseX = rect.x;
            const inset = Math.min(rect.h * 0.22, 18);
            graphics.fillStyle(DANGER_COLOR, 0.95);
            graphics.fillTriangle(
                tipX,
                tipY,
                baseX,
                rect.y + inset,
                baseX,
                rect.y + rect.h - inset,
            );
            graphics.strokeTriangle(
                tipX,
                tipY,
                baseX,
                rect.y + inset,
                baseX,
                rect.y + rect.h - inset,
            );
            return;
        }

        const union = rects.reduce<CellRect | null>((acc, rect) => {
            if (!acc) {
                return { ...rect };
            }

            const right = Math.max(acc.x + acc.w, rect.x + rect.w);
            const bottom = Math.max(acc.y + acc.h, rect.y + rect.h);
            return {
                x: Math.min(acc.x, rect.x),
                y: Math.min(acc.y, rect.y),
                w: right - Math.min(acc.x, rect.x),
                h: bottom - Math.min(acc.y, rect.y),
            };
        }, null);

        if (!union) {
            return;
        }

        const radius = Math.min(union.h / 2, 20);
        graphics.fillStyle(DANGER_COLOR, 0.9);
        graphics.fillRoundedRect(union.x, union.y, union.w, union.h, radius);
        graphics.strokeRoundedRect(union.x, union.y, union.w, union.h, radius);

        const centerY = union.y + union.h / 2;
        const waveInset = Math.min(union.w * 0.08, 32);
        graphics.lineStyle(5, STAGE1_LINE_COLOR, 0.95);
        graphics.beginPath();
        graphics.moveTo(union.x + waveInset, centerY);
        graphics.lineTo(union.x + union.w - waveInset, centerY);
        graphics.strokePath();
    }

    private startStage2(rects: CellRect[]): void {
        const stage2 = this.scene.add.graphics().setDepth(37);
        this.stage2 = stage2;

        const draw = (color: number): void => {
            stage2.clear();
            stage2.fillStyle(color, 0.28);
            for (const rect of rects) {
                stage2.fillRect(rect.x, rect.y, rect.w, rect.h);
            }
        };

        let pulseOn = false;
        draw(DANGER_COLOR);
        this.pulseTimer = this.scene.time.addEvent({
            delay: 500,
            loop: true,
            callback: () => {
                draw(pulseOn ? DANGER_PULSE : DANGER_COLOR);
                pulseOn = !pulseOn;
            },
        });
    }

    clear(): void {
        this.stage1Timer?.remove();
        this.pulseTimer?.remove();
        this.stage1?.destroy();
        this.stage2?.destroy();
        this.stage1Timer = undefined;
        this.pulseTimer = undefined;
        this.stage1 = undefined;
        this.stage2 = undefined;
    }

    destroy(): void {
        this.clear();
    }
}
