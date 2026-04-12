# Prehistoric Hunter Sidescroller Rebuild

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This repository includes [.agents/PLANS.md](/Users/ben/git/private/cave-bar-hunter/.agents/PLANS.md). This document must be maintained in accordance with that file.

## Purpose / Big Picture

Prehistoric Hunter is being rebuilt from scratch as a 2D sidescroller for a dinosaur-themed bar. The old implementation has been cleared out, so the goal is not to patch an inherited codebase but to build a new playable game loop in deliberate slices. After this rebuild, the team should be able to go from a blank repo state to a complete five-hunt bar-ready experience with a clear order of operations, clean scope boundaries, and issue tracking that reflects the actual delivery path.

The most important rule for this rebuild is that every slice must produce something observable. A slice is not “add a manager” or “set up physics abstractions.” A slice ends when a human can run the game and verify new player-facing behavior, even if the art is placeholder and the content is incomplete.

## Progress

- [x] (2026-04-12 20:45Z) Reviewed the canonical sidescroller design at `docs/design/2026-04-12-prehistoric-hunter-sidescroller-game-design.md`.
- [x] (2026-04-12 20:45Z) Confirmed the current repo reset state: `src/` does not exist, so this plan assumes a true rebuild.
- [x] (2026-04-12 20:45Z) Authored this ExecPlan with delivery slices, dependencies, and acceptance criteria.
- [x] (2026-04-12 20:25Z) Created the corresponding beads issue hierarchy under epic `cave-bar-hunter-hep`, with child slices `cave-bar-hunter-hep.1` through `cave-bar-hunter-hep.12`.
- [x] (2026-04-12 20:28Z) Completed Slice 1 by creating a new Phaser app shell, a playable movement sandbox, and baseline movement tests.
- [ ] Start implementation for Slice 2 and keep this document updated as later slices are completed.

## Surprises & Discoveries

- Observation: The current repository does not have a `src/` directory anymore.
  Evidence: `find src -maxdepth 2 -type f` returned `find: src: No such file or directory`.

- Observation: Existing tracked beads data from prior work can still reappear from git-backed state unless the rewritten `.beads/issues.jsonl` is treated as the new source of truth.
  Evidence: `bd list --allow-stale` reported `Found 0 issues in database but 47 in git. Importing...`.

- Observation: Creating new slice issues still works reliably in direct mode when using `--allow-stale --no-auto-import --no-daemon`, and the resulting issues were written to `.beads/issues.jsonl`.
  Evidence: `bd show cave-bar-hunter-hep --allow-stale --no-auto-import --no-daemon` displayed the rebuild epic with all 12 child slices.

- Observation: Vite build succeeds against the new Slice 1 source tree, but the bundled Phaser chunk is large enough to trigger Vite's default chunk-size warning.
  Evidence: `npm run build` completed successfully and reported a warning for `dist/assets/index-*.js` being larger than 500 kB.

## Decision Log

- Decision: Rebuild planning will use vertical slices instead of subsystem-first phases.
  Rationale: The game is for a public venue, so “playable early and often” matters more than perfect architectural layering. Vertical slices reduce integration risk and make playtesting possible sooner.
  Date/Author: 2026-04-12 / Codex

- Decision: The rebuild will target Phaser with its built-in Matter support in a hybrid architecture rather than a pure simulation-first design.
  Rationale: Hazards, lianas, and physical set pieces benefit from Matter, but dodge timing, revives, scoring, telegraphs, and boss pacing need designer-controlled gameplay code.
  Date/Author: 2026-04-12 / Codex

- Decision: The first content-complete milestone will be a single fully playable Tier 1 session loop rather than immediately scaffolding all five hunts.
  Rationale: A narrow but real loop is the fastest way to validate controls, readability, session pacing, upgrade cadence, and venue suitability.
  Date/Author: 2026-04-12 / Codex

## Outcomes & Retrospective

Slice 1 is complete. The repo now has a runnable Phaser application again, centered on a movement sandbox with left-right motion, jump, dodge, platforms, camera follow, and a small test suite aligned with the rebuild. This is a good first checkpoint because it confirms the new architecture can compile and run without inheriting the removed codebase. The next retrospective entry should evaluate whether Slice 2 should stay as one task or be split into “combat input/attacks” and “combat damage/HUD” once implementation begins.

## Context and Orientation

The current repository state is unusually clean: there is no active gameplay source tree under `src/`. That means the first implementation work will need to recreate the application structure, the scene graph, and the baseline systems. This is good news for clarity because there is no ambiguity about whether old code should be preserved.

The canonical design document for the rebuild is `docs/design/2026-04-12-prehistoric-hunter-sidescroller-game-design.md`. That document describes the intended final game. This ExecPlan turns that destination into delivery slices.

The phrase “slice” in this plan means a bounded body of work that:

1. introduces one coherent chunk of player-visible behavior,
2. has a clear dependency story,
3. can be validated independently,
4. leaves the repo in a runnable state.

The phrase “hybrid physics” means that Phaser’s built-in Matter support is used for simulation where motion and contact are the feature, such as hazards, lianas, or large physical set pieces, while custom gameplay logic remains the authority for combat pacing, scoring, revive rules, telegraphs, and encounter scripting.

## Plan of Work

The rebuild should proceed in ordered slices. Each slice below names the intended scope, the repository areas it will likely create or modify, the behavioral goal, and the reason it exists before later slices.

### Slice 1: Bootstrap and Playable Movement Sandbox

Create the new game shell: `src/main.js`, core scene registration, a development-friendly boot scene or direct entry scene, and the first reusable folders for scenes, systems, entities, and UI. This slice also establishes one playable arena sandbox with a caveman character who can move left and right, jump, land on platforms, dodge, and remain fully visible under the camera.

Likely files created in this slice include:

- `src/main.js`
- `src/scenes/MovementSandboxScene.js` or equivalent temporary first scene
- `src/systems/InputManager.js`
- `src/systems/PhysicsManager.js`
- `src/systems/CameraController.js`
- `src/entities/Player.js`
- `tests/` files for the movement and input systems

This slice exists to validate the feel of the sidescroller immediately. If left-right movement, jump arcs, platform interaction, and dodge feel wrong, every later slice will inherit the problem.

### Slice 2: Combat Sandbox

Extend the movement sandbox into a combat sandbox. Add player health, being hit, invincibility windows, spear throwing, melee strikes, a simple target dummy or test dinosaur body, hit detection, damage, and basic HUD display for health and score.

Likely files created or expanded:

- `src/systems/CombatSystem.js`
- `src/entities/Projectile.js`
- `src/entities/DinosaurDummy.js` or `src/entities/Dinosaur.js`
- `src/ui/HUD.js`
- related tests for combat flow and damage

This slice proves that the project can support responsive combat before encounter complexity is added.

### Slice 3: Hunt Loop Vertical Slice With Compy Pack

Replace the sandbox framing with the first real hunt loop. Add `HuntScene`, a simple `SessionManager`, win and loss conditions, hunt timer behavior, and the Tier 1 Compy Pack encounter. This slice should support completing a hunt, failing a hunt, and preserving score/state at the scene boundary.

Likely files:

- `src/scenes/HuntScene.js`
- `src/systems/SessionManager.js`
- `src/entities/Dinosaur.js`
- `src/ai/CompyAI.js`
- `src/ai/PackCoordinator.js`

This is the first “real game” milestone. It should be ugly if needed, but it must be honestly playable.

### Slice 4: Cave Bar Vertical Slice

Add the cave bar between-hunt phase with the bartender station, weapon rack, cave paintings, countdown timer, score display, and routing back into the hunt. The first version can use placeholder visuals and a reduced set of purchasable options, but it must prove the pacing reset and the between-hunt economy.

Likely files:

- `src/scenes/CaveBarScene.js`
- `src/ui/WeaponShopMenu.js`
- `src/ui/CocktailMenu.js`
- `src/ui/AbilityPaintingUI.js`
- `src/ui/ScoreboardDisplay.js`

This slice is crucial because the cave bar is one of the game’s core venue differentiators. Without it, the project is just another arena fighter.

### Slice 5: Session Flow Scenes

Add the non-combat session scenes that make the game venue-ready: `AttractScene`, `PlayerSelectScene`, `GameOverScene`, and `VictoryScene`. This slice should establish the full scene graph for a single session from idle attract mode through final resolution.

Likely files:

- `src/scenes/AttractScene.js`
- `src/scenes/PlayerSelectScene.js`
- `src/scenes/GameOverScene.js`
- `src/scenes/VictoryScene.js`
- leaderboard and initials-entry helpers as needed

This slice gives the rebuild its first end-to-end public-facing loop, even if only one hunt is fully implemented.

### Slice 6: Tier 1 Content Completion

Round out Tier 1 by adding Dilophosaurus, improving Compy behavior and presentation, integrating better telegraphs, and making the first hunt set feel polished enough for repeated playtests. This slice should also establish the repeatable pattern for how hunts are configured.

Likely files:

- `src/data/hunts.js`
- `src/data/dinosaurs.js`
- expanded dinosaur AI and telegraph assets

This slice moves the project from “first playable” to “first content set with variety.”

### Slice 7: Traversal and Hazard Systems

Add lianas, climbable boss grab zones, and the first Matter-backed arena hazards such as rolling logs or falling boulders. This slice should prove the hybrid physics boundary in real gameplay.

Likely files:

- `src/systems/TraversalSystem.js`
- `src/systems/HazardSystem.js`
- `src/systems/PhysicsBridge.js`
- hazard and liana data definitions

This slice is the architectural proving ground for hybrid physics. If it becomes too simulation-heavy or hard to read, the team should adjust here before applying it to later bosses.

### Slice 8: Tier 2 Bosses

Implement Triceratops and Stegosaurus with flanking, rear weak-point pressure, and stronger use of elevated weak points. Arenas should now support platform-informed combat in a way that clearly changes how fights are played.

This slice proves the game can handle large single-boss encounters rather than only smaller Tier 1 enemies.

### Slice 9: Tier 3 Bosses

Implement Raptor Alpha and Carnotaurus with higher aggression, add pressure, and enrage-style pacing. This slice should validate that the game remains readable and fair as attack frequency and chaos increase.

### Slice 10: Tier 4 and Tier 5 Apex Systems

Implement the large-boss systems needed for Spinosaurus, Allosaurus, T-Rex, Giganotosaurus, and Quetzalcoatlus. This includes collapse staggers, multi-phase bosses, extreme scale framing, flight states, and stronger arena spectacle.

This slice should be split further during execution if the apex system work proves too broad, but it is grouped here for planning because these bosses share scale and presentation problems that the earlier slices do not.

### Slice 11: Meta Systems, Leaderboards, and Venue Hardening

Complete the daily leaderboard, all-time leaderboard, initials entry flow, analytics/logging hooks, attract-mode content rotation, and venue/ops polish. This slice also includes disconnect handling, startup reliability, and “abandoned session” recovery behavior.

This is the slice that turns a good prototype into something that can survive public use in a real bar.

### Slice 12: Polish, Balance, and Launch Readiness

Run venue-style playtests, tune scoring and pacing, polish combat readability, improve camera and HUD clarity, and harden performance. This slice should end with a release checklist and a concrete “go live” quality bar.

## Concrete Steps

The following commands define the immediate planning workflow and the first implementation handoff.

From the repository root:

    pwd
    ls docs/design
    ls docs/plans

To confirm the current blank rebuild state:

    find src -maxdepth 2 -type f

Expected result at the time this plan was written:

    find: src: No such file or directory

To begin actual implementation after planning:

    bd ready
    bd show <slice-issue-id>
    bd update <slice-issue-id> --status in_progress

The contributor should start with Slice 1, not skip ahead to content-heavy slices, because the first risk is movement and feel rather than data volume.

## Validation and Acceptance

This plan is accepted if the team can use it to create a clean issue hierarchy and if each slice has a clear, observable definition of done.

Per-slice acceptance should be framed as player-visible behavior:

- Slice 1 is done when a player can run the game and move, jump, land, dodge, and stay framed by the camera in a simple arena.
- Slice 2 is done when a player can attack a target, take damage, and see HUD updates.
- Slice 3 is done when a player can complete or fail a Compy hunt and transition through the session manager.
- Slice 4 is done when the cave bar exists as a real between-hunt phase with purchases and a countdown.
- Slice 5 is done when the full session graph from attract mode to final resolution exists.
- Later slices are done when their boss, traversal, or venue systems are honestly playable, not just stubbed into the codebase.

## Idempotence and Recovery

This plan is safe to revisit repeatedly. If a slice proves too large during execution, the right recovery action is to split that slice into smaller beads tasks while preserving the dependency order. Do not collapse multiple slices into one implementation sprint just because the repo is currently empty; that would recreate the same ambiguity this plan is meant to eliminate.

If hybrid physics work becomes unstable, the fallback is not “remove physics everywhere.” The fallback is to narrow Matter-backed behavior to hazards and lianas first, then reintroduce more advanced usage only after readability and testability are proven.

## Artifacts and Notes

The canonical design source that this plan follows is:

- `docs/design/2026-04-12-prehistoric-hunter-sidescroller-game-design.md`

The prior migration-era documents in `docs/plans/` are historical context only. They should not override this rebuild plan because they assumed an existing codebase and an in-progress conversion. This rebuild starts from a near-blank implementation state.

## Interfaces and Dependencies

The final implementation should include, at minimum, the following stable system boundaries:

In `src/systems/InputManager.js`, define a gamepad-first input service that can return per-player movement and action state for up to four players.

In `src/systems/PhysicsManager.js`, define the movement and collision rules for the sidescroller, including platform interaction and the integration points used by Phaser’s built-in Matter support for hazards and traversal.

In `src/systems/PhysicsBridge.js` or an equivalently named module, define the translation layer between physics collisions, sensors, and gameplay events so that combat and scoring logic do not depend directly on low-level simulation details.

In `src/systems/CombatSystem.js`, define combat resolution APIs for damage, invincibility windows, weak point checks, stagger progress, and status effects.

In `src/systems/SessionManager.js`, define the cross-scene session state for hunt progression, player loadouts, scores, and final routing to victory or failure scenes.

In `src/data/hunts.js`, define hunt configuration in data rather than hardcoding all encounter sequencing inside scene code.

In `src/scenes/`, keep each scene responsible for presentation and local orchestration, not for storing global session truth.
