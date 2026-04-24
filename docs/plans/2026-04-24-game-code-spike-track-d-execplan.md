# Track D ExecPlan: Player Input, HUD, and QTE Callouts

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This file must be maintained in accordance with `/.agents/PLANS.md` from the repository root.

## Purpose / Big Picture

Track D makes the round readable and actionable from the player’s point of view. After this change, a player should be able to connect a keyboard or gamepad, choose logical actions such as moving, attacking, bracing, or interacting, and see the HUD explain what is happening during the round. The HUD should surface player status, phase changes, telegraphed dinosaur attacks, QTE prompts, and points so the game feels understandable instead of opaque.

The observable result is not a new combat system or new dinosaur logic. Instead, the user-facing input layer and heads-up display become the bridge between shared game events and player decisions. A focused test suite should prove that keyboard fallback, first-available gamepad assignment, HUD state updates, and QTE/telegraph messaging all work without depending on unrelated scene bootstrap or core rules.

## Progress

- [x] (2026-04-24 00:00Z) Recreated the Track D ExecPlan in the assigned worktree and scoped it to input and HUD ownership only.
- [x] (2026-04-24 13:09Z) Built `src/input/InputManager.ts` around logical actions, with keyboard fallback for player 0 and first-available gamepad registration.
- [x] (2026-04-24 13:09Z) Added `src/ui/HUD.ts`, `src/ui/PlayerPanel.ts`, and `src/ui/QtePrompt.ts` as the base HUD surface for player phase, health, action, position, points, telegraph, and QTE labels.
- [x] (2026-04-24 13:09Z) Moved and expanded focused tests under `tests/input/` and `tests/ui/` to cover the new behavior and preserve the old fallback expectations.
- [x] (2026-04-24 13:09Z) Ran focused Track D tests and confirmed they pass.

## Surprises & Discoveries

- Observation: The current repository only contains the core event definitions, a minimal `EventBus`, and an old `tests/InputManager.test.js` file that still imports `src/systems/InputManager.js`.
  Evidence: `src/` currently has `core/EventBus.ts`, `core/events.ts`, `core/types.ts`, and `index.ts`; the old test checks keyboard fallback and gamepad registration but points at the legacy path.

- Observation: Vitest would not resolve `.js` specifiers in the new Track D tests because the source files only exist as `.ts` in this worktree.
  Evidence: The first focused test run failed with “Failed to load url ../../src/input/InputManager.js” until the new tests imported the actual `.ts` files.

## Decision Log

- Decision: Keep Track D strictly limited to the player input and HUD surface area, and do not reach into scene bootstrap, combat resolution, or dinosaur behavior.
  Rationale: The spike is split across workers, and the contract explicitly assigns this worktree only input/HUD ownership so it can stay merge-safe.
  Date/Author: 2026-04-24 / Codex

- Decision: Model input in terms of logical player actions rather than raw key or button state.
  Rationale: The rest of the game already speaks in terms of actions and event data, so a logical-action interface keeps the input layer stable even if button mappings change.
  Date/Author: 2026-04-24 / Codex

- Decision: Use the shared `EVENTS` constants from `src/core/events.ts` for all HUD subscriptions.
  Rationale: Shared event names avoid string drift and keep the HUD aligned with the rest of the game’s event bus contract.
  Date/Author: 2026-04-24 / Codex

- Decision: Keep the Track D tests importing the actual `.ts` source files instead of `.js` aliases in this worktree.
  Rationale: There are no built `.js` siblings in the repository, so the real file extensions are the most reliable way to keep the focused tests runnable.
  Date/Author: 2026-04-24 / Codex

## Outcomes & Retrospective

Track D now has a narrow but complete player-facing slice. Input is expressed as logical actions, the HUD can explain the round, and the QTE prompt reacts to shared bus events without depending on scene bootstrap or dinosaur logic. The focused test suite passed cleanly, which gives us a stable base for later spike tracks to build on.

## Context and Orientation

The repository is a small TypeScript/Vitest project. The relevant existing files are:

- `src/core/events.ts`, which defines the shared event names and payloads.
- `src/core/EventBus.ts`, which exposes `on`, `off`, `once`, `emit`, and `clear`.
- `src/core/types.ts`, which defines `PlayerId`, `PlayerAction`, `RoundPhase`, `QteType`, and the other domain types that Track D should reflect in UI state.
- `tests/InputManager.test.js`, which documents the current keyboard fallback and first-available gamepad expectations.

Track D should create the player-facing layer in new files under these preferred paths:

- `src/input/InputManager.ts`
- `src/ui/HUD.ts`
- `src/ui/PlayerPanel.ts`
- `src/ui/QtePrompt.ts`

The input manager is the object that listens to Phaser input devices and translates them into a small set of logical actions, such as move left or right, jump, attack, brace, throw, or interact. The HUD is the top-level display object that listens to the shared event bus and forwards state into one or more player panels plus the QTE prompt. A player panel is the per-player HUD strip that shows that player’s phase, health, position, chosen action, and points. The QTE prompt is the part of the HUD that makes quick-time events visible when the dinosaur telegraphs an attack or when a QTE round starts.

## Plan of Work

First, implement `src/input/InputManager.ts` as a self-contained class that can be constructed with a Phaser scene and optional input-mapping options. It should register gamepad connections, keep the first connected pad in the first available player slot, and expose a keyboard fallback for player 0. The public API should stay small: a constructor, an `update()` method that samples current inputs, and a `destroy()` method that removes listeners and releases references. The testable output should be a logical action object rather than raw key state.

Second, add `src/ui/PlayerPanel.ts` and `src/ui/HUD.ts`. `PlayerPanel` should own the text and presentation state for one player, including phase, health, position label, and action label. `HUD` should create and manage a small collection of player panels, subscribe to the bus with the shared `EVENTS` constants, and expose explicit methods such as `setDinoHealth()` and `setActivePlayers()` so tests can drive it directly without needing a full scene.

Third, add `src/ui/QtePrompt.ts` and connect it to `DINO_TELEGRAPH`, `QTE_START`, and `QTE_RESULT`. The prompt should surface the affected players and the qte type, then hide or update itself when the QTE resolves. The telegraph callout should be visible before the QTE begins so the player can see why the prompt appeared.

Fourth, update the tests to prove the behavior in a narrow, track-specific way. Keep the existing keyboard/gamepad expectations, but move them to `tests/input/` or otherwise make them import the new `src/input/InputManager.ts` path. Add HUD tests under `tests/ui/` for event-driven state updates, panel label changes, and QTE prompt visibility. Prefer small unit tests with mocked Phaser scene objects and a real `EventBus` instance so the tests stay fast and deterministic.

Fifth, once the focused tests pass, update this plan with the final file list, the exact test command used, and any surprises that changed the implementation shape.

## Concrete Steps

From `/tmp/cave-bar-hunter-track-d`, perform the work in this order:

1. Create the new source and test files under `src/input/`, `src/ui/`, `tests/input/`, and `tests/ui/`.
2. Run the focused test subset with Vitest, for example:

   `npm test -- --run tests/input tests/ui`

   Expected result: the track-specific tests pass, and any missing import or event-name mismatch fails loudly before the implementation is finished.
3. If the test command needs adjustment for the new file layout, keep the command narrow and document the exact working command here.

## Validation and Acceptance

Acceptance is met when the following can be observed:

- `InputManager` registers the first connected gamepad in the first free slot and still provides keyboard fallback for player 0.
- The HUD reacts to shared `EVENTS` changes instead of hard-coded event strings.
- A player panel can show phase, health, position, action, and points labels after direct method calls or event-bus updates.
- The QTE prompt becomes visible for telegraph/QTE events and updates itself when the result arrives.
- The focused Track D tests pass under Vitest.

The minimum proof should be a test run that exercises the new input and UI classes without booting the full game.

## Idempotence and Recovery

These changes should be safe to iterate on because they are additive and local to Track D. If a test fails after a partial refactor, revert only the last edit in the tracked input or UI file and rerun the focused Vitest command. Avoid touching scene bootstrap or combat code when recovering from failures; the contract for this track does not require it.

## Artifacts and Notes

Expected test transcript shape:

    npm test -- --run tests/input tests/ui

    ... vitest output ...
    ✓ keyboard fallback for player 0
    ✓ first available gamepad registration
    ✓ gamepad logical action mapping
    ✓ HUD updates player panel state
    ✓ QTE prompt reacts to telegraph and result events

## Interfaces and Dependencies

At the end of Track D, the repository should expose these stable names:

- `src/input/InputManager.ts` exporting a default `InputManager` class with `constructor(scene, options?)`, `update()`, and `destroy()`.
- `src/ui/HUD.ts` exporting a default `HUD` class with `constructor(scene, bus)`, `setDinoHealth()`, `setActivePlayers()`, and `destroy()`.
- `src/ui/PlayerPanel.ts` exporting a default `PlayerPanel` class with `setPhase()`, `setHealth()`, `setPositionLabel()`, `setActionLabel()`, and `setPointsLabel()`.
- `src/ui/QtePrompt.ts` exporting a default `QtePrompt` class that reacts to shared `EVENTS` subscriptions.

The implementation should consume `EVENTS` from `src/core/events.ts` and `EventBus` from `src/core/EventBus.ts`. It should not introduce a second event-name source or depend on unrelated systems.

Revision note: this plan was updated after implementation to record the concrete Track D files, the actual Vitest command that passed, and the `.ts` import resolution quirk discovered while validating the new tests.
