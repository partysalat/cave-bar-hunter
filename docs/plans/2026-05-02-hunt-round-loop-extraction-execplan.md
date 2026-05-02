# Extract A Phaser-Free Hunt Round Loop

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with `.agents/PLANS.md`. It assumes only the current working tree and this file.

## Purpose / Big Picture

After this work, the Hunt in Dense Jungle will no longer depend on `src/scenes/HuntScene.ts` to own the real game cadence. A contributor will be able to drive the Hunt round loop through a Phaser-free module, verify the round cadence with focused tests, and keep `HuntScene` as a rendering and input adapter. The visible proof is that a pure logic test can start a Hunt, observe a telegraph, submit hunter actions, and watch the loop move through its early phases without creating a Phaser scene.

## Progress

- [x] (2026-05-02 09:10Z) Reviewed the current Hunt architecture, loaded the game-spike spec, and confirmed that `src/scenes/HuntScene.ts` owns most Hunt cadence logic.
- [x] (2026-05-02 09:16Z) Added `CONTEXT.md` so the new seam uses repository domain language consistently, including the new term “Hunt Round Loop”.
- [x] (2026-05-02 09:24Z) Wrote the first `src/logic/HuntRoundLoop.ts` API skeleton with a Phaser-free snapshot/command interface and a minimal working slice for `begin_hunt`, planning submissions, and timer-driven plan-to-submit transitions.
- [x] (2026-05-02 09:24Z) Added `tests/logic/HuntRoundLoop.test.ts` to lock the initial seam behavior with pure logic tests.
- [ ] Integrate `HuntScene` with `HuntRoundLoop` so the scene becomes an adapter instead of the live Hunt state owner.
- [ ] Move resolve, attack QTE, dodge QTE, stagger window, scoring, and Cave Bar handoff sequencing behind `HuntRoundLoop`.
- [ ] Retire direct Hunt cadence state from `src/scenes/HuntScene.ts` after the adapter path proves out.

## Surprises & Discoveries

- Observation: the repository does not yet contain a project `docs/adr/` folder or a `CONTEXT.md`, even though the architecture-review skill expects both.
  Evidence: repository search returned no `docs/adr/*` files and no `CONTEXT.md` before this change.

- Observation: `RoundStateMachine` currently combines attack and dodge into one phase named `attack_and_dodge_qte`, while the proposed deeper seam benefits from separate `attack_qte` and `dodge_qte` phases.
  Evidence: `src/core/events.ts` defines `RoundPhase` with `attack_and_dodge_qte`, and `src/scenes/HuntScene.ts` manually tracks separate attack and dodge timers anyway.

- Observation: `tsconfig.json` includes only `src`, so new source files must stay strict-clean even if tests import them from outside that include set.
  Evidence: `tsconfig.json` includes `"include": ["src"]`.

## Decision Log

- Decision: name the new deepened module `HuntRoundLoop`.
  Rationale: it uses the existing domain term Hunt and makes the repeated cadence explicit without inventing a generic orchestration label.
  Date/Author: 2026-05-02 / Codex

- Decision: start with a working API skeleton instead of attempting the full Hunt extraction in one change.
  Rationale: the current `HuntScene` owns too much behavior to move safely in one pass. A skeleton with focused tests creates a stable seam first, then later milestones can move behavior behind it incrementally.
  Date/Author: 2026-05-02 / Codex

- Decision: use a command-and-snapshot interface instead of exposing the internal `EventBus` at the seam.
  Rationale: a command-and-snapshot interface gives better leverage for tests and keeps transient Hunt events explicit without leaking scene-oriented event ordering into callers.
  Date/Author: 2026-05-02 / Codex

## Outcomes & Retrospective

The first milestone is complete. The repository now contains a named Hunt Round Loop seam, a self-contained plan for the larger extraction, and a tested Phaser-free module skeleton that proves the direction is viable. The main remaining work is the actual migration of Hunt behavior out of `src/scenes/HuntScene.ts`.

## Context and Orientation

`src/scenes/HuntScene.ts` is currently the real Hunt owner. It creates the EventBus, initializes player state, polls input, computes telegraphs, resolves rounds, runs attack and dodge QTE timers, applies damage, updates score, and hands state to `src/scenes/CaveBarScene.ts`. The logic layer already contains reusable modules under `src/logic/` and `src/logic/dino/`, especially `ActionResolver`, `RoundStateMachine`, `PositioningSystem`, `ScoringSystem`, `StaggerSystem`, `DilophosaurusAI`, and `AttackZoneResolver`, but `HuntScene` still coordinates them directly.

The new module introduced by this plan is `src/logic/HuntRoundLoop.ts`. In plain language, a seam is the place where callers interact with a module without knowing its internal implementation. Here, the seam must let a caller begin a Hunt, advance time, submit player decisions, and read back the current Hunt snapshot plus any transient Hunt emissions such as a newly announced telegraph or a phase change.

`CONTEXT.md` defines the domain terms used in this plan. “Hunt Round Loop” means the repeating cadence inside the Dense Jungle encounter: telegraph, planning, submit, resolve, attack QTE, dodge QTE, stagger window when triggered, and handoff back to Cave Bar when the Hunt ends.

## Plan of Work

Start by keeping the new seam small but real. Define `src/logic/HuntRoundLoop.ts` with stable exported types for commands, snapshot state, emissions, and error results. The module should be Phaser-free. The first concrete implementation should support `begin_hunt`, `tick`, and planned-action submission. Use `PositioningSystem` to seed player positions and `DilophosaurusAI` to select the initial telegraph, because those are already pure logic modules.

Do not move the full Hunt at once. In the first milestone, `HuntRoundLoop` should own only the beginning of the cadence: idle to plan, tracking planned actions, and transitioning from plan to submit when either the round timer expires or all eligible hunters have submitted. This is enough to verify that the seam is viable and that the module, not `HuntScene`, can own time and early round state.

Once this seam is stable, the next milestone should route `HuntScene` through `HuntRoundLoop`. The scene should stop owning player health, score, selected actions, telegraph state, and round timers directly. Instead, it should translate `InputManager` output into Hunt commands and render from the returned snapshot and emissions. Only after that adapter path is working should later milestones move resolve, attack QTE, dodge QTE, stagger, scoring, and Cave Bar handoff behind the seam.

## Concrete Steps

All commands should be run from `/Users/ben/git/private/cave-bar-hunter`.

Create or update the domain glossary and the Hunt Round Loop module:

    apply_patch ... CONTEXT.md
    apply_patch ... src/logic/HuntRoundLoop.ts

Create the living ExecPlan:

    apply_patch ... docs/plans/2026-05-02-hunt-round-loop-extraction-execplan.md

Run the focused tests for the new seam:

    ./node_modules/.bin/vitest run tests/logic/HuntRoundLoop.test.ts

Run TypeScript validation for source files:

    ./node_modules/.bin/tsc --noEmit

Expected proof from the focused test command is a passing suite that mentions `tests/logic/HuntRoundLoop.test.ts`. Expected proof from TypeScript is a clean exit with no diagnostics.

## Validation and Acceptance

The first milestone is acceptable when a pure logic test can instantiate `HuntRoundLoop`, begin a Hunt, receive an initial telegraph, inspect a plan-phase snapshot, submit planned actions, and observe the plan phase close without touching Phaser. A contributor should be able to run `./node_modules/.bin/vitest run tests/logic/HuntRoundLoop.test.ts` and see all tests pass.

The broader extraction will be acceptable later when `npm run dev` still opens a playable Dense Jungle Hunt, but `src/scenes/HuntScene.ts` is visibly thinner and most Hunt cadence state has moved into `src/logic/HuntRoundLoop.ts`. That browser proof is intentionally deferred until later milestones.

## Idempotence and Recovery

This plan is additive. Re-running the focused tests is safe. If a later extraction step breaks the scene adapter, keep `HuntRoundLoop` tests green and temporarily leave the scene on the old path while expanding the seam. Because the first milestone adds a new module instead of mutating the whole Hunt, rollback is as simple as removing or ignoring the new seam until the adapter migration begins.

## Artifacts and Notes

The first milestone introduces these key files:

    CONTEXT.md
    docs/plans/2026-05-02-hunt-round-loop-extraction-execplan.md
    src/logic/HuntRoundLoop.ts
    tests/logic/HuntRoundLoop.test.ts

The intended user-facing proof for this milestone is not a visual browser change. It is a pure logic proof that the Hunt round loop can begin outside Phaser and produce a domain snapshot the scene can eventually render.

## Interfaces and Dependencies

In `src/logic/HuntRoundLoop.ts`, define a stable factory and a stable module interface equivalent to:

    export function createHuntRoundLoop(options?: HuntRoundLoopOptions): HuntRoundLoop;

    export interface HuntRoundLoop {
        advance(command: HuntCommand): HuntUpdate;
        getSnapshot(): HuntSnapshot;
    }

The interface must export:

    HuntCommand
    HuntEmission
    HuntError
    HuntLoopPlayerState
    HuntPhase
    HuntSnapshot
    HuntUpdate

The implementation for the first milestone must depend on:

    src/logic/PositioningSystem.ts
    src/logic/dino/DilophosaurusAI.ts
    src/logic/SessionManager.ts for the persisted player-state type only

It must not depend on:

    Phaser
    src/scenes/HuntScene.ts
    src/ui/HUD.ts
    src/core/EventBus.ts at the public seam

Revision note: Created this ExecPlan alongside the initial `HuntRoundLoop` scaffold so future work can continue from a checked-in seam instead of a chat-only design.
