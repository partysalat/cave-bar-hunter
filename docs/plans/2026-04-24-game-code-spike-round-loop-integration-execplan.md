# Wire The Game Code Spike Into A Playable Round Loop

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with `.agents/PLANS.md`. It builds on the current repository state after the Track A, B, C, and D slices were integrated, and it is the concrete implementation plan for the remaining integration task represented by `cave-bar-hunter-do6`.

## Purpose / Big Picture

After this work, the spike stops being a visual shell and becomes a playable round-based prototype. A human can start the game, enter the Dense Jungle hunt, choose actions for the hunters, watch the phase change from plan to submit to resolve, see the Dilophosaurus telegraph and target players, play through the dodge quick-time event, return to planning, and move through the cave bar round-trip with player health and score preserved.

The proof is directly observable. From the repository root, run `npm run dev`, open the Vite URL, and play through one full round: choose at least one action, let the round submit, see the resolve results, survive or fail the dodge QTE, then return to the plan phase. Then move from the hunt to the cave bar and back, verifying that the session state comes with you.

## Progress

- [x] (2026-04-24 13:35Z) Reviewed the current integrated repository state and confirmed the gap: scenes are visual stubs, the logic modules exist, `ActionResolver` does not exist yet, and `HuntScene` is not wired to `EventBus`, `InputManager`, `HUD`, or the round systems.
- [x] (2026-04-24 13:37Z) Wrote this integration ExecPlan for the playable round-loop slice.
- [x] (2026-04-24 13:39Z) Implemented `src/logic/ActionResolver.ts` and `tests/logic/ActionResolver.test.ts` to resolve deterministic round outcomes in a Phaser-free way.
- [x] (2026-04-24 13:39Z) Reworked `src/scenes/HuntScene.ts` to own `EventBus`, the round systems, input polling, telegraph generation, resolve flow, QTE flow, score/health updates, and cave bar handoff.
- [x] (2026-04-24 13:39Z) Updated `src/scenes/CaveBarScene.ts` to carry `SessionManager` state through the hunt -> cave bar -> hunt round-trip and show a simple player-state summary.
- [x] (2026-04-24 13:39Z) Added focused coverage and validation with `./node_modules/.bin/vitest run tests/logic/ActionResolver.test.ts tests/logic tests/input tests/ui`, `./node_modules/.bin/tsc --noEmit`, and `npm run build`.
- [ ] Validate the browser flow manually and update this plan with the exact result.

## Surprises & Discoveries

- Observation: The current `HuntScene` only renders art, tweened sprites, and a `C` shortcut to the cave bar. It does not instantiate `EventBus`, `HUD`, `InputManager`, or any of the logic systems.
  Evidence: `src/scenes/HuntScene.ts` currently creates the arena and sprites, shows text labels, and binds `keydown-C`, but does not import any logic or UI classes besides `ArenaRenderer`.

- Observation: `RoundStateMachine`, `PositioningSystem`, `StaggerSystem`, `ScoringSystem`, `SessionManager`, `DilophosaurusAI`, and `AttackZoneResolver` already exist and pass their focused tests, so the main missing behavior is orchestration plus a round resolver.
  Evidence: These modules exist under `src/logic/` and `src/logic/dino/`, and the focused suites under `tests/logic/` and `tests/logic/dino/` are green.

- Observation: `InputManager` currently produces logical input snapshots but does not yet emit `PlayerActionSelected` or QTE events on its own.
  Evidence: `src/input/InputManager.ts` exposes `update()`, `getPlayerInput()`, and `getPlayerInputWithKeyboard()`, but it does not depend on `EventBus` or `RoundStateMachine`.

- Observation: `HUD` is already event-driven and expects the shared `EVENTS` messages, which is good for integration, but it currently has no scene wiring.
  Evidence: `src/ui/HUD.ts` subscribes to `DinoTelegraph`, `RoundPhaseChanged`, `PlayerActionSelected`, `PlayerDamaged`, `QTEStart`, `QTEResult`, and `PointsEarned`.

- Observation: The first playable loop does not require refactoring `InputManager` into an event emitter. Polling `InputManager.update()` plus rising-edge detection inside `HuntScene` is sufficient to drive plan selection and QTE confirmation.
  Evidence: The implemented `HuntScene` uses `previousInputs` and per-frame polling to detect left/right selection, confirm presses, and QTE jumps while `InputManager` keeps its existing test-backed API.

- Observation: `RoundStateMachine.start()` needed to emit an initial `plan` phase event and clear stale actions when re-entering `plan`, otherwise HUD initialization and subsequent rounds would carry old selections.
  Evidence: `src/logic/RoundStateMachine.ts` now forces an initial `RoundPhaseChanged` emit on `start()` and clears its internal action map whenever the machine enters `plan`.

## Decision Log

- Decision: Add `ActionResolver` as part of this integration slice instead of treating it as a separate prerequisite.
  Rationale: The unresolved gameplay gap is not merely scene wiring. Without a resolver that turns planned actions into damage, weak-point hits, and player outcomes, there is no meaningful round loop to integrate.
  Date/Author: 2026-04-24 / Codex

- Decision: Keep the first integrated round-loop implementation deterministic and minimal rather than adding full combat depth immediately.
  Rationale: The goal of the spike is to validate the round cadence and scene flow. Deterministic ordering and fixed damage values are easier to debug and prove in both tests and browser playthroughs.
  Date/Author: 2026-04-24 / Codex

- Decision: Use a lightweight hunt orchestration layer inside `HuntScene` before extracting a larger coordinator class.
  Rationale: The repository currently has no gameplay composition class. A small amount of orchestration inside `HuntScene` is the shortest path to a working loop, and a later refactor can extract it if the spike proves out.
  Date/Author: 2026-04-24 / Codex

- Decision: Allow players without live input to fall back to deterministic default actions instead of blocking the round on four simultaneous confirmations.
  Rationale: The spike must be testable and playable in a single browser session. Waiting for four real controllers would make the prototype hard to validate.
  Date/Author: 2026-04-24 / Codex

- Decision: Model the first stagger behavior as a “bonus damage next round” scene flag rather than a fully separate interactable `stagger_window` mode.
  Rationale: This preserves the spirit of the spike without forcing a larger state-machine redesign inside the same slice.
  Date/Author: 2026-04-24 / Codex

## Outcomes & Retrospective

The code portion of this plan is now implemented. The repository has a real `ActionResolver`, `HuntScene` owns a playable round loop with event-driven HUD updates and QTE handling, and `CaveBarScene` preserves session state through the cave bar round-trip. Focused logic and UI tests pass, TypeScript passes, and the production build succeeds.

The main remaining unchecked item is manual browser validation. The largest long-term risk is that `HuntScene` now contains a lot of orchestration logic. If the browser pass confirms the loop works well enough, the next cleanup step should be to extract a helper such as `HuntRoundController` without changing behavior.

## Context and Orientation

This repository is a Phaser 3 plus TypeScript game prototype. The entry point `src/index.ts` starts `BootScene`, `PreloadScene`, `HuntScene`, and `CaveBarScene`. `src/scenes/PreloadScene.ts` loads SpriteCook assets from `assets/spritecook/manifest.json`. `src/rendering/ArenaRenderer.ts` renders the Dense Jungle scene art. `src/scenes/HuntScene.ts` and `src/scenes/CaveBarScene.ts` currently show art and simple scene transitions, but not gameplay.

The core gameplay contracts live in `src/core/types.ts`, `src/core/events.ts`, and `src/core/EventBus.ts`. A “typed event bus” here means the pub/sub helper in `src/core/EventBus.ts` that only accepts payloads matching the event names in `src/core/events.ts`. The logic layer already provides `RoundStateMachine`, `PositioningSystem`, `StaggerSystem`, `ScoringSystem`, and `SessionManager` in `src/logic/`, plus `AttackZoneResolver` and `DilophosaurusAI` in `src/logic/dino/`.

The still-missing piece is the code that translates player choices into `RoundResult`, applies dinosaur telegraphs to the current positions, starts QTE windows, and updates the scene state over time. The beads issue for this integration slice describes the target clearly: swap stubs for real systems, connect `InputManager` to the round state machine, perform an end-to-end round smoke test in the browser, and verify the cave bar round-trip.

## Plan of Work

Begin by adding `src/logic/ActionResolver.ts` and a dedicated test file such as `tests/logic/ActionResolver.test.ts`. `ActionResolver` must be Phaser-free. It should accept the currently planned player actions, player positions from `PositioningSystem`, the dinosaur telegraph from `DilophosaurusAI`, and any weak-point targeting information. It should resolve the round in a fixed order: reposition first, brace second, attack and aimed strike third, revive last. It should return a shared `RoundResult` and enough side information for the scene to award score, apply weak-point damage, and determine who enters QTE danger.

Then update `src/scenes/HuntScene.ts` so it owns the runtime composition. Instantiate one `EventBus`, one `RoundStateMachine`, one `PositioningSystem`, one `StaggerSystem`, one `ScoringSystem`, one `SessionManager` load snapshot, one `DilophosaurusAI`, one `AttackZoneResolver`, one `ActionResolver`, one `InputManager`, and one `HUD`. Add a local in-scene state model for active player records. Each player record should at least contain `playerId`, `health`, `score`, `plannedAction`, `position`, and whether the player is downed.

During scene start, load any saved player state from `SessionManager`. If the session is empty, initialize a default four-player roster with full health and zero score. Immediately compute the first dinosaur telegraph using current player positions, emit `DinoTelegraph`, and call `RoundStateMachine.start()`.

Add a per-frame or timed update path in `HuntScene` that polls `InputManager.update()`. During the `plan` phase, use the logical input snapshots to drive a minimal action selection model. Keep the first version simple and deterministic: for example, directional input cycles through a fixed action list per player, `jumpPressed` confirms the current choice, and the choice is stored locally before being submitted to `RoundStateMachine.submitAction()`. Emit `PlayerActionSelected` through the bus when a choice is finalized. The first version does not need a polished menu renderer because the HUD already has text fields for the selected action.

When the round state reaches `submit`, let the timer roll into `resolve`, or call `beginResolve()` explicitly after a short delay. On `resolve`, call `ActionResolver`, emit `RoundResolved`, apply `StaggerSystem` and `ScoringSystem` updates, emit `PlayerDamaged`, `PlayerDowned`, and `DinoHealthChanged` as needed, and decide whether the next state is `stagger_window` or `dodge_qte`. If the dinosaur is not staggered, use `AttackZoneResolver.getAffectedPlayers()` with the stored telegraph and current positions, emit `QTEStart`, and move into `dodge_qte`.

During `dodge_qte`, interpret `InputManager` snapshots differently. `jumpPressed` should count as a dodge input for the affected players. The simplest first implementation is acceptable: affected players who press within the QTE window succeed, and unaffected players remain marked safe. Emit `QTEResult`, apply any remaining damage for failures, and then transition back to `plan`. At the start of the next plan phase, compute the next dinosaur telegraph and repeat.

Finally, connect the cave bar loop. When the dinosaur is defeated or when a debug shortcut is pressed, save player state through `SessionManager` and start `CaveBarScene` with any required scene data. Update `src/scenes/CaveBarScene.ts` so it can accept the shared `SessionManager` or a serialized player snapshot from scene data and pass that state back when returning to `HuntScene`. The cave bar can remain visually simple, but the round-trip must preserve health and score.

## Concrete Steps

From the repository root `/Users/ben/git/private/cave-bar-hunter`, implement the slice in this order:

    1. Create `src/logic/ActionResolver.ts`.
    2. Create `tests/logic/ActionResolver.test.ts`.
    3. Update `src/scenes/HuntScene.ts` to instantiate and wire the systems.
    4. Update `src/scenes/CaveBarScene.ts` to pass session data back and forth.
    5. If `InputManager` needs a tiny adapter method for scene integration, add it in `src/input/InputManager.ts` without changing its existing test-backed semantics.
    6. If `HUD` or `PlayerPanel` need small helper methods to display position or health more clearly, add them in `src/ui/HUD.ts` and `src/ui/PlayerPanel.ts`.

During development, run these focused commands after each milestone:

    ./node_modules/.bin/vitest run tests/logic/ActionResolver.test.ts
    ./node_modules/.bin/vitest run tests/logic tests/input tests/ui
    ./node_modules/.bin/tsc --noEmit
    npm run build

For the manual spike proof, run:

    npm run dev

Then open the local Vite URL and verify the round flow in the browser.

## Validation and Acceptance

This slice is acceptable when the following behaviors are all true.

First, the pure logic proof: `ActionResolver` has focused tests that prove the fixed action order, reposition validation, brace mitigation, aimed strike weak-point handling, and revive behavior.

Second, the integrated code proof: `./node_modules/.bin/vitest run tests/logic tests/input tests/ui` passes, `./node_modules/.bin/tsc --noEmit` passes, and `npm run build` passes.

Third, the browser proof: after running `npm run dev`, a human can start the game, reach `HuntScene`, see the telegraph prompt and phase changes, confirm at least one player action, let the round move through `plan -> submit -> resolve -> dodge_qte -> plan`, and observe visible changes in HUD text such as selected actions, health, points, and QTE prompts. The exact visual presentation may still be rough, but the loop must be real rather than implied.

Fourth, the cave bar proof: from the hunt, enter `CaveBarScene`, then return to the hunt and confirm that the player score and health snapshot survive the transition.

## Idempotence and Recovery

The new logic files and scene wiring changes should be additive. If the first implementation of `ActionResolver` or the in-scene orchestration proves awkward, keep the tests and extract helpers rather than rewriting the event contracts. Avoid changing `src/core/types.ts`, `src/core/events.ts`, or `src/core/EventBus.ts` unless there is a specific missing payload that cannot be modeled with the current contracts.

If the browser flow breaks mid-implementation, keep the pure logic tests green and use a temporary debug path in `HuntScene` to drive one phase at a time. For example, it is acceptable to add a temporary keyboard shortcut to advance the state machine while the full action menu is under construction, as long as that shortcut is documented in this plan and removed or deliberately retained by the end.

## Artifacts and Notes

The key files already in place for this slice are:

    src/logic/RoundStateMachine.ts
    src/logic/PositioningSystem.ts
    src/logic/StaggerSystem.ts
    src/logic/ScoringSystem.ts
    src/logic/SessionManager.ts
    src/logic/dino/AttackZoneResolver.ts
    src/logic/dino/DilophosaurusAI.ts
    src/input/InputManager.ts
    src/ui/HUD.ts
    src/ui/PlayerPanel.ts
    src/ui/QtePrompt.ts
    src/scenes/HuntScene.ts
    src/scenes/CaveBarScene.ts

The missing core file this plan explicitly introduces is:

    src/logic/ActionResolver.ts

The target beads issue that this plan fulfills is:

    cave-bar-hunter-do6 Integration: wire logic into scenes

## Interfaces and Dependencies

At the end of this slice, the repository should contain a public `ActionResolver` with a concrete API equivalent to:

    class ActionResolver {
      resolveRound(input: {
        playerActions: Partial<Record<PlayerId, PlayerAction>>;
        positioningSystem: PositioningSystem;
        attackDeclaration: AttackDeclaration;
        playerState: Record<PlayerId, { health: number; downed: boolean }>;
        weakPointThresholds?: Record<'head' | 'legs', number>;
        staggerActive?: boolean;
      }): RoundResult
    }

The exact function signature may vary, but it must return the shared `RoundResult` shape from `src/core/types.ts` and it must stay independent of Phaser.

`HuntScene` must instantiate and retain:

    EventBus
    RoundStateMachine
    PositioningSystem
    ActionResolver
    StaggerSystem
    ScoringSystem
    SessionManager
    DilophosaurusAI
    AttackZoneResolver
    InputManager
    HUD

`HuntScene` must emit these shared events during the loop:

    DinoTelegraph
    RoundPhaseChanged
    PlayerActionSelected
    RoundResolved
    PlayerDamaged
    PlayerDowned
    DINO_HEALTH_CHANGED
    QTEStart
    QTEResult
    PointsEarned

`CaveBarScene` must accept scene data that includes either a `SessionManager` instance or a serialized player snapshot and must hand that state back to `HuntScene` on return.

Revision note: Created this ExecPlan to cover the missing integration slice between the already-implemented logic/UI modules and the currently stubbed scenes, with explicit inclusion of the missing `ActionResolver`.

Revision note: Updated this ExecPlan after implementing the code portion of the slice. Manual browser validation is still outstanding.
