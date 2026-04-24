# Coordinate Parallel Delivery Of The Game Code Spike

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with `.agents/PLANS.md`.

## Purpose / Big Picture

After this work, four parallel contributors can implement the playable game-code spike without colliding on architecture, file ownership, or sequencing. The outcome is not only new code; it is a coordinated delivery plan that makes it realistic to land a playable vertical slice with a full round loop, one dinosaur, one arena, keyboard plus gamepad input, and a minimal cave bar handoff.

The user-visible proof comes at the end of the combined work: from the repository root, running `npm test` and `npm run dev` should allow a human to start the game, enter the hunt, choose actions for up to four players, resolve a Dilophosaurus telegraph and dodge sequence, and return through the minimal cave bar flow. This coordinating ExecPlan exists to make the four track plans converge on that observable result.

## Progress

- [x] (2026-04-24 10:55Z) Reviewed `.agents/PLANS.md`, the spike specification in `docs/superpowers/specs/2026-04-23-game-code-spike-design.md`, the current repository layout, and the open beads issues that define the four parallel tracks.
- [x] (2026-04-24 11:05Z) Confirmed that `src/core/types.ts`, `src/core/events.ts`, and `src/core/EventBus.ts` already exist and can act as the shared contract for all parallel work.
- [x] (2026-04-24 11:12Z) Wrote this coordinating ExecPlan and four per-track ExecPlans under `docs/plans/`.
- [x] (2026-04-24 12:39Z) Created four dedicated worktrees in `/tmp` on branches `codex-spike-track-a-logic`, `codex-spike-track-b-dino`, `codex-spike-track-c-scenes`, and `codex-spike-track-d-hud-input`.
- [x] (2026-04-24 12:42Z) Assigned one worker to each worktree with explicit ownership boundaries and instructions to recreate and maintain the matching track ExecPlan inside that worktree.
- [x] (2026-04-24 13:15Z) Completed Track A, Track B, Track C, and Track D in parallel worktrees with per-track validation before integration.
- [x] (2026-04-24 13:20Z) Integrated the track outputs into the main workspace and resolved cross-track TypeScript mismatches in the scene asset loader and HUD event wiring.
- [x] (2026-04-24 13:21Z) Verified the integrated spike with `./node_modules/.bin/tsc --noEmit`, `./node_modules/.bin/vitest run tests/logic tests/input tests/ui`, and `npm run build`.
- [ ] Capture the remaining broad-suite failures from legacy tests that still import missing pre-spike modules, and decide whether to retire, port, or restore those modules in a follow-up slice.

## Surprises & Discoveries

- Observation: The repository currently contains only the shared typed event bus and no spike-specific scene or system implementation files yet.
  Evidence: `find src -maxdepth 4 -type f | sort` returned only `src/core/EventBus.ts`, `src/core/events.ts`, `src/core/types.ts`, and `src/index.ts`.

- Observation: Several existing tests reference modules such as `src/systems/InputManager.js` and `src/systems/SessionManager.js` that are not present in the working tree.
  Evidence: `tests/InputManager.test.js` imports `../src/systems/InputManager.js` and `tests/SessionManager.test.js` imports `../src/systems/SessionManager.js`, while `find src -maxdepth 4 -type f` shows no `src/systems/` directory.

- Observation: `bd` reports stale data warnings, so workers should not mutate bead metadata casually while code is in flight.
  Evidence: `bd ready --allow-stale --no-auto-import --no-daemon` prints `Staleness check skipped` and recommends `bd sync`.

- Observation: New worktrees start from the current committed `HEAD`, not from the uncommitted planning files in the main workspace.
  Evidence: The worktrees were created at commit `fbd2436`, so the workers had to be instructed to recreate their track ExecPlan inside the worktree before implementing code.

- Observation: The integrated spike code passes TypeScript, focused spike tests, and the production build, but the repository-wide `npm test -- --run` command still fails because several older tests import modules such as `src/systems/CameraController.js`, `src/systems/CombatSystem.js`, and `src/entities/Player.js` that do not exist in this repository snapshot.
  Evidence: The broad test run reported 9 failed suites caused by Vite import-resolution errors for those legacy module paths, while the new spike-focused suites completed with 38 passing tests.

## Decision Log

- Decision: Use one coordinating ExecPlan plus four short per-track ExecPlans instead of a single giant implementation document.
  Rationale: The spike is shared at the architecture level, but the work naturally decomposes into four mostly independent tracks with different validation commands and file ownership. Separate track plans reduce ambiguity for parallel workers while this plan preserves the integration story.
  Date/Author: 2026-04-24 / Codex

- Decision: Treat `src/core/types.ts`, `src/core/events.ts`, and `src/core/EventBus.ts` as frozen shared contracts during the first wave of parallel implementation.
  Rationale: These files are the only common substrate already present. Rewriting them in multiple tracks would create unnecessary merge conflicts. Any contract change discovered later must be made deliberately during integration, not ad hoc by a single track worker.
  Date/Author: 2026-04-24 / Codex

- Decision: Use file ownership boundaries rather than issue boundaries as the primary anti-conflict rule.
  Rationale: Some beads issues are conceptually separate but would otherwise tempt contributors to edit the same glue files. Explicit write boundaries are easier to enforce in parallel worktrees.
  Date/Author: 2026-04-24 / Codex

- Decision: Defer the cross-track integration issue `cave-bar-hunter-do6` until the four track slices exist and pass their own tests.
  Rationale: Integration is the convergence step. Starting it before the track contracts stabilize would create rework and muddy ownership.
  Date/Author: 2026-04-24 / Codex

- Decision: Create the parallel worktrees in `/tmp` rather than as sibling directories under the repository parent.
  Rationale: `/tmp` is already writable in this environment, which avoided extra filesystem friction while still giving each worker an isolated checkout.
  Date/Author: 2026-04-24 / Codex

- Decision: Integrate the worker outputs by copying their files into the main workspace and then fixing the small compile-time contract mismatches locally instead of trying to merge partially committed worktree branches directly.
  Rationale: Only Track A had a finished commit; Tracks B, C, and D were still uncommitted in their worktrees. Direct branch merges would not have captured those changes cleanly, while file-level integration preserved the worker outputs and made the cross-track fixes explicit.
  Date/Author: 2026-04-24 / Codex

## Outcomes & Retrospective

The coordination plan achieved its main goal. Track A, Track B, Track C, and Track D were delivered in parallel worktrees and then integrated into the main workspace. The integrated result now includes the Phaser bootstrap and scene shell, dense-jungle arena rendering, typed logic systems, dino combat rules, and HUD plus input modules. TypeScript compilation passes, the focused spike suites pass, and the production build succeeds.

The main remaining gap is not in the new spike code itself. The repository still contains older tests that reference missing historical modules outside this spike slice, so the broad `npm test -- --run` command is not yet fully green. A follow-up slice should decide whether to delete, port, or restore those legacy test targets so the full suite becomes meaningful again.

## Context and Orientation

This repository is a Phaser and TypeScript game prototype. `package.json` defines the main commands: `npm run dev` starts the Vite development server, `npm test` runs Vitest, and `npm run build` verifies the production bundle. The current root entry point is `src/index.ts`, which is effectively empty. The only spike-specific code already present lives in `src/core/`: `types.ts` defines shared gameplay data shapes such as `Position`, `PlayerAction`, `AttackDeclaration`, and `RoundResult`; `events.ts` defines typed event names and payloads; `EventBus.ts` implements a typed pub/sub helper.

The spike design lives in `docs/superpowers/specs/2026-04-23-game-code-spike-design.md`. It defines four implementation tracks. Track A is core round logic with no Phaser dependency. Track B is dinosaur-specific combat rules. Track C is scene bootstrapping and arena rendering. Track D is input and HUD behavior. A “track” in this repository means a deliberately isolated slice of work that can be built and tested mostly independently before final integration.

The beads issues map cleanly onto those tracks. The ready-now items are `cave-bar-hunter-9bu`, `cave-bar-hunter-mxs`, `cave-bar-hunter-5md`, `cave-bar-hunter-beu`, and `cave-bar-hunter-m3b` for Track A; `cave-bar-hunter-5a3` for Track B; `cave-bar-hunter-2t0` for Track C; and `cave-bar-hunter-4zn` plus `cave-bar-hunter-0py` for Track D. Follow-on tasks unlock after those first-wave items land. The integration issue `cave-bar-hunter-do6` depends on almost all of them and should not begin until the track contracts are in place.

This coordination plan assumes four separate git worktrees, each based on the same starting commit and each responsible for a disjoint write set. A “worktree” is a second checkout of the same git repository into another directory, which allows workers to edit in parallel without touching each other’s files locally.

## Plan of Work

Begin by creating four worktrees rooted alongside the main repository, one per track. Name the branches with the required `codex/` prefix so they are easy to identify, for example `codex/spike-track-a-logic`, `codex/spike-track-b-dino`, `codex/spike-track-c-scenes`, and `codex/spike-track-d-hud-input`. Each worker must receive this coordinating ExecPlan plus the one track plan that matches its assignment.

Track A owns new files under `src/logic/` or `src/systems/logic/` and corresponding tests under `tests/logic/` or track-specific test files. Track A may add narrow exports to `src/index.ts` only if needed for test or runtime wiring, but it must not edit scene or HUD files. Track B owns dinosaur combat files under `src/logic/dino/` or an equivalent narrow folder and the tests that prove Dilophosaurus behavior. Track C owns Phaser bootstrap and scene files under `src/scenes/`, renderer files under `src/rendering/` or `src/scenes/renderers/`, and the runtime composition in `src/index.ts`. Track D owns input and HUD files under `src/input/`, `src/ui/`, or similarly named folders plus tests for those modules. No track may edit another track’s folder unless this coordinating plan is revised first.

The merge order matters. First merge Track A, because it defines the concrete logic APIs that the other tracks consume. Second merge Track B, because it extends the logic layer and depends on Track A contracts. Third merge Track D, because its input and HUD layer can now target stable logic events and scene expectations. Fourth merge Track C, because it is the main composition layer and will need the least guesswork if the logic and HUD pieces already exist. After those four merges, perform the explicit integration slice described by `cave-bar-hunter-do6`: wire the real systems into `HuntScene`, replace stubs, and verify the playable loop.

Workers must update their own track plan every time they discover a contract change, a hidden dependency, or a validation problem. Any change to shared contracts in `src/core/` must also be recorded here in this coordinating plan before it is merged.

## Concrete Steps

From the repository root `/Users/ben/git/private/cave-bar-hunter`, create the worktrees. The exact sibling directory names can vary, but keep them obvious:

    git worktree add ../cave-bar-hunter-track-a -b codex/spike-track-a-logic
    git worktree add ../cave-bar-hunter-track-b -b codex/spike-track-b-dino
    git worktree add ../cave-bar-hunter-track-c -b codex/spike-track-c-scenes
    git worktree add ../cave-bar-hunter-track-d -b codex/spike-track-d-hud-input

After each worktree is created, verify it opens on the intended branch:

    cd /Users/ben/git/private/cave-bar-hunter-track-a && git status --short --branch

The expected transcript starts with a branch line like:

    ## codex/spike-track-a-logic

Hand each worker the repository path for its worktree and the absolute path to its track plan. Instruct every worker that they are not alone in the codebase, they must not revert edits made by others, and they should keep their write set confined to the files named in their plan.

When a track finishes, run its validation commands inside its own worktree before merging. Then update this plan’s `Progress`, `Decision Log`, and `Outcomes & Retrospective` sections with what changed and any contract adjustments.

## Validation and Acceptance

The coordination work is acceptable when all four track plans exist, all four worktrees exist on distinct branches, and each worker has a disjoint ownership boundary. The full spike is acceptable only after all track branches have been merged or cherry-picked into a single integration branch and the following proof succeeds from the integrated repository root:

    npm test
    npm run build
    npm run dev

Acceptance is behavioral. A human should be able to open the local Vite URL, enter a hunt, see the Dense Jungle arena and player panels, submit actions, observe a Dilophosaurus telegraph, play through a dodge QTE, trigger score and health updates, and transition through the minimal cave bar ready-up flow. If any of those steps requires placeholder wiring, the integration issue is not complete yet.

## Idempotence and Recovery

Creating a git worktree is safe to retry if the target directory does not already exist. If a worktree creation command fails because the directory already exists, inspect it rather than deleting it blindly. If a worker discovers that their track truly needs a file owned by another track, stop, record the conflict in the track plan and this coordinating plan, and either split the file further or defer the contested edit to the integration phase.

The main recovery rule is to preserve work. Do not use destructive git commands such as `git reset --hard` or deleting worktrees while another track may still depend on them. If a branch diverges badly, create a fresh worktree from the latest integration commit and replay only the intentional patches.

## Artifacts and Notes

The current repository shape that informed this coordination plan:

    find src -maxdepth 4 -type f | sort
    src/core/.gitkeep
    src/core/EventBus.ts
    src/core/events.ts
    src/core/types.ts
    src/index.ts

The current primary commands:

    npm run dev
    npm test
    npm run build

The current beads signal:

    bd ready --allow-stale --no-auto-import --no-daemon
    Ready work includes Track A logic tasks, Track B weak-point task, Track C boot/preload, and Track D input plus HUD.

## Interfaces and Dependencies

The shared contract starts in `src/core/types.ts`, `src/core/events.ts`, and `src/core/EventBus.ts`. Until the integration phase, those files are read-mostly shared dependencies. The concrete runtime layers to create are:

In Track A, define stable logic interfaces that Phaser-free code can use, such as a round state machine class, a positioning system class, a stagger system class, a scoring system class, a session manager class, and later an action resolver class. They should consume and emit the shared `src/core/` types rather than inventing private duplicates.

In Track B, define a weak-point and attack-zone module plus a Dilophosaurus AI module that also consume the shared `src/core/` types and the Track A contracts.

In Track C, define Phaser scene classes and renderer helpers that depend on the event bus and on the public APIs of Tracks A and B, not on their private internal state.

In Track D, define an input manager that turns keyboard and gamepad input into logical player actions and a HUD layer that reacts to event bus messages such as `RoundPhaseChanged`, `DinoTelegraph`, `PlayerDamaged`, `PointsEarned`, and `QTEStart`.

Revision note: Created the initial coordination ExecPlan to govern four parallel spike tracks, establish file ownership, and define the merge order before spinning up worktrees.
