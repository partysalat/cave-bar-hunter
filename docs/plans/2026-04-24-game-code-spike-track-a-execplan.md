# Track A: Build the Phaser-Free Core Logic Backbone

This ExecPlan is a living document. It must be kept in sync with the work in this Track A worktree and it is governed by the coordination plan for the game-code spike, which means it should stay within the Track A ownership boundary and avoid speculative changes to shared contracts or scene code.

## Purpose / Big Picture

Track A gives the game a working, testable logic layer before any Phaser scene wiring exists. After this work lands, the rest of the spike can ask the logic layer to manage round phases, player positions, stagger buildup, score totals, and per-session persistence without guessing at the rules. A novice should be able to run the focused logic tests and see the round flow advance, positions update on the 3x3 grid, stagger thresholds accumulate, points get awarded, and player health plus score survive a hunt-to-cave-bar-to-hunt cycle.

## Progress

- [x] (2026-04-24 00:00Z) Recreated the Track A ExecPlan in `docs/plans/2026-04-24-game-code-spike-track-a-execplan.md` and tied it to the spike coordination plan.
- [x] (2026-04-24 13:09Z) Implemented `src/logic/RoundStateMachine.ts` with phase transitions, action submission gating, and event emission.
- [x] (2026-04-24 13:09Z) Implemented `src/logic/PositioningSystem.ts` with 3x3 position ownership, move validation, and zone queries.
- [x] (2026-04-24 13:09Z) Implemented `src/logic/StaggerSystem.ts` with weak-point thresholds, stagger state, and stagger-window consumption.
- [x] (2026-04-24 13:09Z) Implemented `src/logic/ScoringSystem.ts` with point accounting and `PointsEarned` emission.
- [x] (2026-04-24 13:09Z) Implemented `src/logic/SessionManager.ts` with cross-hunt persistence of health and score.
- [x] (2026-04-24 13:09Z) Added focused Vitest coverage in `tests/logic/` that proves behavior rather than only checking stored fields.
- [x] (2026-04-24 13:09Z) Ran the Track A test slice and TypeScript check successfully.

## Surprises & Discoveries

- Observation: The workspace did not have local dependencies installed, so `npx vitest` and `npx tsc` tried to resolve packages from the network and failed until `npm ci` was run.
  Evidence: `npm error network request to https://registry.npmjs.com/vitest failed, reason: getaddrinfo ENOTFOUND registry.npmjs.com`

## Decision Log

- Decision: Keep Track A strictly inside logic-layer files and tests, and do not touch scenes, HUD, input, or shared contracts unless a shared contract blocker is proven.
  Rationale: The spike is split across parallel worktrees, and Track A can be validated independently without risking conflicts with other tracks.
  Date/Author: 2026-04-24 / Codex

- Decision: Defer `ActionResolver` until the first-wave core systems are in place and demonstrably stable.
  Rationale: The user explicitly asked for the first-wave logic classes only, and deferring the resolver keeps the slice narrower while still unblocking later integration work.
  Date/Author: 2026-04-24 / Codex

- Decision: Keep the implementation Phaser-free and use the existing typed event bus for logic-to-logic and logic-to-view signaling.
  Rationale: The spike design requires a pure logic layer that can be unit-tested without the renderer or scene graph.
  Date/Author: 2026-04-24 / Codex

## Outcomes & Retrospective

Track A now has a working Phaser-free logic backbone plus focused Vitest coverage. The first wave of systems can advance phases, manage 3x3 positions, accumulate stagger, award points, and persist player health and score snapshots without touching scene code or shared contracts. The main lesson from the session was environmental rather than architectural: validation needed a local dependency install before the test runner could execute.

## Context and Orientation

The repository already contains the shared contracts that Track A must build on:

- `src/core/types.ts` defines `Zone`, `Flank`, `Position`, `PlayerAction`, `AttackDeclaration`, `WeakPointHit`, and `RoundResult`.
- `src/core/events.ts` defines the event names, round phases, and payload shapes, including `RoundPhaseChanged`, `StaggerTriggered`, `PlayerDamaged`, `DinoHealthChanged`, and `PointsEarned`.
- `src/core/EventBus.ts` provides the typed pub/sub mechanism that logic classes will use to emit those events.

Track A will create a new `src/logic/` directory. The initial classes are:

- `RoundStateMachine`: owns the phase order `plan -> submit -> resolve -> dodge_qte -> stagger_window`, accepts player actions, and emits phase changes.
- `PositioningSystem`: owns the 3x3 positions for players and answers zone queries.
- `StaggerSystem`: accumulates weak-point damage, determines when stagger triggers, and tracks the stagger window.
- `ScoringSystem`: converts combat events into point totals and emits `PointsEarned`.
- `SessionManager`: stores and restores player health and score between hunt and cave-bar visits.

The logic layer must not import Phaser or depend on any scene object. The only shared dependency should be the event bus and the shared type definitions.

## Plan of Work

First, create `src/logic/RoundStateMachine.ts` and write tests that describe how the machine behaves when it starts in `plan`, accepts actions, force-submits after the phase deadline, and emits `RoundPhaseChanged` exactly when a transition occurs. The machine should expose the constructor and methods described in the spike contract, but the implementation should stay minimal and event-driven.

Next, create `src/logic/PositioningSystem.ts` and cover the 3x3 grid rules in tests. The system should start every player at a defined position, reject invalid moves that are not expressible on the grid, apply reposition actions, and return all players that occupy any zone from a provided list.

After that, add `src/logic/StaggerSystem.ts`. The tests should prove that weak-point damage accumulates, stagger only triggers when the threshold is met or exceeded, the threshold gets harder after a successful stagger, and the stagger window can be consumed once.

Then add `src/logic/ScoringSystem.ts`. This system should keep per-player totals, award points for damage, weak-point hits, perfect dodges, stagger contributions, and revives, and emit `PointsEarned` with a clear reason string every time points change.

Finally, add `src/logic/SessionManager.ts` and tests that prove a saved session can be loaded back with player health and score intact. The session manager should remain intentionally narrow for the spike: it only persists the parts of player state that the spike design commits to.

If a hidden dependency appears while implementing these files, stop and record it here rather than broadening the scope into shared contracts or scene code.

## Concrete Steps

Work from `/tmp/cave-bar-hunter-track-a`.

1. Create the logic directory and the five TypeScript source files.

   Expected shape:

       src/logic/RoundStateMachine.ts
       src/logic/PositioningSystem.ts
       src/logic/StaggerSystem.ts
       src/logic/ScoringSystem.ts
       src/logic/SessionManager.ts

2. Add matching tests under `tests/logic/` for each class.

3. Run the focused Track A tests with Vitest.

   Example command:

       npm test -- --run tests/logic

   The important result is that the new logic tests pass and the output names the Track A suite clearly enough to confirm which slice was exercised.

4. If the tests expose a contract mismatch, update this ExecPlan with the discovery before making any further code changes.

## Validation and Acceptance

Acceptance for Track A is behavior-based. The implementation is complete when the focused logic tests demonstrate all of the following:

- The round machine transitions between phases in the intended order and emits phase-change events.
- The positioning system keeps player locations on the 3x3 grid and can answer zone-based queries.
- The stagger system accumulates weak-point damage and triggers a stagger window when thresholds are met.
- The scoring system awards the right point values and emits point events.
- The session manager can save and reload player health and score across a simulated hunt boundary.

The validation command should be run from `/tmp/cave-bar-hunter-track-a`. If the command fails, the failure should point directly to a behavior gap in one of the Track A systems rather than to unrelated scene code.

## Idempotence and Recovery

The work is safe to repeat because the plan only adds or updates files inside the Track A logic and test area. If a test run fails halfway through an implementation step, re-run the relevant focused test file after fixing the behavior. If an implementation choice proves incompatible with the shared event contracts, do not patch around it silently; record the blocker in this plan and stop so the coordination plan can absorb the change.

## Artifacts and Notes

The most important artifacts for this slice will be the five logic source files, the `tests/logic/` test files, and the Vitest output that shows the Track A suite passing. Any noteworthy discovery about phase timing, grid validation, or score accounting should be captured here in a short terminal transcript or a concise note.

Validation summary:

    ./node_modules/.bin/tsc --noEmit
    ./node_modules/.bin/vitest run tests/logic

    Test Files  5 passed (5)
         Tests  11 passed (11)

## Interfaces and Dependencies

Track A should build only on these shared modules:

- `src/core/EventBus.ts`
- `src/core/events.ts`
- `src/core/types.ts`

The intended end-state interfaces are:

    class RoundStateMachine {
        constructor(bus: EventBus, options?: RoundStateMachineOptions)
        start(): void
        submitAction(playerId: PlayerId, action: PlayerAction): void
        forceSubmit(): void
        beginResolve(): void
        beginDodgeQte(): void
        openStaggerWindow(): void
        tick(deltaMs?: number): void
        getPhase(): RoundPhase
    }

    class PositioningSystem {
        getPosition(playerId: PlayerId): Position
        setPosition(playerId: PlayerId, position: Position): void
        validateMove(playerId: PlayerId, toPosition: Position): boolean
        applyAction(playerId: PlayerId, action: PlayerAction): void
        getPlayersInZones(zones: Position[]): PlayerId[]
    }

    class StaggerSystem {
        applyWeakPointDamage(weakPoint: WeakPoint, amount: number): boolean
        isStaggered(): boolean
        consumeStaggerWindow(): boolean
    }

    class ScoringSystem {
        awardDamage(playerId: PlayerId, amount: number): number
        awardWeakPointHit(playerId: PlayerId): number
        awardPerfectDodge(playerId: PlayerId): number
        awardStaggerContribution(playerId: PlayerId): number
        awardRevive(playerId: PlayerId): number
        getTotals(): Record<PlayerId, number>
    }

    class SessionManager {
        savePlayerState(players: Array<{ playerId: PlayerId; health: number; score: number }>): void
        loadPlayerState(): Array<{ playerId: PlayerId; health: number; score: number }>
    }

This plan was written on 2026-04-24 and should be revised in place as implementation decisions are made.

Revision note: On 2026-04-24, Track A was implemented and validated with focused local binaries after discovering the worktree had no preinstalled dependencies. The plan was updated to mark the five logic systems, their tests, and the validation step as complete so the next contributor can see the current state without re-deriving it from the code.
