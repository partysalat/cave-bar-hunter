# Attack Skill QTE Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add weapon-specific attack QTEs (club = timing press, bow = directional reticle) that fire simultaneously with the dodge QTE, so every round is a moment of simultaneous offense and defense.

**Architecture:** Extend shared types with `WeaponType` and `switch_weapon` action; rename `dodge_qte` phase to `attack_and_dodge_qte`; add three new events (`ATTACK_QTE_START`, `ATTACK_QTE_RESULT`, `WEAPON_SWITCHED`); defer dino damage application from `resolveCurrentRound` to `finalizeQteRound` so attack QTE results can modify it before it lands.

**Tech Stack:** TypeScript, Phaser 3, Vitest

---

## File Map

| File | Change |
|-|-|
| `src/core/types.ts` | Add `WeaponType`; add `switch_weapon` to `PlayerAction`; add `attackingPlayers` to `RoundResult` |
| `src/core/events.ts` | Rename `dodge_qte` → `attack_and_dodge_qte` in `RoundPhase`; add 3 new events |
| `src/logic/ActionResolver.ts` | Add `activeWeapon?` to `ResolverPlayerState`; populate `attackingPlayers` in `resolveRound` output |
| `src/logic/RoundStateMachine.ts` | Rename `dodge_qte` → `attack_and_dodge_qte` throughout; rename `beginDodgeQte` → `beginAttackAndDodgeQte` |
| `src/logic/SessionManager.ts` | Add `activeWeapon` to `SessionPlayerState` |
| `src/ui/HUD.ts` | Update phase check `dodge_qte` → `attack_and_dodge_qte` |
| `src/scenes/HuntScene.ts` | Add weapon state; add `switch_weapon` to action menu; defer damage; add attack QTE handling |
| `tests/logic/ActionResolver.test.ts` | Tests for `attackingPlayers` population and weapon type pass-through |
| `tests/logic/RoundStateMachine.test.ts` | Update `dodge_qte` → `attack_and_dodge_qte` reference |
| `tests/logic/SessionManager.test.ts` | Update to include `activeWeapon` in saved/loaded state |

---

## Task 1: Add WeaponType and extend PlayerAction and RoundResult

**Files:**
- Modify: `src/core/types.ts`

- [ ] **Step 1: Add `WeaponType`, `switch_weapon` action, and `attackingPlayers` to `RoundResult`**

Replace the entire `src/core/types.ts` with:

```ts
export type Zone = 'close' | 'mid' | 'far';
export type Flank = 'left' | 'center' | 'right';
export type WeakPoint = 'head' | 'legs';
export type QteType = 'timing' | 'smash';
export type PlayerId = 0 | 1 | 2 | 3;
export type WeaponType = 'club' | 'bow';

export interface Position {
    zone: Zone;
    flank: Flank;
}

export type PlayerAction =
    | { type: 'attack' }
    | { type: 'aimed_strike'; target: WeakPoint }
    | { type: 'reposition'; moveTo: Position }
    | { type: 'brace' }
    | { type: 'revive' }
    | { type: 'switch_weapon' };

/** Convenience alias derived from the discriminated union */
export type ActionType = PlayerAction['type'];

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

export interface AttackingPlayer {
    playerId: PlayerId;
    weaponType: WeaponType;
    action: 'attack' | 'aimed_strike';
}

export interface RoundResult {
    damageDealt: Record<PlayerId, number>;
    weakPointHits: WeakPointHit[];
    staggerTriggered: boolean;
    playersHit: PlayerId[];
    attackingPlayers: AttackingPlayer[];
}
```

- [ ] **Step 2: Run build to check for immediate compile errors**

```bash
npm run build 2>&1 | head -30
```

Expected: errors about `attackingPlayers` missing from `RoundResult` literals — that's fine, we fix those in later tasks. No errors about `WeaponType` itself.

- [ ] **Step 3: Commit**

```bash
rtk git add src/core/types.ts
rtk git commit -m "feat: add WeaponType, switch_weapon action, attackingPlayers to RoundResult"
```

---

## Task 2: Add attack QTE events and rename phase

**Files:**
- Modify: `src/core/events.ts`

- [ ] **Step 1: Update `events.ts`**

Replace the entire file:

```ts
import type {
    AttackDeclaration,
    AttackingPlayer,
    PlayerAction,
    PlayerId,
    QteType,
    RoundResult,
    WeakPoint,
    WeaponType,
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
    ATTACK_QTE_START:       'AttackQTEStart',
    ATTACK_QTE_RESULT:      'AttackQTEResult',
    WEAPON_SWITCHED:        'WeaponSwitched',
    POINTS_EARNED:          'PointsEarned',
} as const;

export type EventName = typeof EVENTS[keyof typeof EVENTS];

export type RoundPhase = 'plan' | 'submit' | 'resolve' | 'attack_and_dodge_qte' | 'stagger_window';

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
    [EVENTS.ATTACK_QTE_START]:       { attackingPlayers: AttackingPlayer[] };
    [EVENTS.ATTACK_QTE_RESULT]:      { playerId: PlayerId; weaponType: WeaponType; critical: boolean; weakPoint: WeakPoint | null };
    [EVENTS.WEAPON_SWITCHED]:        { playerId: PlayerId; newWeapon: WeaponType };
    [EVENTS.POINTS_EARNED]:          { playerId: PlayerId; amount: number; reason: string };
}
```

- [ ] **Step 2: Commit**

```bash
rtk git add src/core/events.ts
rtk git commit -m "feat: add attack QTE events and rename dodge_qte phase to attack_and_dodge_qte"
```

---

## Task 3: Update ActionResolver to populate attackingPlayers

**Files:**
- Modify: `src/logic/ActionResolver.ts`
- Modify: `tests/logic/ActionResolver.test.ts`

- [ ] **Step 1: Write failing tests**

Add to `tests/logic/ActionResolver.test.ts` at the end of the `describe` block:

```ts
it('populates attackingPlayers with weaponType from playerState', () => {
    const resolver = new ActionResolver();
    const positioning = new PositioningSystem();

    const result = resolver.resolveRound({
        playerActions: {
            0: { type: 'attack' },
            1: { type: 'aimed_strike', target: 'head' },
            2: { type: 'brace' },
        },
        positioningSystem: positioning,
        attackDeclaration: {
            type: 'bite',
            affectedZones: [{ zone: 'close', flank: 'center' }],
            qteType: 'smash',
            damage: 6,
        },
        playerState: {
            0: { health: 4, downed: false, activeWeapon: 'bow' },
            1: { health: 4, downed: false, activeWeapon: 'club' },
            2: { health: 4, downed: false },
            3: { health: 4, downed: false },
        },
    });

    expect(result.attackingPlayers).toEqual([
        { playerId: 0, weaponType: 'bow', action: 'attack' },
        { playerId: 1, weaponType: 'club', action: 'aimed_strike' },
    ]);
});

it('excludes downed players from attackingPlayers', () => {
    const resolver = new ActionResolver();
    const positioning = new PositioningSystem();

    const result = resolver.resolveRound({
        playerActions: {
            0: { type: 'attack' },
        },
        positioningSystem: positioning,
        attackDeclaration: {
            type: 'bite',
            affectedZones: [],
            qteType: 'smash',
            damage: 6,
        },
        playerState: {
            0: { health: 0, downed: true },
            1: { health: 4, downed: false },
            2: { health: 4, downed: false },
            3: { health: 4, downed: false },
        },
    });

    expect(result.attackingPlayers).toEqual([]);
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run tests/logic/ActionResolver.test.ts 2>&1 | tail -15
```

Expected: FAIL — `attackingPlayers` is undefined.

- [ ] **Step 3: Update ActionResolver**

Replace `src/logic/ActionResolver.ts`:

```ts
import type { AttackDeclaration, AttackingPlayer, PlayerAction, PlayerId, RoundResult, WeakPoint, WeaponType } from '../core/types.js';
import PositioningSystem from './PositioningSystem.js';

export interface ResolverPlayerState {
    health: number;
    downed: boolean;
    braced?: boolean;
    activeWeapon?: WeaponType;
}

export interface ResolveRoundInput {
    playerActions: Partial<Record<PlayerId, PlayerAction>>;
    positioningSystem: PositioningSystem;
    attackDeclaration: AttackDeclaration;
    playerState: Record<PlayerId, ResolverPlayerState>;
    staggerActive?: boolean;
}

const PLAYER_IDS: PlayerId[] = [0, 1, 2, 3];

function emptyDamageRecord(): Record<PlayerId, number> {
    return { 0: 0, 1: 0, 2: 0, 3: 0 };
}

function zoneDamage(zone: 'close' | 'mid' | 'far'): number {
    if (zone === 'close') return 3;
    if (zone === 'mid') return 2;
    return 1;
}

function orderedActionEntries(playerActions: Partial<Record<PlayerId, PlayerAction>>, type: PlayerAction['type']): Array<[PlayerId, PlayerAction]> {
    return PLAYER_IDS
        .map((playerId) => [playerId, playerActions[playerId]] as const)
        .filter((entry): entry is [PlayerId, PlayerAction] => entry[1] !== undefined && entry[1].type === type);
}

export class ActionResolver {
    resolveRound(input: ResolveRoundInput): RoundResult {
        const { playerActions, positioningSystem, playerState, staggerActive = false } = input;
        const damageDealt = emptyDamageRecord();
        const weakPointHits: RoundResult['weakPointHits'] = [];
        const attackingPlayers: AttackingPlayer[] = [];
        const revivedPlayers = new Set<PlayerId>();
        const braceMap = new Map<PlayerId, boolean>();

        for (const [playerId, action] of orderedActionEntries(playerActions, 'reposition')) {
            if (!playerState[playerId]?.downed) {
                positioningSystem.applyAction(playerId, action);
            }
        }

        for (const [playerId] of orderedActionEntries(playerActions, 'brace')) {
            if (!playerState[playerId]?.downed) {
                braceMap.set(playerId, true);
            }
        }

        for (const [playerId, action] of [
            ...orderedActionEntries(playerActions, 'attack'),
            ...orderedActionEntries(playerActions, 'aimed_strike'),
        ]) {
            if (playerState[playerId]?.downed) {
                continue;
            }

            const position = positioningSystem.getPosition(playerId);
            const multiplier = staggerActive ? 3 : 1;
            const damage = zoneDamage(position.zone) * multiplier;
            damageDealt[playerId] += damage;

            const weaponType = playerState[playerId]?.activeWeapon ?? 'club';
            attackingPlayers.push({ playerId, weaponType, action: action.type as 'attack' | 'aimed_strike' });

            if (action.type === 'aimed_strike') {
                weakPointHits.push({
                    weakPoint: action.target as WeakPoint,
                    playerId,
                    damage,
                });
            }
        }

        for (const [playerId] of orderedActionEntries(playerActions, 'revive')) {
            if (playerState[playerId]?.downed) {
                continue;
            }

            const reviverPosition = positioningSystem.getPosition(playerId);
            const target = PLAYER_IDS.find((candidate) => {
                if (candidate === playerId || revivedPlayers.has(candidate)) return false;
                const candidateState = playerState[candidate];
                if (!candidateState?.downed) return false;
                const candidatePosition = positioningSystem.getPosition(candidate);
                return candidatePosition.zone === reviverPosition.zone;
            });

            if (target !== undefined) {
                revivedPlayers.add(target);
            }
        }

        const playersHit = PLAYER_IDS.filter((playerId) => braceMap.has(playerId));

        return {
            damageDealt,
            weakPointHits,
            staggerTriggered: false,
            playersHit,
            attackingPlayers,
        };
    }
}

export default ActionResolver;
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run tests/logic/ActionResolver.test.ts 2>&1 | tail -15
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
rtk git add src/logic/ActionResolver.ts tests/logic/ActionResolver.test.ts
rtk git commit -m "feat: populate attackingPlayers in ActionResolver output"
```

---

## Task 4: Rename dodge_qte in RoundStateMachine and fix all references

**Files:**
- Modify: `src/logic/RoundStateMachine.ts`
- Modify: `tests/logic/RoundStateMachine.test.ts`
- Modify: `src/ui/HUD.ts`

- [ ] **Step 1: Update RoundStateMachine**

In `src/logic/RoundStateMachine.ts`, make these changes:

1. Update the options interface — change `dodgeQteDurationMs` to `attackAndDodgeQteDurationMs`:

```ts
export interface RoundStateMachineOptions {
    playerIds?: PlayerId[];
    planDurationMs?: number;
    submitDurationMs?: number;
    attackAndDodgeQteDurationMs?: number;
    staggerWindowDurationMs?: number;
}
```

2. Update the `durations` map in the constructor:

```ts
this.durations = {
    plan: options.planDurationMs ?? 8000,
    submit: options.submitDurationMs ?? 500,
    attack_and_dodge_qte: options.attackAndDodgeQteDurationMs ?? 3000,
    stagger_window: options.staggerWindowDurationMs ?? 3000,
};
```

3. Rename `beginDodgeQte` to `beginAttackAndDodgeQte` and update the body:

```ts
beginAttackAndDodgeQte(): void {
    if (this.phase !== 'resolve') {
        throw new Error(`Cannot begin attack/dodge QTE while in ${this.phase} phase.`);
    }
    this.transitionTo('attack_and_dodge_qte');
}
```

4. In the `tick` method, change `this.phase === 'dodge_qte'` to `this.phase === 'attack_and_dodge_qte'`:

```ts
if (this.phase === 'attack_and_dodge_qte' || this.phase === 'stagger_window') {
    this.transitionTo('plan');
    continue;
}
```

5. The `PhaseTimer` type uses `Exclude<RoundPhase, 'resolve'>` — since `RoundPhase` is imported from `events.ts` which now has `attack_and_dodge_qte`, the `durations` record type needs updating. The `durations` field is `Record<PhaseTimer['phase'], number>` where `PhaseTimer['phase']` is `Exclude<RoundPhase, 'resolve'>`. This will correctly infer `'plan' | 'submit' | 'attack_and_dodge_qte' | 'stagger_window'`. No manual change needed here — it flows from the types.

- [ ] **Step 2: Update RoundStateMachine test**

In `tests/logic/RoundStateMachine.test.ts`, find the one reference to `dodge_qte` and update it:

```ts
// Change this:
expect(machine.getPhase()).toBe('dodge_qte');
// To:
expect(machine.getPhase()).toBe('attack_and_dodge_qte');
```

Also update the `beginDodgeQte()` call in the same test:

```ts
// Change this:
machine.beginDodgeQte();
// To:
machine.beginAttackAndDodgeQte();
```

- [ ] **Step 3: Update HUD.ts**

In `src/ui/HUD.ts`, update the phase check:

```ts
// Change this:
if (data.phase !== 'dodge_qte') {
// To:
if (data.phase !== 'attack_and_dodge_qte') {
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/logic/RoundStateMachine.test.ts 2>&1 | tail -15
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
rtk git add src/logic/RoundStateMachine.ts tests/logic/RoundStateMachine.test.ts src/ui/HUD.ts
rtk git commit -m "feat: rename dodge_qte phase to attack_and_dodge_qte"
```

---

## Task 5: Add activeWeapon to SessionPlayerState

**Files:**
- Modify: `src/logic/SessionManager.ts`
- Modify: `tests/logic/SessionManager.test.ts`

- [ ] **Step 1: Write a failing test**

Add to `tests/logic/SessionManager.test.ts` inside the `describe` block:

```ts
it('persists activeWeapon across save/load', () => {
    const session = new SessionManager();

    session.savePlayerState([
        { playerId: 0, health: 4, score: 0, activeWeapon: 'bow' },
    ]);

    expect(session.loadPlayerState()).toEqual([
        { playerId: 0, health: 4, score: 0, activeWeapon: 'bow' },
    ]);
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx vitest run tests/logic/SessionManager.test.ts 2>&1 | tail -15
```

Expected: FAIL — `activeWeapon` not present in loaded state.

- [ ] **Step 3: Update SessionManager**

Replace `src/logic/SessionManager.ts`:

```ts
import type { PlayerId, WeaponType } from '../core/types.js';

export interface SessionPlayerState {
    playerId: PlayerId;
    health: number;
    score: number;
    activeWeapon: WeaponType;
}

export class SessionManager {
    private readonly playerState = new Map<PlayerId, Omit<SessionPlayerState, 'playerId'>>();

    savePlayerState(players: SessionPlayerState[]): void {
        for (const player of players) {
            this.playerState.set(player.playerId, {
                health: player.health,
                score: player.score,
                activeWeapon: player.activeWeapon,
            });
        }
    }

    loadPlayerState(): SessionPlayerState[] {
        return [...this.playerState.entries()]
            .sort(([left], [right]) => left - right)
            .map(([playerId, state]) => ({
                playerId,
                health: state.health,
                score: state.score,
                activeWeapon: state.activeWeapon,
            }));
    }
}

export default SessionManager;
```

- [ ] **Step 4: Run all logic tests**

```bash
npx vitest run tests/logic/ 2>&1 | tail -20
```

Expected: all logic tests PASS. Note: `SessionManager.test.ts` existing tests will fail because the old snapshots don't include `activeWeapon` — update them now.

Update the two existing tests in `tests/logic/SessionManager.test.ts` to include `activeWeapon: 'club'` in all player state objects (both the `savePlayerState` call and the `toEqual` expectation):

```ts
it('saves and restores player health and score snapshots', () => {
    const session = new SessionManager();

    session.savePlayerState([
        { playerId: 0, health: 3, score: 18, activeWeapon: 'club' },
        { playerId: 2, health: 1, score: 9, activeWeapon: 'bow' },
    ]);

    expect(session.loadPlayerState()).toEqual([
        { playerId: 0, health: 3, score: 18, activeWeapon: 'club' },
        { playerId: 2, health: 1, score: 9, activeWeapon: 'bow' },
    ]);
});

it('overwrites an existing snapshot for the same player', () => {
    const session = new SessionManager();

    session.savePlayerState([{ playerId: 1, health: 2, score: 4, activeWeapon: 'club' }]);
    session.savePlayerState([{ playerId: 1, health: 4, score: 11, activeWeapon: 'bow' }]);

    expect(session.loadPlayerState()).toEqual([
        { playerId: 1, health: 4, score: 11, activeWeapon: 'bow' },
    ]);
});
```

Run again:

```bash
npx vitest run tests/logic/SessionManager.test.ts 2>&1 | tail -15
```

Expected: all 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
rtk git add src/logic/SessionManager.ts tests/logic/SessionManager.test.ts
rtk git commit -m "feat: persist activeWeapon in SessionManager"
```

---

## Task 6: Add weapon state and switch_weapon to HuntScene

**Files:**
- Modify: `src/scenes/HuntScene.ts`

This task adds `activeWeapon` to `PlayerRuntimeState`, adds `switch_weapon` to the action menu, updates `toResolverState()` and `savePlayerState()`/`loadPlayerState()`, and emits `WEAPON_SWITCHED` on switch. No attack QTE logic yet — that's Task 7.

- [ ] **Step 1: Update `PlayerRuntimeState` type**

Find this type definition (around line 28):

```ts
type PlayerRuntimeState = SessionPlayerState & {
    downed: boolean;
    selectedIndex: number;
};
```

Replace with:

```ts
type PlayerRuntimeState = SessionPlayerState & {
    downed: boolean;
    selectedIndex: number;
};
```

Wait — `SessionPlayerState` now includes `activeWeapon: WeaponType`, so `PlayerRuntimeState` inherits it automatically via the intersection. No change to the type definition needed. The compiler will enforce that `createDefaultPlayerState()` provides it.

- [ ] **Step 2: Add `switch_weapon` to `ACTION_ORDER` and update `selectedAction`**

Find the constant (around line 40):

```ts
const ACTION_ORDER = ['attack', 'brace', 'aimed_head', 'aimed_legs', 'reposition', 'revive'] as const;
```

Replace with:

```ts
const ACTION_ORDER = ['attack', 'brace', 'aimed_head', 'aimed_legs', 'reposition', 'revive', 'switch_weapon'] as const;
```

Find `selectedAction` and add the new case:

```ts
case 'switch_weapon':
    return { type: 'switch_weapon' };
```

- [ ] **Step 3: Update `createDefaultPlayerState` to include `activeWeapon`**

Find the function (around line 43):

```ts
function createDefaultPlayerState(): Record<PlayerId, PlayerRuntimeState> {
    return {
        0: { playerId: 0, health: DEFAULT_PLAYER_HEALTH, score: 0, downed: false, selectedIndex: 0 },
        1: { playerId: 1, health: DEFAULT_PLAYER_HEALTH, score: 0, downed: false, selectedIndex: 0 },
        2: { playerId: 2, health: DEFAULT_PLAYER_HEALTH, score: 0, downed: false, selectedIndex: 0 },
        3: { playerId: 3, health: DEFAULT_PLAYER_HEALTH, score: 0, downed: false, selectedIndex: 0 },
    };
}
```

Replace with:

```ts
function createDefaultPlayerState(): Record<PlayerId, PlayerRuntimeState> {
    return {
        0: { playerId: 0, health: DEFAULT_PLAYER_HEALTH, score: 0, downed: false, selectedIndex: 0, activeWeapon: 'club' },
        1: { playerId: 1, health: DEFAULT_PLAYER_HEALTH, score: 0, downed: false, selectedIndex: 0, activeWeapon: 'club' },
        2: { playerId: 2, health: DEFAULT_PLAYER_HEALTH, score: 0, downed: false, selectedIndex: 0, activeWeapon: 'club' },
        3: { playerId: 3, health: DEFAULT_PLAYER_HEALTH, score: 0, downed: false, selectedIndex: 0, activeWeapon: 'club' },
    };
}
```

- [ ] **Step 4: Update `toResolverState()` to pass `activeWeapon`**

Find the method (around line 517):

```ts
private toResolverState() {
    return {
        0: { health: this.playerState[0].health, downed: this.playerState[0].downed },
        1: { health: this.playerState[1].health, downed: this.playerState[1].downed },
        2: { health: this.playerState[2].health, downed: this.playerState[2].downed },
        3: { health: this.playerState[3].health, downed: this.playerState[3].downed },
    };
}
```

Replace with:

```ts
private toResolverState() {
    return {
        0: { health: this.playerState[0].health, downed: this.playerState[0].downed, activeWeapon: this.playerState[0].activeWeapon },
        1: { health: this.playerState[1].health, downed: this.playerState[1].downed, activeWeapon: this.playerState[1].activeWeapon },
        2: { health: this.playerState[2].health, downed: this.playerState[2].downed, activeWeapon: this.playerState[2].activeWeapon },
        3: { health: this.playerState[3].health, downed: this.playerState[3].downed, activeWeapon: this.playerState[3].activeWeapon },
    };
}
```

- [ ] **Step 5: Update `savePlayerState()` to persist `activeWeapon`**

Find the method (around line 507):

```ts
private savePlayerState(): void {
    this.sessionManager.savePlayerState(
        PLAYER_IDS.map((playerId) => ({
            playerId,
            health: this.playerState[playerId].health,
            score: this.playerState[playerId].score,
        })),
    );
}
```

Replace with:

```ts
private savePlayerState(): void {
    this.sessionManager.savePlayerState(
        PLAYER_IDS.map((playerId) => ({
            playerId,
            health: this.playerState[playerId].health,
            score: this.playerState[playerId].score,
            activeWeapon: this.playerState[playerId].activeWeapon,
        })),
    );
}
```

- [ ] **Step 6: Update `loadPlayerState()` to restore `activeWeapon`**

Find the method (around line 493):

```ts
private loadPlayerState(): void {
    const saved = this.sessionManager.loadPlayerState();
    this.playerState = createDefaultPlayerState();

    for (const player of saved) {
        this.playerState[player.playerId] = {
            ...this.playerState[player.playerId],
            health: player.health,
            score: player.score,
            downed: player.health <= 0,
        };
    }
}
```

Replace with:

```ts
private loadPlayerState(): void {
    const saved = this.sessionManager.loadPlayerState();
    this.playerState = createDefaultPlayerState();

    for (const player of saved) {
        this.playerState[player.playerId] = {
            ...this.playerState[player.playerId],
            health: player.health,
            score: player.score,
            downed: player.health <= 0,
            activeWeapon: player.activeWeapon,
        };
    }
}
```

- [ ] **Step 7: Handle switch_weapon in `resolveCurrentRound()` before ActionResolver**

Inside `resolveCurrentRound()`, after the `playerActions` map is built (around line 398, after the `for (const playerId of PLAYER_IDS)` loop), add this block before the `this.actionResolver.resolveRound(...)` call:

```ts
// Apply weapon switches before resolve so activeWeapon is current for the round
for (const playerId of PLAYER_IDS) {
    if (playerActions[playerId]?.type === 'switch_weapon') {
        const current = this.playerState[playerId].activeWeapon;
        this.playerState[playerId].activeWeapon = current === 'club' ? 'bow' : 'club';
        this.bus.emit(EVENTS.WEAPON_SWITCHED, {
            playerId,
            newWeapon: this.playerState[playerId].activeWeapon,
        });
    }
}
```

Make sure `EVENTS.WEAPON_SWITCHED` is imported — it's already on the `EVENTS` object imported at the top of the file.

- [ ] **Step 8: Build to verify no compile errors**

```bash
npm run build 2>&1 | grep -E "error TS" | head -20
```

Expected: zero TypeScript errors.

- [ ] **Step 9: Commit**

```bash
rtk git add src/scenes/HuntScene.ts
rtk git commit -m "feat: add weapon state and switch_weapon action to HuntScene"
```

---

## Task 7: Defer damage and add attack QTE handling

**Files:**
- Modify: `src/scenes/HuntScene.ts`

This is the largest task. It restructures `resolveCurrentRound` to defer dino damage, adds attack QTE state fields, adds `handleAttackQteInput`, wires attack QTE events, and updates `finalizeQteRound` to apply attack QTE modifiers before landing damage.

**Club QTE timing window:** Duration is 1500ms. Sweet-spot = middle 25% = 375ms wide, centered. Starts at 562ms, ends at 937ms.

**Bow QTE:** Duration is 2000ms. D-pad up/down moves reticle to `'head'`/`'legs'`. Confirm (jump button) fires.

- [ ] **Step 1: Add attack QTE imports and state fields to `HuntScene`**

First, find the import from `../core/types.js` at the top of `src/scenes/HuntScene.ts` and add `AttackingPlayer` and `WeakPoint` to it. It currently imports `PlayerId`, `Position`, `PlayerAction`, `AttackDeclaration` — add the two new ones:

```ts
import type { AttackDeclaration, AttackingPlayer, PlayerAction, PlayerId, Position, RoundResult, WeakPoint } from '../core/types.js';
```

Then find the existing QTE fields in the class body (around line 118):

```ts
private qteElapsedMs = 0;
private qteResponded = new Set<PlayerId>();
private qteAffected: PlayerId[] = [];
```

Add these new fields immediately after:

```ts
private pendingRoundResult?: RoundResult;
private attackQteElapsedMs = 0;
private attackingPlayers: AttackingPlayer[] = [];
private attackQteResponded = new Set<PlayerId>();
private attackQteResults = new Map<PlayerId, { critical: boolean; weakPoint: WeakPoint | null }>();
private bowTargets = new Map<PlayerId, WeakPoint | null>();
```

- [ ] **Step 2: Update `update()` to handle attack_and_dodge_qte phase**

Find the `update` method. Replace the phase check for `dodge_qte`:

```ts
if (phase === 'dodge_qte') {
    this.qteElapsedMs += delta;
}
```

With:

```ts
if (phase === 'attack_and_dodge_qte') {
    this.qteElapsedMs += delta;
    this.attackQteElapsedMs += delta;
}
```

Find the per-player input dispatch:

```ts
if (phase === 'plan') {
    this.handlePlanningInput(playerId, input, previous);
} else if (phase === 'dodge_qte') {
    this.handleQteInput(playerId, input, previous);
}
```

Replace with:

```ts
if (phase === 'plan') {
    this.handlePlanningInput(playerId, input, previous);
} else if (phase === 'attack_and_dodge_qte') {
    this.handleQteInput(playerId, input, previous);
    this.handleAttackQteInput(playerId, input, previous);
}
```

- [ ] **Step 3: Update `handlePhaseChanged` for renamed phase**

Find:

```ts
if (previousPhase === 'dodge_qte' && phase === 'plan') {
    this.finalizeQteRound();
}
```

Replace with:

```ts
if (previousPhase === 'attack_and_dodge_qte' && phase === 'plan') {
    this.finalizeQteRound();
}
```

- [ ] **Step 4: Add `handleAttackQteInput` method**

Add this method to `HuntScene` after `handleQteInput`:

```ts
private handleAttackQteInput(playerId: PlayerId, input: LogicalInputState, previous: LogicalInputState): void {
    const attacker = this.attackingPlayers.find((a) => a.playerId === playerId);
    if (!attacker || this.attackQteResponded.has(playerId)) {
        return;
    }

    if (attacker.weaponType === 'club') {
        if (input.jumpPressed && !previous.jumpPressed) {
            this.attackQteResponded.add(playerId);
            const elapsed = this.attackQteElapsedMs;
            const critical = elapsed >= 562 && elapsed <= 937;
            this.attackQteResults.set(playerId, { critical, weakPoint: null });
            this.bus.emit(EVENTS.ATTACK_QTE_RESULT, {
                playerId,
                weaponType: 'club' as const,
                critical,
                weakPoint: null,
            });
        }
    } else {
        // bow
        if (input.up && !previous.up) {
            this.bowTargets.set(playerId, 'head');
        }
        if (input.down && !previous.down) {
            this.bowTargets.set(playerId, 'legs');
        }
        if (input.jumpPressed && !previous.jumpPressed) {
            this.attackQteResponded.add(playerId);
            const weakPoint = this.bowTargets.get(playerId) ?? null;
            this.attackQteResults.set(playerId, { critical: weakPoint !== null, weakPoint });
            this.bus.emit(EVENTS.ATTACK_QTE_RESULT, {
                playerId,
                weaponType: 'bow' as const,
                critical: weakPoint !== null,
                weakPoint,
            });
        }
    }
}
```

- [ ] **Step 5: Restructure `resolveCurrentRound()` to defer damage**

Find the section inside `resolveCurrentRound()` that currently runs after `this.bus.emit(EVENTS.ROUND_RESOLVED, { result })`:

```ts
this.bus.emit(EVENTS.ROUND_RESOLVED, { result });

let totalDamage = 0;
for (const playerId of PLAYER_IDS) {
    const damage = result.damageDealt[playerId];
    if (damage > 0) {
        totalDamage += damage;
        this.scoringSystem?.awardDamage(playerId, damage);
    }
}

for (const weakPointHit of result.weakPointHits) {
    this.scoringSystem?.awardWeakPointHit(weakPointHit.playerId);
    const triggered = this.staggerSystem?.applyWeakPointDamage(weakPointHit.weakPoint, weakPointHit.damage) ?? false;
    if (triggered) {
        this.bonusDamageRound = true;
        this.scoringSystem?.awardStaggerContribution(weakPointHit.playerId);
    }
}

this.dinoHealth = Math.max(0, this.dinoHealth - totalDamage);
this.bus.emit(EVENTS.DINO_HEALTH_CHANGED, { amount: -totalDamage, newHealth: this.dinoHealth });
this.syncHudFromState();
this.syncPlayerSprites();

if (this.dinoHealth <= 0) {
    this.savePlayerState();
    this.scene.start(SCENE_KEYS.CAVE_BAR, { sessionManager: this.sessionManager });
    return;
}

if (this.bonusDamageRound) {
    this.bonusDamageRound = false;
    this.staggerSystem?.consumeStaggerWindow();
    this.roundStateMachine.beginPlan();
    return;
}

this.qteAffected = this.attackZoneResolver?.getAffectedPlayers(this.currentTelegraph, this.getCurrentPositions()) ?? [];
this.qteResponded.clear();
this.qteElapsedMs = 0;

if (this.qteAffected.length === 0) {
    this.roundStateMachine.beginPlan();
    return;
}

this.bus.emit(EVENTS.QTE_START, {
    affectedPlayerIds: this.qteAffected,
    qteType: this.currentTelegraph.qteType,
});
this.roundStateMachine.beginDodgeQte();
```

Replace everything from `this.bus.emit(EVENTS.ROUND_RESOLVED, { result })` to the end of the method with:

```ts
this.bus.emit(EVENTS.ROUND_RESOLVED, { result });

// Stagger window: apply damage immediately (no QTE this round)
if (this.bonusDamageRound) {
    const killed = this.applyRoundResult(result);
    if (killed) {
        this.savePlayerState();
        this.scene.start(SCENE_KEYS.CAVE_BAR, { sessionManager: this.sessionManager });
        return;
    }
    this.bonusDamageRound = false;
    this.staggerSystem?.consumeStaggerWindow();
    this.roundStateMachine.beginPlan();
    return;
}

// Store result for deferred application after QTE
this.pendingRoundResult = result;
this.attackingPlayers = result.attackingPlayers;
this.attackQteResponded.clear();
this.attackQteResults.clear();
this.bowTargets.clear();
this.attackQteElapsedMs = 0;

this.qteAffected = this.attackZoneResolver?.getAffectedPlayers(this.currentTelegraph, this.getCurrentPositions()) ?? [];
this.qteResponded.clear();
this.qteElapsedMs = 0;

if (this.attackingPlayers.length > 0) {
    this.bus.emit(EVENTS.ATTACK_QTE_START, { attackingPlayers: this.attackingPlayers });
}

if (this.qteAffected.length > 0) {
    this.bus.emit(EVENTS.QTE_START, {
        affectedPlayerIds: this.qteAffected,
        qteType: this.currentTelegraph.qteType,
    });
}

if (this.attackingPlayers.length === 0 && this.qteAffected.length === 0) {
    this.finalizeQteRound();
    this.roundStateMachine.beginPlan();
    return;
}

this.roundStateMachine.beginAttackAndDodgeQte();
```

- [ ] **Step 6: Add `applyRoundResult()` helper method**

Add this private method to `HuntScene`:

```ts
private applyRoundResult(result: RoundResult, damageMultipliers?: Map<PlayerId, number>): boolean {
    const finalWeakPointHits = [...result.weakPointHits];
    const multipliers = damageMultipliers ?? new Map();

    let totalDamage = 0;
    for (const playerId of PLAYER_IDS) {
        const base = result.damageDealt[playerId];
        if (base > 0) {
            const multiplier = multipliers.get(playerId) ?? 1;
            const damage = base * multiplier;
            totalDamage += damage;
            this.scoringSystem?.awardDamage(playerId, damage);
            // Update damage in weak point hits if multiplied
            if (multiplier !== 1) {
                const hit = finalWeakPointHits.find((h) => h.playerId === playerId);
                if (hit) {
                    hit.damage = damage;
                }
            }
        }
    }

    for (const weakPointHit of finalWeakPointHits) {
        this.scoringSystem?.awardWeakPointHit(weakPointHit.playerId);
        const triggered = this.staggerSystem?.applyWeakPointDamage(weakPointHit.weakPoint, weakPointHit.damage) ?? false;
        if (triggered) {
            this.bonusDamageRound = true;
            this.scoringSystem?.awardStaggerContribution(weakPointHit.playerId);
        }
    }

    this.dinoHealth = Math.max(0, this.dinoHealth - totalDamage);
    this.bus.emit(EVENTS.DINO_HEALTH_CHANGED, { amount: -totalDamage, newHealth: this.dinoHealth });
    this.syncHudFromState();
    this.syncPlayerSprites();

    return this.dinoHealth <= 0;
}
```

- [ ] **Step 7: Rewrite `finalizeQteRound()` to apply attack QTE modifiers**

Replace the existing `finalizeQteRound()` method with:

```ts
private finalizeQteRound(): void {
    if (!this.currentTelegraph) {
        return;
    }

    if (this.pendingRoundResult) {
        const result = this.pendingRoundResult;
        const damageMultipliers = new Map<PlayerId, number>();

        // Compute final weak point hits based on attack QTE results
        const finalWeakPointHits = result.weakPointHits.filter((hit) => {
            const attacker = this.attackingPlayers.find((a) => a.playerId === hit.playerId);
            if (!attacker) return true; // not an attacker, keep as-is

            const qteResult = this.attackQteResults.get(hit.playerId);
            if (attacker.weaponType === 'club') {
                // Club aimed_strike: keep weak point hit only on crit
                return qteResult?.critical === true;
            }
            // Bow aimed_strike: keep weak point hit only if player hit that zone
            return qteResult?.weakPoint === hit.weakPoint;
        });

        // Add new weak point hits from bow attack (not aimed_strike) landing on a zone
        for (const attacker of this.attackingPlayers) {
            if (attacker.weaponType !== 'bow' || attacker.action !== 'attack') continue;
            const qteResult = this.attackQteResults.get(attacker.playerId);
            if (qteResult?.weakPoint) {
                finalWeakPointHits.push({
                    playerId: attacker.playerId,
                    weakPoint: qteResult.weakPoint,
                    damage: result.damageDealt[attacker.playerId],
                });
            }
        }

        // Club crit doubles damage
        for (const attacker of this.attackingPlayers) {
            if (attacker.weaponType !== 'club') continue;
            const qteResult = this.attackQteResults.get(attacker.playerId);
            if (qteResult?.critical) {
                damageMultipliers.set(attacker.playerId, 2);
            }
        }

        const modifiedResult: RoundResult = {
            ...result,
            weakPointHits: finalWeakPointHits,
        };

        const killed = this.applyRoundResult(modifiedResult, damageMultipliers);
        this.pendingRoundResult = undefined;

        if (killed) {
            this.savePlayerState();
            this.scene.start(SCENE_KEYS.CAVE_BAR, { sessionManager: this.sessionManager });
            return;
        }

        // If stagger was triggered during this finalize, skip dodge damage
        if (this.bonusDamageRound) {
            this.qteAffected = [];
            this.qteResponded.clear();
            this.qteElapsedMs = 0;
            return;
        }
    }

    // Apply dodge failures
    for (const playerId of this.qteAffected) {
        if (this.qteResponded.has(playerId)) {
            continue;
        }
        this.bus.emit(EVENTS.QTE_RESULT, { playerId, success: false, perfect: false });
        this.applyPlayerDamage(playerId, this.currentTelegraph.damage);
    }

    this.qteAffected = [];
    this.qteResponded.clear();
    this.qteElapsedMs = 0;
    this.attackingPlayers = [];
    this.attackQteResponded.clear();
    this.attackQteResults.clear();
    this.bowTargets.clear();
    this.attackQteElapsedMs = 0;
}
```

- [ ] **Step 8: Build to verify no compile errors**

```bash
npm run build 2>&1 | grep -E "error TS" | head -20
```

Expected: zero TypeScript errors.

- [ ] **Step 9: Run all passing tests**

```bash
npx vitest run tests/logic/ tests/rendering/ 2>&1 | tail -20
```

Expected: all tests that were passing before still pass.

- [ ] **Step 10: Commit**

```bash
rtk git add src/scenes/HuntScene.ts
rtk git commit -m "feat: implement attack QTE flow with deferred damage application"
```

---

## Final Verification

- [ ] **Full build**

```bash
npm run build 2>&1 | grep -E "error TS"
```

Expected: no errors.

- [ ] **Run all logic and rendering tests**

```bash
npx vitest run tests/logic/ tests/rendering/ 2>&1 | tail -20
```

Expected: all pass.

- [ ] **Push**

```bash
rtk git push
```
