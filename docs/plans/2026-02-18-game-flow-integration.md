# Game Flow Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire CaveBarScene and HuntScene into a playable loop with proper victory/failure routing and SessionManager integration.

**Architecture:** SessionManager holds cross-scene state (scores, loadouts, hunt number). Victory routes back to CaveBarScene with state preserved. Failure routes to a minimal GameOverScene stub (full retry UX is a separate issue). The advanceHunt() bug (silent optional-chain against nonexistent method) is fixed here.

**Tech Stack:** Phaser 3 scenes, ES6 modules, Vitest for unit tests

---

## Current State (read before starting)

- `SessionManager` has `nextHunt()` and `completeHunt(dinosaurId)` but no `advanceHunt()` or `startHunt()`
- `HuntScene.showHuntEnd()` calls `gameSession.advanceHunt?.()` — optional chain silently no-ops
- Hunt failure routes to `CaveBarScene` (wrong — should go to `GameOverScene`)
- `GameOverScene` does not exist
- `main.js` only registers `[CaveBarScene, HuntScene]`

---

### Task 1: Add `advanceHunt()` and `startHunt()` to SessionManager

**Files:**
- Modify: `src/systems/SessionManager.js`
- Create: `tests/SessionManager.test.js`

**Step 1: Write failing tests**

```js
import { describe, it, expect, beforeEach } from 'vitest';
import SessionManager from '../src/systems/SessionManager.js';

describe('SessionManager', () => {
    let session;
    beforeEach(() => { session = new SessionManager(); });

    it('startHunt logs current hunt number', () => {
        // startHunt is called at the beginning of each hunt
        // it should not throw and currentHunt should still be 1
        session.startHunt();
        expect(session.getCurrentHunt()).toBe(1);
    });

    it('advanceHunt records defeat and increments hunt number', () => {
        session.advanceHunt('compy-pack');
        expect(session.getCurrentHunt()).toBe(2);
        expect(session.getDefeatedDinosaurs()).toContain('compy-pack');
    });

    it('advanceHunt without dinosaurId still increments', () => {
        session.advanceHunt();
        expect(session.getCurrentHunt()).toBe(2);
    });

    it('cocktail buffs are cleared after advanceHunt', () => {
        session.playerData[0].cocktailBuffs = [{ effect: { type: 'shield', value: 1 } }];
        session.advanceHunt('compy-pack');
        expect(session.playerData[0].cocktailBuffs).toHaveLength(0);
    });

    it('isSessionComplete returns true after 5 hunts', () => {
        for (let i = 0; i < 5; i++) session.advanceHunt(`dino-${i}`);
        expect(session.isSessionComplete()).toBe(true);
    });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- SessionManager.test.js
```

Expected: FAIL — `startHunt is not a function`, `advanceHunt is not a function`

**Step 3: Add methods to SessionManager**

In `src/systems/SessionManager.js`, add after the `completeHunt` method:

```js
/**
 * Called at the start of each hunt (for logging / future setup hooks).
 */
startHunt() {
    console.log(`🎯 Hunt ${this.currentHunt}/${this.totalHunts} starting`);
}

/**
 * Called on hunt victory. Records defeat and advances to next hunt.
 * @param {string} [dinosaurId] - ID of the defeated dinosaur
 */
advanceHunt(dinosaurId) {
    if (dinosaurId) this.completeHunt(dinosaurId);
    this.nextHunt();
}
```

**Step 4: Run tests to verify pass**

```bash
npm test -- SessionManager.test.js
```

Expected: PASS (5 tests)

**Step 5: Commit**

```bash
git add src/systems/SessionManager.js tests/SessionManager.test.js
git commit -m "feat: add advanceHunt() and startHunt() to SessionManager"
```

---

### Task 2: Create minimal GameOverScene

**Files:**
- Create: `src/scenes/GameOverScene.js`

This is a stub scene — full retry UX is tracked in cave-bar-hunter-7dd. It shows GAME OVER, scores, and restarts after 5 seconds.

**Step 1: Write the scene**

```js
import Phaser from 'phaser';
import { SCREEN_WIDTH, SCREEN_HEIGHT, DEPTH_LAYERS } from '../systems/CoordinateSystem.js';
import { gameSession } from '../systems/SessionManager.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        const cx = SCREEN_WIDTH / 2;
        const cy = SCREEN_HEIGHT / 2;

        // Dark overlay
        this.add.rectangle(cx, cy, SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000, 0.85)
            .setScrollFactor(0).setDepth(DEPTH_LAYERS.UI);

        this.add.text(cx, cy - 200, 'GAME OVER', {
            fontSize: '120px', fontFamily: 'Arial', color: '#ff2222',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 12,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_LAYERS.UI + 1);

        // Show player scores
        const scores = gameSession.playerData.map(
            (pd, i) => `Player ${i + 1}: ${pd.score} pts`
        );
        this.add.text(cx, cy, scores.join('\n'), {
            fontSize: '36px', fontFamily: 'Arial', color: '#ffffff',
            align: 'center', lineSpacing: 16,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_LAYERS.UI + 1);

        this.add.text(cx, cy + 280, 'Restarting in 5 seconds…', {
            fontSize: '28px', fontFamily: 'Arial', color: '#aaaaaa',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_LAYERS.UI + 1);

        this.time.delayedCall(5000, () => {
            gameSession.reset();
            this.cameras.main.fadeOut(600, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('CaveBarScene');
            });
        });
    }
}
```

No unit test needed for a Phaser scene (no testable logic beyond what SessionManager already covers).

**Step 2: Commit**

```bash
git add src/scenes/GameOverScene.js
git commit -m "feat: add minimal GameOverScene stub"
```

---

### Task 3: Register GameOverScene in main.js

**Files:**
- Modify: `src/main.js`

**Step 1: Add import and registration**

```js
import GameOverScene from './scenes/GameOverScene.js';

// Change scene array from:
scene: [CaveBarScene, HuntScene]
// To:
scene: [CaveBarScene, HuntScene, GameOverScene]
```

**Step 2: Verify game still boots**

```bash
npm run dev
```

Open browser, confirm CaveBarScene loads (no console errors).

**Step 3: Commit**

```bash
git add src/main.js
git commit -m "feat: register GameOverScene in Phaser config"
```

---

### Task 4: Fix HuntScene victory/failure routing

**Files:**
- Modify: `src/scenes/HuntScene.js`

**Current `showHuntEnd` (broken):**
```js
showHuntEnd(isVictory) {
    gameSession.savePlayerState?.(this.players);
    if (isVictory) gameSession.advanceHunt?.();   // ← optional chain, silently no-ops
    // …
    this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('CaveBarScene');           // ← always CaveBarScene, even on failure
    });
}
```

**Step 1: Fix `showHuntEnd`**

Replace the entire `showHuntEnd` method body with:

```js
showHuntEnd(isVictory) {
    const msg   = isVictory ? 'HUNT COMPLETE!' : 'HUNT FAILED!';
    const color = isVictory ? '#ffcc00' : '#ff4444';

    gameSession.savePlayerState(this.players);
    if (isVictory) gameSession.advanceHunt('compy-pack');

    this.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, msg, {
        fontSize: '72px', fontFamily: 'Arial', color,
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 10,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_LAYERS.UI + 100);

    const nextScene = isVictory ? 'CaveBarScene' : 'GameOverScene';

    this.time.delayedCall(3000, () => {
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(nextScene);
        });
    });
}
```

Note: `'compy-pack'` is hardcoded here because Hunt 1 is always the compy pack. Future hunts will pass the correct dinosaur ID.

**Step 2: Verify manually**

```bash
npm run dev
```

- Play through victory: compys die → "HUNT COMPLETE!" → fades to CaveBarScene
- Trigger failure: let all players be downed → "HUNT FAILED!" → fades to GameOverScene → GameOverScene shows scores → resets and returns to CaveBarScene

**Step 3: Commit**

```bash
git add src/scenes/HuntScene.js
git commit -m "fix: route hunt victory to CaveBarScene, failure to GameOverScene"
```

---

### Task 5: Add hunt number display to CaveBarScene

**Files:**
- Modify: `src/scenes/CaveBarScene.js`

**Step 1: Show current hunt in the header**

In `buildTimerDisplay()`, after the "NEXT HUNT IN" text, add:

```js
const hunt = gameSession.getCurrentHunt();
const total = gameSession.totalHunts;
this.add.text(cx, 155, `Hunt ${hunt} of ${total}`, {
    fontSize: '22px', fontFamily: 'Arial', color: '#ffcc88',
}).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_LAYERS.UI);
```

**Step 2: Verify**

```bash
npm run dev
```

Confirm "Hunt 1 of 5" appears in CaveBarScene header.

**Step 3: Commit**

```bash
git add src/scenes/CaveBarScene.js
git commit -m "feat: show current hunt number in CaveBarScene header"
```

---

### Task 6: Close issue and push

```bash
bd close cave-bar-hunter-4l7
bd sync
git push
```

Confirm `git status` shows "up to date with origin".

---

## Acceptance Criteria

- [ ] `npm test` passes (including new SessionManager tests)
- [ ] Victory path: all compys die → "HUNT COMPLETE!" → CaveBarScene with hunt number incremented
- [ ] Failure path: all players downed → "HUNT FAILED!" → GameOverScene → 5s → resets to CaveBarScene
- [ ] CaveBarScene shows "Hunt N of 5" in header
- [ ] No silent optional-chaining on SessionManager calls