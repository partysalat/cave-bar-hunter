# Shared Types + EventBus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up TypeScript and define the shared data types and EventBus that all parallel tracks depend on.

**Architecture:** TypeScript interfaces define the contracts for `Position`, `PlayerAction`, `AttackDeclaration`, and `RoundResult`. A typed `EventBus` class connects the logic layer to the view layer via named events. No Phaser dependency anywhere in this task.

**Tech Stack:** TypeScript, Vite (native TS support), Vitest

---

## File Structure

```
src/
  core/
    types.ts      # Zone, Flank, PlayerId, Position, PlayerAction,
                  # AttackDeclaration, WeakPointHit, RoundResult
    events.ts     # EVENTS constants, EventName, RoundPhase, EventData map
    EventBus.ts   # Typed pub/sub class
tests/
  EventBus.test.ts
```

The old `tests/*.test.js` files reference `src/` files from the deleted action game. They are dead and will be removed.

---

## Task 1: Install TypeScript and configure the project

**Files:**
- Create: `tsconfig.json`
- Modify: `package.json` (add typescript devDependency)

- [ ] **Step 1: Install TypeScript**

```bash
npm install -D typescript
```

Expected: `typescript` appears in `package.json` devDependencies.

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 3: Delete dead test files**

These reference the deleted action-game `src/` and will never pass:

```bash
rm tests/CameraController.test.js tests/CaveBarSession.test.js \
   tests/CombatSystem.test.js tests/CompyAI.test.js \
   tests/InputManager.test.js tests/PackCoordinator.test.js \
   tests/PhysicsManager.test.js tests/Player.test.js \
   tests/SceneFlowSession.test.js tests/SessionManager.test.js
```

- [ ] **Step 4: Create the src/core directory**

```bash
mkdir -p src/core
```

- [ ] **Step 5: Verify TypeScript is working**

```bash
npx tsc --noEmit
```

Expected: exits with no errors (no source files yet, that's fine).

- [ ] **Step 6: Commit**

```bash
git add tsconfig.json package.json package-lock.json tests/
git commit -m "Add TypeScript, remove dead test files"
```

---

## Task 2: Define core types

**Files:**
- Create: `src/core/types.ts`

- [ ] **Step 1: Create src/core/types.ts**

```typescript
export type Zone = 'close' | 'mid' | 'far';
export type Flank = 'left' | 'center' | 'right';
export type ActionType = 'attack' | 'aimed_strike' | 'reposition' | 'brace' | 'revive';
export type WeakPoint = 'head' | 'legs';
export type QteType = 'timing' | 'smash';
export type PlayerId = 0 | 1 | 2 | 3;

export interface Position {
    zone: Zone;
    flank: Flank;
}

export interface PlayerAction {
    type: ActionType;
    /** aimed_strike only */
    target?: WeakPoint;
    /** reposition only */
    moveTo?: Position;
}

export interface AttackDeclaration {
    type: 'spit' | 'bite';
    affectedZones: Position[];
    qteType: QteType;
    damage: number;
}

export interface WeakPointHit {
    weakPoint: WeakPoint;
    playerId: PlayerId;
    damage: number;
}

export interface RoundResult {
    damageDealt: Map<PlayerId, number>;
    weakPointHits: WeakPointHit[];
    staggerTriggered: boolean;
    playersHit: PlayerId[];
}
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: exits with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/core/types.ts
git commit -m "Add core game types (Position, PlayerAction, AttackDeclaration, RoundResult)"
```

---

## Task 3: Define event names and payload types

**Files:**
- Create: `src/core/events.ts`

- [ ] **Step 1: Create src/core/events.ts**

```typescript
import type {
    AttackDeclaration,
    PlayerAction,
    PlayerId,
    QteType,
    RoundResult,
} from './types.js';

export const EVENTS = {
    DINO_TELEGRAPH:         'DinoTelegraph',
    ROUND_PHASE_CHANGED:    'RoundPhaseChanged',
    PLAYER_ACTION_SELECTED: 'PlayerActionSelected',
    ROUND_RESOLVED:         'RoundResolved',
    STAGGER_TRIGGERED:      'StaggerTriggered',
    PLAYER_DAMAGED:         'PlayerDamaged',
    PLAYER_DOWNED:          'PlayerDowned',
    DINO_HEALTH_CHANGED:    'DinoHealthChanged',
    QTE_START:              'QTEStart',
    QTE_RESULT:             'QTEResult',
    POINTS_EARNED:          'PointsEarned',
} as const;

export type EventName = typeof EVENTS[keyof typeof EVENTS];

export type RoundPhase = 'plan' | 'submit' | 'resolve' | 'dodge_qte' | 'stagger_window';

export interface EventData {
    [EVENTS.DINO_TELEGRAPH]:         { attack: AttackDeclaration };
    [EVENTS.ROUND_PHASE_CHANGED]:    { phase: RoundPhase; previousPhase: RoundPhase };
    [EVENTS.PLAYER_ACTION_SELECTED]: { playerId: PlayerId; action: PlayerAction };
    [EVENTS.ROUND_RESOLVED]:         { result: RoundResult };
    [EVENTS.STAGGER_TRIGGERED]:      Record<never, never>;
    [EVENTS.PLAYER_DAMAGED]:         { playerId: PlayerId; amount: number; newHealth: number };
    [EVENTS.PLAYER_DOWNED]:          { playerId: PlayerId };
    [EVENTS.DINO_HEALTH_CHANGED]:    { amount: number; newHealth: number };
    [EVENTS.QTE_START]:              { affectedPlayerIds: PlayerId[]; qteType: QteType };
    [EVENTS.QTE_RESULT]:             { playerId: PlayerId; success: boolean; perfect: boolean };
    [EVENTS.POINTS_EARNED]:          { playerId: PlayerId; amount: number; reason: string };
}
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: exits with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/core/events.ts
git commit -m "Add event names and typed EventData map"
```

---

## Task 4: Implement EventBus (TDD)

**Files:**
- Create: `tests/EventBus.test.ts`
- Create: `src/core/EventBus.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/EventBus.test.ts`:

```typescript
import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../src/core/EventBus.js';
import { EVENTS } from '../src/core/events.js';

describe('EventBus', () => {
    it('calls handler when event is emitted', () => {
        const bus = new EventBus();
        const handler = vi.fn();

        bus.on(EVENTS.STAGGER_TRIGGERED, handler);
        bus.emit(EVENTS.STAGGER_TRIGGERED, {});

        expect(handler).toHaveBeenCalledOnce();
    });

    it('passes event data to the handler', () => {
        const bus = new EventBus();
        const handler = vi.fn();

        bus.on(EVENTS.PLAYER_DAMAGED, handler);
        bus.emit(EVENTS.PLAYER_DAMAGED, { playerId: 0, amount: 2, newHealth: 3 });

        expect(handler).toHaveBeenCalledWith({ playerId: 0, amount: 2, newHealth: 3 });
    });

    it('does not call handler after off()', () => {
        const bus = new EventBus();
        const handler = vi.fn();

        bus.on(EVENTS.STAGGER_TRIGGERED, handler);
        bus.off(EVENTS.STAGGER_TRIGGERED, handler);
        bus.emit(EVENTS.STAGGER_TRIGGERED, {});

        expect(handler).not.toHaveBeenCalled();
    });

    it('calls all handlers registered for the same event', () => {
        const bus = new EventBus();
        const h1 = vi.fn();
        const h2 = vi.fn();

        bus.on(EVENTS.STAGGER_TRIGGERED, h1);
        bus.on(EVENTS.STAGGER_TRIGGERED, h2);
        bus.emit(EVENTS.STAGGER_TRIGGERED, {});

        expect(h1).toHaveBeenCalledOnce();
        expect(h2).toHaveBeenCalledOnce();
    });

    it('does not cross-fire handlers registered for different events', () => {
        const bus = new EventBus();
        const handler = vi.fn();

        bus.on(EVENTS.PLAYER_DOWNED, handler);
        bus.emit(EVENTS.STAGGER_TRIGGERED, {});

        expect(handler).not.toHaveBeenCalled();
    });

    it('calls once() handler exactly once across multiple emits', () => {
        const bus = new EventBus();
        const handler = vi.fn();

        bus.once(EVENTS.STAGGER_TRIGGERED, handler);
        bus.emit(EVENTS.STAGGER_TRIGGERED, {});
        bus.emit(EVENTS.STAGGER_TRIGGERED, {});

        expect(handler).toHaveBeenCalledOnce();
    });

    it('does not throw when emitting with no listeners', () => {
        const bus = new EventBus();
        expect(() => bus.emit(EVENTS.STAGGER_TRIGGERED, {})).not.toThrow();
    });

    it('off() on a handler that was never registered does not throw', () => {
        const bus = new EventBus();
        const handler = vi.fn();
        expect(() => bus.off(EVENTS.STAGGER_TRIGGERED, handler)).not.toThrow();
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/EventBus.test.ts
```

Expected: FAIL — `EventBus.ts` does not exist yet.

- [ ] **Step 3: Implement EventBus**

Create `src/core/EventBus.ts`:

```typescript
import type { EventData, EventName } from './events.js';

type Handler<K extends EventName> = (data: EventData[K]) => void;

export class EventBus {
    private readonly listeners = new Map<EventName, Set<Handler<EventName>>>();

    on<K extends EventName>(event: K, handler: Handler<K>): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(handler as Handler<EventName>);
    }

    off<K extends EventName>(event: K, handler: Handler<K>): void {
        this.listeners.get(event)?.delete(handler as Handler<EventName>);
    }

    emit<K extends EventName>(event: K, data: EventData[K]): void {
        this.listeners.get(event)?.forEach(h => h(data));
    }

    once<K extends EventName>(event: K, handler: Handler<K>): void {
        const wrapper: Handler<K> = (data) => {
            handler(data);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/EventBus.test.ts
```

Expected: 8 tests pass.

- [ ] **Step 5: Verify full TypeScript compile**

```bash
npx tsc --noEmit
```

Expected: exits with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/core/EventBus.ts tests/EventBus.test.ts
git commit -m "Add typed EventBus with on/off/emit/once"
```

---

## Task 5: Close ticket and sync

- [ ] **Step 1: Close the beads ticket**

```bash
bd close cave-bar-hunter-xuk --reason="TypeScript configured, shared types and EventBus implemented and tested"
```

- [ ] **Step 2: Sync and push**

```bash
bd sync
git push
```

Expected: `git status` shows clean working tree, up to date with origin.
