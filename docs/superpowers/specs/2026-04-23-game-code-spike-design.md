# Game Code Spike Design
**Date:** 2026-04-23

---

## Overview

A playable vertical slice to validate that the round-based design holds up in practice. Full round loop, one boss (Dilophosaurus), one arena (Dense Jungle), 4-player input, minimal cave bar. No upgrade tree, no weapon selection, no cocktails.

If the spike works — the planning phase feels social, stagger feels earned, QTE dodge feels tense — we build out the rest. If it doesn't, we iterate on the design before committing to the full build.

---

## Architecture

Two layers connected by an event bus.

**Logic layer** — plain JS classes, zero Phaser dependency, unit-tested with Vitest:
- `RoundStateMachine` — owns PLAN → SUBMIT → RESOLVE → DODGE_QTE state machine and timers
- `PositioningSystem` — 3×3 grid, validates and applies zone/flank moves
- `ActionResolver` — executes player actions, computes damage
- `StaggerSystem` — tracks weak-point damage accumulation, detects stagger, manages stagger window
- `ScoringSystem` — emits point events, tracks per-hunt totals
- `PlayerState` — health, position, current action, active buffs
- `SessionManager` — persists player state across hunt → cave bar → hunt
- `DinosaurAI` — telegraph selection, attack patterns, phase management
- `AttackZoneResolver` — maps an attack declaration to the set of affected zones
- `WeakPointSystem` — per-boss weak point thresholds and damage accumulation
- `EventBus` — typed pub/sub connecting logic to view

**View layer** — Phaser scenes and game objects:
- `Boot` / `Preload` — Phaser boilerplate and asset loading
- `HuntScene` — renders arena + boss + players, owns event bus, drives round loop
- `ArenaRenderer` — Dense Jungle parallax layers and props
- `CaveBarScene` — minimal hub, ready-up only
- `HUD` — composite of 4 `PlayerPanel`s + shared elements
- `PlayerPanel` — per-player health, action menu, position, QTE prompt
- `InputManager` — maps gamepad/keyboard to player actions

The view never makes game decisions. The logic never touches Phaser. `HuntScene` listens to logic events and delegates visual updates to the appropriate renderer or panel.

---

## Shared Types

Defined first — unblocks all parallel tracks:

```js
// Position on the 3×3 grid
Position { zone: 'close'|'mid'|'far', flank: 'left'|'center'|'right' }

// A player's chosen action for the round
PlayerAction {
  type: 'attack'|'aimed_strike'|'reposition'|'brace'|'revive'
  target?: 'head'|'legs'       // aimed_strike only
  moveTo?: Position             // reposition only
}

// Dinosaur's declared attack for the round
AttackDeclaration {
  type: 'spit'|'bite'
  affectedZones: Position[]
  qteType: 'timing'|'smash'
  damage: number
}

// Output of ActionResolver.resolveRound()
RoundResult {
  damageDealt: Map<playerId, number>
  weakPointHits: WeakPointHit[]
  staggerTriggered: boolean
  playersHit: PlayerId[]
}
```

**Event bus events** (logic → view):
- `DinoTelegraph(attack: AttackDeclaration)` — HUD displays callout
- `RoundPhaseChanged(phase, previousPhase)` — panels transition layout
- `PlayerActionSelected(playerId, action)` — teammate indicators update
- `RoundResolved(result: RoundResult)` — damage numbers, animations
- `StaggerTriggered` — slow-motion flash, "STAGGER!" callout
- `PlayerDamaged(playerId, amount, newHealth)` — health bar update
- `PlayerDowned(playerId)` — downed animation
- `DinoHealthChanged(amount, newHealth)` — dino health bar update
- `QTEStart(affectedPlayerIds, qteType)` — QTE prompts appear
- `QTEResult(playerId, success, perfect)` — dodge animation, perfect dodge fx

---

## Round Flow

```
DinosaurAI.selectTelegraph(playerPositions)
  → AttackDeclaration
  → emit DinoTelegraph → HUD shows callout
  → RoundStateMachine enters PLAN (timer: 8–12s)

Players submit PlayerActions via InputManager
  → RoundStateMachine.submitAction(playerId, action)
  → emit PlayerActionSelected → teammate indicators update
  → when all submitted OR timer expires: transition to SUBMIT

SUBMIT (brief pause, ~500ms)
  → transition to RESOLVE

ActionResolver.resolveRound(actions, positioningSystem, dinosaurState)
  → RoundResult
  → emit RoundResolved

StaggerSystem.applyResult(result)
  → if staggered:
      emit StaggerTriggered
      open stagger window (free damage round, no incoming attack)
      → back to PLAN
  → if not staggered:
      AttackZoneResolver.getAffectedPlayers(attack, playerPositions)
      → emit QTEStart for affected players
      → transition to DODGE_QTE

DODGE_QTE
  → affected players input timing press or button smash
  → emit QTEResult per player
  → PlayerState.applyDamage() for failures
  → transition back to PLAN
```

---

## Core Systems

### RoundStateMachine
- States: `plan`, `submit`, `resolve`, `dodge_qte`, `stagger_window`
- Owns the plan-phase countdown timer
- Transitions are explicit methods (`submitAction`, `forceSubmit`, `beginResolve`, etc.)
- Emits `RoundPhaseChanged` on every transition
- Does not know about Phaser — timer uses plain `setTimeout` or a tick-based counter

### PositioningSystem
- Stores current `Position` per player
- `validateMove(playerId, toPosition)` — false if shifting both axes at once (unless Reposition action)
- `applyAction(playerId, action)` — mutates position for Reposition actions
- `getPlayersInZones(zones: Position[])` — returns playerIds in any of the given zones

### ActionResolver
- Executes actions in order: Reposition → Brace → Attack/Aimed Strike → Revive
- Damage formula: fixed base attack damage (no weapon system in spike), modified by zone (Close > Mid > Far)
- Brace: halves incoming damage for that player this round, sets `braced` flag
- Revive: only succeeds if reviver and downed player share the same zone

### StaggerSystem
- Each weak point has `accumulatedDamage` and a `threshold`
- `applyWeakPointDamage(weakPoint, amount)` — accumulates, checks threshold
- On threshold reached: `staggered = true`, emit `StaggerTriggered`, threshold increases by 50% for the next stagger (harder to trigger again)
- Stagger window: 3× damage multiplier, all weak points exposed, no incoming attack

### DinosaurAI (Dilophosaurus)
- Two attacks: `spit` (Mid zone, all flanks; blurs affected players' screens briefly) and `bite` (single target, Close zone)
- Telegraph selection: spit if 2+ players share the same zone, bite otherwise
- Weak points: `head` (spit source, threshold: 15 damage), `legs` (threshold: 20 damage)
- No phase changes in the spike — single phase, fixed HP pool

### ScoringSystem
Points awarded per event:

| Event | Points |
|-|-|
| Damage dealt | 1 pt/hit |
| Weak point hit | 3 pts |
| Perfect dodge | 5 pts |
| Stagger contribution | 3 pts |
| Teammate revive | 10 pts |

Emits `PointsEarned(playerId, amount, reason)` — `HuntScene` renders floating numbers.

### SessionManager
- Stores `PlayerState` snapshots after each hunt
- Provides `savePlayerState(players)` and `loadPlayerState()` 
- For the spike: just health and score persist. Upgrades, weapons, cocktails deferred.
- Passed between scenes via Phaser scene data

---

## Phaser Scenes

### Preload
Loads all assets from `assets/spritecook/manifest.json`:
- Hero spritesheets (red/blue/yellow/green) — all animation frames
- Dilophosaurus spritesheet — idle, walk, telegraph-spit, telegraph-bite, spit, bite, stagger, death
- Dense Jungle tiles and props
- Cave bar tiles (minimal set for the cave bar scene)

### HuntScene
1. Instantiates all logic systems, creates `EventBus`
2. Creates `ArenaRenderer` (Dense Jungle)
3. Creates player sprites positioned at default starting positions
4. Creates Dilophosaurus sprite
5. Creates `HUD`
6. Wires all `EventBus` subscriptions (logic → view)
7. Creates `InputManager`, wires input → `RoundStateMachine`
8. Calls `RoundStateMachine.start()`

On hunt end (dino HP reaches 0): snapshot player state via `SessionManager`, transition to `CaveBarScene`.

### ArenaRenderer
- Three parallax layers: floor (1.0×), mid (0.6×), canopy (0.3×)
- Props (trees, lianas, bushes) placed as static sprites over the mid layer
- Stateless after `create()` — no game logic

### CaveBarScene (spike version)
- Cave bar background tiles
- "X/Y Ready" text indicator
- Each player interacts (any button) to mark ready
- When all active players ready: transition to HuntScene
- No upgrade tree, no bartender, no cocktail purchase

---

## HUD

### Shared elements (overlaid on arena)
- Dinosaur health bar — top center, updates on `DinoHealthChanged`
- Telegraph callout — large animated text on `DinoTelegraph`, shrinks to reminder during PLAN

### PlayerPanel (×4, bottom strip)

| Phase | State |
|-|-|
| PLAN | Full: action menu, position label, teammate indicators, health, buffs |
| RESOLVE | Collapsed: health bar only |
| DODGE_QTE (affected) | Expanded: timing bar or smash counter front and center |
| DODGE_QTE (safe) | Collapsed + dim "SAFE" overlay |
| STAGGER | Collapsed + stagger flash |

Phase transitions driven by `RoundPhaseChanged`. Tweens: 100–150ms, snappy.

Inactive player slots (< 4 players connected): dimmed silhouette, no text.

---

## Input

**InputManager** maps physical input to game events. Never passes raw button state to logic.

| Source | Player |
|-|-|
| Keyboard (WASD + Space) | Player 0 |
| Gamepad 0–3 | Players 0–3 |

During PLAN:
- D-pad up/down: cycle action menu
- A / Space: confirm action → `RoundStateMachine.submitAction()`
- B: cancel, return to browsing

During DODGE_QTE:
- Timing press: A at the right moment
- Button smash: rapid A presses

---

## Parallel Tracks

### Prerequisites (~1 hour, sequential)
Define shared types (`Position`, `PlayerAction`, `AttackDeclaration`, `RoundResult`) and `EventBus`. Commit. Unblocks all tracks.

### Track A: Core Logic (pure JS, TDD)
`RoundStateMachine` → `PositioningSystem` → `ActionResolver` → `StaggerSystem` → `ScoringSystem` → `SessionManager`

Build in dependency order within the track. Each system gets unit tests before integration.

### Track B: Dinosaur AI (pure JS, TDD)
`WeakPointSystem` → `AttackZoneResolver` → `DinosaurAI` (Dilophosaurus)

Fully independent of Track A. Tests cover: telegraph selection logic, zone resolution, weak point thresholds.

### Track C: Scenes + Rendering (Phaser)
`Boot` → `Preload` → `ArenaRenderer` → `HuntScene` shell → `CaveBarScene` → player/dino sprites + animations → scene transitions

Uses Track A stubs (mock EventBus, static player positions) until integration. Asset loading and rendering can be validated visually before logic is wired.

### Track D: HUD + Input (Phaser)
`InputManager` → `PlayerPanel` → `HUD` → QTE visuals → telegraph callout → phase transition tweens

Uses Track A stubs (fire mock events to test panel transitions). Can be developed and tested visually in isolation.

### Integration (sequential, after all tracks)
1. Wire real EventBus into HuntScene — swap stubs for Track A/B systems
2. Connect InputManager → RoundStateMachine
3. Smoke test: full round end-to-end in browser
4. Fix integration issues
5. Cave bar round-trip (hunt → cave bar → hunt)

---

## Out of Scope (Spike)

- Upgrade tree, cocktails, weapon selection/rack
- End-of-hunt summary screen
- Bartender character and reactions
- Cave bar station interactions (trophy wall, scoreboard, etc.)
- Multiple bosses, arenas, hunts
- Drop-in/drop-out
- Leaderboard
- Arena environmental modifiers
