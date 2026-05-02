# Arena Visual Language Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the flat side-view arena visual language — vertical distance columns, horizontal flank rows, player occupancy rings, and attack telegraph overlays.

**Architecture:** Extract position calculation to a pure function using shared layout constants, rebuild ArenaRenderer around those constants, then add two new renderers (PositionRingRenderer and TelegraphRenderer) wired into HuntScene via the existing EventBus.

**Tech Stack:** Phaser 3, TypeScript, Vitest

## Implementation Status

- [x] Shared arena layout constants and `positionToScreen` mapping are implemented in `src/rendering/arenaLayout.ts` and `src/rendering/positionToScreen.ts`.
- [x] `ArenaRenderer` now presents the hunt as a flat side-view lane grid with vertical distance bands, horizontal seams, lane anchors, and foreground jungle props.
- [x] `PositionRingRenderer` is implemented and wired into `HuntScene` so every hunter has a persistent occupancy ring that pulses faster in the close column.
- [x] `TelegraphRenderer` is implemented and wired to `EVENTS.DINO_TELEGRAPH`; `bite` now renders as a left-pointing cone and `spit` renders as a row sweep before transitioning into the pulsing danger glow.
- [x] Added targeted Vitest coverage for `positionToScreen`, `playerRingColor`, and `telegraphCellRects`.
- [x] Validation run on 2026-04-26: targeted rendering tests passed and `npm run build` succeeded.
- [ ] Visual browser verification is still pending in this thread because the in-app browser tools were not available here.
- [ ] Full `npx vitest run` still reports pre-existing failures in legacy suites that import missing files such as `src/systems/CameraController.js`, `src/systems/CombatSystem.js`, and `src/entities/Player.js`. This implementation did not modify those paths.

---

## Layout Constants

All spatial values live in `src/rendering/arenaLayout.ts` as fractions of screen size so every renderer stays consistent.

```
           FAR      MID    CLOSE        DINO
           0.05    0.28   0.50   0.72   0.82
            │       │      │      │      🦕
 Left  0.20 ─ · · · · · · · · · ─         (center Y: 0.34)
            ·┄┄┄┄┄┄ seam 0.48 ┄┄┄·
 Center     ─ · · · · · · · · · ─         (center Y: 0.56)
            ·┄┄┄┄┄┄ seam 0.64 ┄┄┄·
 Right  0.88─ · · · · · · · · · ─         (center Y: 0.76)
```

---

## File Map

| Action | Path |
|-|-|
| Create | `src/rendering/arenaLayout.ts` |
| Create | `src/rendering/positionToScreen.ts` |
| Create | `src/rendering/PositionRingRenderer.ts` |
| Create | `src/rendering/TelegraphRenderer.ts` |
| Create | `tests/rendering/positionToScreen.test.ts` |
| Create | `tests/rendering/PositionRingRenderer.test.ts` |
| Create | `tests/rendering/TelegraphRenderer.test.ts` |
| Rewrite | `src/rendering/ArenaRenderer.ts` |
| Modify | `src/scenes/HuntScene.ts` |

---

## Task 1: Layout constants + position calculation

**Files:**
- Create: `src/rendering/arenaLayout.ts`
- Create: `src/rendering/positionToScreen.ts`
- Create: `tests/rendering/positionToScreen.test.ts`
- Modify: `src/scenes/HuntScene.ts:571-585`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/rendering/positionToScreen.test.ts
import { describe, it, expect } from 'vitest';
import { positionToScreen } from '../../src/rendering/positionToScreen';

describe('positionToScreen', () => {
    const W = 1000;
    const H = 800;

    it('maps far < mid < close on the X axis', () => {
        const far   = positionToScreen({ zone: 'far',   flank: 'center' }, W, H);
        const mid   = positionToScreen({ zone: 'mid',   flank: 'center' }, W, H);
        const close = positionToScreen({ zone: 'close', flank: 'center' }, W, H);
        expect(far.x).toBeLessThan(mid.x);
        expect(mid.x).toBeLessThan(close.x);
    });

    it('maps left < center < right on the Y axis', () => {
        const left   = positionToScreen({ zone: 'mid', flank: 'left'   }, W, H);
        const center = positionToScreen({ zone: 'mid', flank: 'center' }, W, H);
        const right  = positionToScreen({ zone: 'mid', flank: 'right'  }, W, H);
        expect(left.y).toBeLessThan(center.y);
        expect(center.y).toBeLessThan(right.y);
    });

    it('scales proportionally with screen dimensions', () => {
        const a = positionToScreen({ zone: 'far', flank: 'left' }, 1000, 800);
        const b = positionToScreen({ zone: 'far', flank: 'left' }, 2000, 1600);
        expect(b.x).toBeCloseTo(a.x * 2);
        expect(b.y).toBeCloseTo(a.y * 2);
    });

    it('returns x < 0.72 * width for all zones (grid does not overlap dino area)', () => {
        for (const zone of ['far', 'mid', 'close'] as const) {
            const pos = positionToScreen({ zone, flank: 'center' }, W, H);
            expect(pos.x).toBeLessThan(W * 0.72);
        }
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
rtk npx vitest run tests/rendering/positionToScreen.test.ts
```

Expected: `Cannot find module '../../src/rendering/positionToScreen'`

- [ ] **Step 3: Create arenaLayout constants**

```typescript
// src/rendering/arenaLayout.ts

/** All values are fractions of screen width or height. */
export const ARENA_LAYOUT = {
    // Grid outer bounds
    gridLeft:   0.05,
    gridRight:  0.72,
    gridTop:    0.20,
    gridBottom: 0.88,

    // Column (distance) boundaries
    farBoundary:   0.28,  // Far  | Mid
    closeBoundary: 0.50,  // Mid  | Close

    // Row (flank) boundaries
    seam1Y: 0.48,  // Left   | Center
    seam2Y: 0.64,  // Center | Right

    // Dino position
    dinoX: 0.82,
    dinoY: 0.56,
} as const;

/** Screen-fraction center of each grid cell. */
export const CELL_CENTERS = {
    zone: {
        far:   (ARENA_LAYOUT.gridLeft  + ARENA_LAYOUT.farBoundary)   / 2,  // 0.165
        mid:   (ARENA_LAYOUT.farBoundary  + ARENA_LAYOUT.closeBoundary) / 2,  // 0.39
        close: (ARENA_LAYOUT.closeBoundary + ARENA_LAYOUT.gridRight)  / 2,  // 0.61
    },
    flank: {
        left:   (ARENA_LAYOUT.gridTop   + ARENA_LAYOUT.seam1Y)    / 2,  // 0.34
        center: (ARENA_LAYOUT.seam1Y    + ARENA_LAYOUT.seam2Y)    / 2,  // 0.56
        right:  (ARENA_LAYOUT.seam2Y    + ARENA_LAYOUT.gridBottom) / 2,  // 0.76
    },
} as const;
```

- [ ] **Step 4: Create positionToScreen**

```typescript
// src/rendering/positionToScreen.ts
import type { Position } from '../core/types';
import { CELL_CENTERS } from './arenaLayout';

export interface ScreenPosition {
    x: number;
    y: number;
}

export function positionToScreen(position: Position, width: number, height: number): ScreenPosition {
    return {
        x: CELL_CENTERS.zone[position.zone]   * width,
        y: CELL_CENTERS.flank[position.flank] * height,
    };
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
rtk npx vitest run tests/rendering/positionToScreen.test.ts
```

Expected: all 4 tests pass.

- [ ] **Step 6: Update HuntScene.toScreenPosition to use the new function**

In `src/scenes/HuntScene.ts`, replace the `toScreenPosition` method body (around L571-585):

```typescript
// Add this import at the top of HuntScene.ts:
import { positionToScreen } from '../rendering/positionToScreen';

// Replace the method body:
private toScreenPosition(position: Position): { x: number; y: number } {
    const { width, height } = this.scale;
    return positionToScreen(position, width, height);
}
```

- [ ] **Step 7: Update dino position in HuntScene.create()**

Find the dino position assignment in `HuntScene.create()` (around L185-190) and update:

```typescript
import { ARENA_LAYOUT } from '../rendering/arenaLayout';

// Replace the hardcoded dinoX/dinoY:
const dinoX = width * ARENA_LAYOUT.dinoX;
const dinoY = height * ARENA_LAYOUT.dinoY;
```

- [ ] **Step 8: Run dev server and verify player positions are in the new side-view layout**

```bash
npm run dev
```

Open the game. Players should now be positioned left-of-center with Far=leftmost, Close=rightmost, Left=top row, Right=bottom row. Dino should be on the right side vertically centered.

- [ ] **Step 9: Commit**

```bash
rtk git add src/rendering/arenaLayout.ts src/rendering/positionToScreen.ts tests/rendering/positionToScreen.test.ts src/scenes/HuntScene.ts
rtk git commit -m "feat: extract positionToScreen with side-view axis mapping"
```

---

## Task 2: Rebuild ArenaRenderer for flat side-view

**Files:**
- Rewrite: `src/rendering/ArenaRenderer.ts`

No unit tests — ArenaRenderer creates Phaser GameObjects. Verify visually in the dev server.

- [ ] **Step 1: Rewrite ArenaRenderer.ts**

```typescript
// src/rendering/ArenaRenderer.ts
import Phaser from 'phaser';
import { spriteCookAssetKey } from './spritecookAssets';
import { ARENA_LAYOUT } from './arenaLayout';

export interface ArenaRendererResult {
    background: Phaser.GameObjects.GameObject[];
}

export class ArenaRenderer {
    constructor(private scene: Phaser.Scene) {}

    create(): ArenaRendererResult {
        const { width, height } = this.scene.scale;

        const gL  = width  * ARENA_LAYOUT.gridLeft;
        const gR  = width  * ARENA_LAYOUT.gridRight;
        const gT  = height * ARENA_LAYOUT.gridTop;
        const gB  = height * ARENA_LAYOUT.gridBottom;
        const farB   = width  * ARENA_LAYOUT.farBoundary;
        const closeB = width  * ARENA_LAYOUT.closeBoundary;
        const s1 = height * ARENA_LAYOUT.seam1Y;
        const s2 = height * ARENA_LAYOUT.seam2Y;

        const background: Phaser.GameObjects.GameObject[] = [];

        // Base background
        background.push(
            this.scene.add
                .rectangle(width / 2, height / 2, width, height, 0x060f09, 1)
                .setDepth(0),
        );

        // Canopy top band (full width)
        background.push(
            this.scene.add
                .tileSprite(
                    0, 0, width, height * 0.28,
                    spriteCookAssetKey(['players', 'arenas', 'dense-jungle', 'tiles', 'canopy']),
                )
                .setOrigin(0, 0)
                .setAlpha(0.88)
                .setDepth(2),
        );

        // Far column: cool dark
        background.push(
            this.scene.add
                .rectangle(
                    (gL + farB) / 2,
                    (gT + gB) / 2,
                    farB - gL,
                    gB - gT,
                    0x08160c,
                    1,
                )
                .setDepth(1),
        );

        // Mid column: neutral
        background.push(
            this.scene.add
                .rectangle(
                    (farB + closeB) / 2,
                    (gT + gB) / 2,
                    closeB - farB,
                    gB - gT,
                    0x0d1f10,
                    1,
                )
                .setDepth(1),
        );

        // Close column: warm amber
        background.push(
            this.scene.add
                .rectangle(
                    (closeB + gR) / 2,
                    (gT + gB) / 2,
                    gR - closeB,
                    gB - gT,
                    0x1a140a,
                    1,
                )
                .setDepth(1),
        );

        // Column dividers (Far/Mid and Mid/Close boundaries)
        const colDividers = this.scene.add.graphics().setDepth(6);
        colDividers.lineStyle(3, 0x1e3a1e, 0.6);
        colDividers.lineBetween(farB,   gT, farB,   gB);
        colDividers.lineBetween(closeB, gT, closeB, gB);
        background.push(colDividers);

        // Row seams (Left/Center and Center/Right boundaries)
        const seams = this.scene.add.graphics().setDepth(7);
        seams.lineStyle(2, 0x2a3a22, 0.5);
        seams.lineBetween(gL, s1, gR, s1);
        seams.lineBetween(gL, s2, gR, s2);
        background.push(seams);

        // Lane anchor props — left edge, one per flank row
        // TODO(cave-bar-hunter-88w): swap tree for dedicated anchor sprites when generated
        const anchorYs = [
            height * 0.34,  // Left row center
            height * 0.56,  // Center row center
            height * 0.76,  // Right row center
        ] as const;
        for (const anchorY of anchorYs) {
            background.push(
                this.scene.add
                    .image(
                        gL,
                        anchorY,
                        spriteCookAssetKey(['players', 'arenas', 'dense-jungle', 'props', 'tree']),
                    )
                    .setOrigin(0.5, 0.5)
                    .setScale(0.55)
                    .setAlpha(0.85)
                    .setDepth(8),
            );
        }

        // Foreground props (overlapping bottom edge of grid)
        const frontProps = [
            { xFrac: 0.18, depth: 22 },
            { xFrac: 0.50, depth: 22 },
            { xFrac: 0.82, depth: 22 },
        ] as const;
        for (const prop of frontProps) {
            background.push(
                this.scene.add
                    .image(
                        gL + (gR - gL) * prop.xFrac,
                        gB,
                        spriteCookAssetKey(['players', 'arenas', 'dense-jungle', 'props', 'bush']),
                    )
                    .setOrigin(0.5, 1)
                    .setScale(0.90)
                    .setDepth(prop.depth),
            );
        }

        // Lianas (decorative, upper area)
        const lianaYFrac = 0.26;
        for (const xFrac of [0.22, 0.58] as const) {
            background.push(
                this.scene.add
                    .image(
                        width * xFrac,
                        height * lianaYFrac,
                        spriteCookAssetKey(['players', 'arenas', 'dense-jungle', 'props', 'liana']),
                    )
                    .setScale(0.96)
                    .setAlpha(0.85)
                    .setDepth(7),
            );
        }

        return { background };
    }
}
```

- [ ] **Step 2: Run dev server and verify the arena layout**

```bash
npm run dev
```

Check:
- Three vertical columns visible with distinct lighting (dark left → warm right)
- Faint vertical dividers between columns
- Faint horizontal seams dividing the three rows
- Three anchor props on the left edge at different heights
- No horizontal depth bands from the old top-down design

- [ ] **Step 3: Run tests to confirm nothing is broken**

```bash
rtk npx vitest run
```

Expected: all existing tests pass.

- [ ] **Step 4: Commit**

```bash
rtk git add src/rendering/ArenaRenderer.ts
rtk git commit -m "feat: rebuild ArenaRenderer for flat side-view layout"
```

---

## Task 3: PositionRingRenderer

**Files:**
- Create: `src/rendering/PositionRingRenderer.ts`
- Create: `tests/rendering/PositionRingRenderer.test.ts`
- Modify: `src/scenes/HuntScene.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/rendering/PositionRingRenderer.test.ts
import { describe, it, expect } from 'vitest';
import { playerRingColor } from '../../src/rendering/PositionRingRenderer';

describe('playerRingColor', () => {
    it('returns distinct colors for all four players', () => {
        const colors = [0, 1, 2, 3].map(playerRingColor);
        const unique = new Set(colors);
        expect(unique.size).toBe(4);
    });

    it('returns a valid 24-bit color for each player', () => {
        for (const id of [0, 1, 2, 3] as const) {
            const color = playerRingColor(id);
            expect(color).toBeGreaterThanOrEqual(0);
            expect(color).toBeLessThanOrEqual(0xffffff);
        }
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
rtk npx vitest run tests/rendering/PositionRingRenderer.test.ts
```

Expected: `Cannot find module '../../src/rendering/PositionRingRenderer'`

- [ ] **Step 3: Create PositionRingRenderer**

```typescript
// src/rendering/PositionRingRenderer.ts
import Phaser from 'phaser';
import type { PlayerId } from '../core/types';
import type { ScreenPosition } from './positionToScreen';

const RING_COLORS: Record<PlayerId, number> = {
    0: 0xff4444,  // red
    1: 0x4488ff,  // blue
    2: 0xffee44,  // yellow
    3: 0x44ee88,  // green
};

export function playerRingColor(playerId: PlayerId): number {
    return RING_COLORS[playerId];
}

export class PositionRingRenderer {
    private rings = new Map<PlayerId, Phaser.GameObjects.Graphics>();
    private tweens = new Map<PlayerId, Phaser.Tweens.Tween>();

    constructor(private scene: Phaser.Scene) {}

    create(playerIds: readonly PlayerId[]): void {
        for (const id of playerIds) {
            const g = this.scene.add.graphics().setDepth(35);
            this.rings.set(id, g);
        }
    }

    update(playerId: PlayerId, pos: ScreenPosition, inCloseZone: boolean): void {
        const g = this.rings.get(playerId);
        if (!g) return;

        g.clear();
        const color = RING_COLORS[playerId];
        g.fillStyle(color, 0.25);
        g.lineStyle(2, color, 0.80);
        g.strokeEllipse(pos.x, pos.y + 18, 52, 18);
        g.fillEllipse(pos.x, pos.y + 18, 52, 18);

        // Pulse faster when in Close zone
        const existing = this.tweens.get(playerId);
        if (existing) existing.stop();
        const tween = this.scene.tweens.add({
            targets: g,
            alpha: { from: 1, to: 0.55 },
            duration: inCloseZone ? 400 : 900,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inout',
        });
        this.tweens.set(playerId, tween);
    }

    destroy(): void {
        for (const tween of this.tweens.values()) tween.stop();
        for (const g of this.rings.values()) g.destroy();
        this.rings.clear();
        this.tweens.clear();
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
rtk npx vitest run tests/rendering/PositionRingRenderer.test.ts
```

Expected: both tests pass.

- [ ] **Step 5: Wire PositionRingRenderer into HuntScene**

In `src/scenes/HuntScene.ts`:

Add the import near the top with the other rendering imports:
```typescript
import { PositionRingRenderer } from '../rendering/PositionRingRenderer';
```

Add a property to the class (alongside existing `arena`, `hud`, etc.):
```typescript
private ringRenderer?: PositionRingRenderer;
```

In `create()`, after `this.arena.create()`:
```typescript
this.ringRenderer = new PositionRingRenderer(this);
this.ringRenderer.create(PLAYER_IDS);
```

In `syncPlayerSprites()`, after the tween block, add a ring update:
```typescript
this.ringRenderer?.update(playerId, target, position.zone === 'close');
```

The full updated `syncPlayerSprites` method:
```typescript
private syncPlayerSprites(): void {
    if (!this.positioningSystem) return;

    for (const playerId of PLAYER_IDS) {
        const sprite = this.playerSprites.get(playerId);
        if (!sprite) continue;

        const position = this.positioningSystem.getPosition(playerId);
        const target = this.toScreenPosition(position);

        this.tweens.add({
            targets: sprite,
            x: target.x,
            y: target.y,
            duration: 180,
            ease: 'sine.out',
        });

        this.ringRenderer?.update(playerId, target, position.zone === 'close');
    }
}
```

- [ ] **Step 6: Run dev server and verify rings appear under each player**

```bash
npm run dev
```

Check:
- Each player has a soft elliptical glow ring beneath their sprite
- Rings are color-coded (red/blue/yellow/green)
- Rings move with the player when repositioning
- Rings pulse faster when a player is in the Close column

- [ ] **Step 7: Run all tests**

```bash
rtk npx vitest run
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
rtk git add src/rendering/PositionRingRenderer.ts tests/rendering/PositionRingRenderer.test.ts src/scenes/HuntScene.ts
rtk git commit -m "feat: add PositionRingRenderer for player occupancy indicators"
```

---

## Task 4: TelegraphRenderer

**Files:**
- Create: `src/rendering/TelegraphRenderer.ts`
- Create: `tests/rendering/TelegraphRenderer.test.ts`
- Modify: `src/scenes/HuntScene.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/rendering/TelegraphRenderer.test.ts
import { describe, it, expect } from 'vitest';
import { telegraphCellRects } from '../../src/rendering/TelegraphRenderer';
import type { AttackDeclaration } from '../../src/core/types';

const W = 1000;
const H = 800;

function makeDeclaration(affectedZones: AttackDeclaration['affectedZones']): AttackDeclaration {
    return { type: 'bite', affectedZones, qteType: 'timing', damage: 10 };
}

describe('telegraphCellRects', () => {
    it('returns one rect per affected zone', () => {
        const decl = makeDeclaration([
            { zone: 'close', flank: 'center' },
        ]);
        const rects = telegraphCellRects(decl, W, H);
        expect(rects).toHaveLength(1);
    });

    it('returns three rects for a full-row attack', () => {
        const decl = makeDeclaration([
            { zone: 'far',   flank: 'left' },
            { zone: 'mid',   flank: 'left' },
            { zone: 'close', flank: 'left' },
        ]);
        const rects = telegraphCellRects(decl, W, H);
        expect(rects).toHaveLength(3);
    });

    it('rect x spans the correct column fraction', () => {
        const decl = makeDeclaration([{ zone: 'far', flank: 'center' }]);
        const [rect] = telegraphCellRects(decl, W, H);
        // Far column: gridLeft (0.05) to farBoundary (0.28)
        expect(rect.x).toBeCloseTo(W * 0.05);
        expect(rect.x + rect.w).toBeCloseTo(W * 0.28);
    });

    it('rect y spans the correct row fraction', () => {
        const decl = makeDeclaration([{ zone: 'mid', flank: 'center' }]);
        const [rect] = telegraphCellRects(decl, W, H);
        // Center row: seam1Y (0.48) to seam2Y (0.64)
        expect(rect.y).toBeCloseTo(H * 0.48);
        expect(rect.y + rect.h).toBeCloseTo(H * 0.64);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
rtk npx vitest run tests/rendering/TelegraphRenderer.test.ts
```

Expected: `Cannot find module '../../src/rendering/TelegraphRenderer'`

- [ ] **Step 3: Create TelegraphRenderer**

```typescript
// src/rendering/TelegraphRenderer.ts
import Phaser from 'phaser';
import type { AttackDeclaration } from '../core/types';
import { ARENA_LAYOUT } from './arenaLayout';

export interface CellRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

const COLUMN_BOUNDS = {
    far:   { left: ARENA_LAYOUT.gridLeft,       right: ARENA_LAYOUT.farBoundary   },
    mid:   { left: ARENA_LAYOUT.farBoundary,    right: ARENA_LAYOUT.closeBoundary },
    close: { left: ARENA_LAYOUT.closeBoundary,  right: ARENA_LAYOUT.gridRight     },
} as const;

const ROW_BOUNDS = {
    left:   { top: ARENA_LAYOUT.gridTop,  bottom: ARENA_LAYOUT.seam1Y    },
    center: { top: ARENA_LAYOUT.seam1Y,   bottom: ARENA_LAYOUT.seam2Y    },
    right:  { top: ARENA_LAYOUT.seam2Y,   bottom: ARENA_LAYOUT.gridBottom },
} as const;

export function telegraphCellRects(
    declaration: AttackDeclaration,
    width: number,
    height: number,
): CellRect[] {
    return declaration.affectedZones.map((pos) => {
        const col = COLUMN_BOUNDS[pos.zone];
        const row = ROW_BOUNDS[pos.flank];
        return {
            x: col.left  * width,
            y: row.top   * height,
            w: (col.right - col.left) * width,
            h: (row.bottom - row.top) * height,
        };
    });
}

const STAGE1_DURATION_MS = 1500;
const DANGER_COLOR  = 0xff3300;
const DANGER_PULSE  = 0xff6622;

export class TelegraphRenderer {
    private stage1?: Phaser.GameObjects.Graphics;
    private stage2?: Phaser.GameObjects.Graphics;
    private stage1Timer?: Phaser.Time.TimerEvent;
    private pulseTimer?: Phaser.Time.TimerEvent;

    constructor(private scene: Phaser.Scene) {}

    show(declaration: AttackDeclaration): void {
        this.clear();

        const { width, height } = this.scene.scale;
        const rects = telegraphCellRects(declaration, width, height);

        // Stage 1: bold overlay shape
        const g1 = this.scene.add.graphics().setDepth(38).setAlpha(0.55);
        g1.fillStyle(DANGER_COLOR, 1);
        for (const r of rects) {
            g1.fillRect(r.x, r.y, r.w, r.h);
        }
        this.stage1 = g1;

        // After STAGE1_DURATION_MS: fade out stage 1, start stage 2 pulse
        this.stage1Timer = this.scene.time.delayedCall(STAGE1_DURATION_MS, () => {
            this.stage1?.destroy();
            this.stage1 = undefined;
            this.startStage2(rects);
        });
    }

    private startStage2(rects: CellRect[]): void {
        const g2 = this.scene.add.graphics().setDepth(37);
        this.stage2 = g2;

        let pulse = false;
        this.pulseTimer = this.scene.time.addEvent({
            delay: 500,
            loop: true,
            callback: () => {
                g2.clear();
                g2.fillStyle(pulse ? DANGER_PULSE : DANGER_COLOR, 0.28);
                for (const r of rects) {
                    g2.fillRect(r.x, r.y, r.w, r.h);
                }
                pulse = !pulse;
            },
        });
    }

    clear(): void {
        this.stage1Timer?.remove();
        this.pulseTimer?.remove();
        this.stage1?.destroy();
        this.stage2?.destroy();
        this.stage1Timer = undefined;
        this.pulseTimer  = undefined;
        this.stage1      = undefined;
        this.stage2      = undefined;
    }

    destroy(): void {
        this.clear();
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
rtk npx vitest run tests/rendering/TelegraphRenderer.test.ts
```

Expected: all 4 tests pass.

- [ ] **Step 5: Wire TelegraphRenderer into HuntScene**

Add import at the top of `src/scenes/HuntScene.ts`:
```typescript
import { TelegraphRenderer } from '../rendering/TelegraphRenderer';
```

Add property to HuntScene class:
```typescript
private telegraphRenderer?: TelegraphRenderer;
```

In `create()`, after `this.ringRenderer = ...`:
```typescript
this.telegraphRenderer = new TelegraphRenderer(this);
```

In `handlePhaseChanged()`, add telegraph rendering on `EVENTS.DINO_TELEGRAPH`. The event is emitted from the `plan` phase block. Subscribe in `create()` after the bus is initialized:

```typescript
this.bus.on(EVENTS.DINO_TELEGRAPH, ({ attack }: { attack: AttackDeclaration }) => {
    this.telegraphRenderer?.show(attack);
});
```

Clear the telegraph when the phase moves to `resolve` (attacks are executing) or back to `plan` (new round). In `handlePhaseChanged()`:

```typescript
if (phase === 'resolve' || (phase === 'plan' && previousPhase !== 'plan')) {
    this.telegraphRenderer?.clear();
}
```

Add the `AttackDeclaration` import to HuntScene if not already present:
```typescript
import type { AttackDeclaration } from '../core/types';
```

- [ ] **Step 6: Run dev server and verify telegraph overlays**

```bash
npm run dev
```

Start a hunt. When the planning phase begins:
- A red overlay should appear over the affected cells immediately
- After ~1.5 seconds it should fade and be replaced by a slower pulsing glow
- On phase change to resolve, all telegraph graphics should clear

- [ ] **Step 7: Run all tests**

```bash
rtk npx vitest run
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
rtk git add src/rendering/TelegraphRenderer.ts tests/rendering/TelegraphRenderer.test.ts src/scenes/HuntScene.ts
rtk git commit -m "feat: add TelegraphRenderer for attack zone highlighting"
```

---

## Self-review notes

- `PlayerId` used in PositionRingRenderer — verify it is exported from `src/core/types.ts` before Task 3.
- `EVENTS.DINO_TELEGRAPH` payload type `{ attack: AttackDeclaration }` — confirmed from `HuntScene.ts:349`.
- `ArenaRendererResult.background` interface unchanged — HuntScene callers unaffected.
- Lane anchor assets (cave-bar-hunter-88w) are placeholders using existing tree props. The `TODO` comment marks the swap point.
- Close zone pulse in PositionRingRenderer is triggered on every `syncPlayerSprites` call — no extra event subscription needed.
