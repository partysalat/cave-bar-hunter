# Track C Runtime Shell for the Game Code Spike

This ExecPlan is a living document. It must stay in sync with the actual work in this track, especially the `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` sections.

This plan follows `.agents/PLANS.md` in the repository root and describes only the Track C ownership slice: Phaser bootstrapping, preload, scene-side rendering helpers, and the minimal scene flow needed to keep the runtime alive while other tracks finish the game rules.

## Purpose / Big Picture

After this change, a person can start the app, see Phaser boot into a loading phase, preload the SpriteCook assets from `assets/spritecook/manifest.json`, and enter a visible Dense Jungle hunt scene rendered from the new `ArenaRenderer`. From there, the runtime can move into a minimal Cave Bar scene and back again without crashing, even though the real combat rules, dinosaur AI, and HUD internals are still being built by other tracks.

The user-visible proof is simple: `src/index.ts` creates a Phaser game, `BootScene` transitions to `PreloadScene`, `PreloadScene` loads the manifest-backed assets, `HuntScene` shows the jungle arena shell, and `CaveBarScene` shows a minimal hub with a ready-state stub. The scenes should stay alive and navigable while the rest of the spike fills in logic later.

## Progress

- [x] (2026-04-24 00:00Z) Recreated the Track C ExecPlan in this worktree and aligned it with the current repository layout and manifest.
- [x] (2026-04-24 00:00Z) Implemented `src/index.ts`, `src/main.js`, and `src/scenes/BootScene.ts` so Phaser starts cleanly and hands off to preload.
- [x] (2026-04-24 00:00Z) Implemented `src/scenes/PreloadScene.ts` so it loads the SpriteCook manifest assets used by Track C.
- [x] (2026-04-24 00:00Z) Implemented `src/rendering/ArenaRenderer.ts` for the Dense Jungle arena background and props.
- [x] (2026-04-24 00:00Z) Implemented minimal `src/scenes/HuntScene.ts` with stubbed integration points that keep the runtime moving.
- [x] (2026-04-24 00:00Z) Implemented minimal `src/scenes/CaveBarScene.ts` with a ready-state stub and a transition back to hunt.
- [x] (2026-04-24 00:00Z) Ran `npm run build` successfully after installing dependencies with `npm ci`.
- [x] (2026-04-24 00:00Z) Ran a lightweight smoke check by starting the Vite dev server and fetching `/` and `/src/main.js`; confirmed the app shell and module bridge were served, but a live browser console could not be inspected from this environment.

## Surprises & Discoveries

- Observation: The repository already contains the exact SpriteCook asset families needed for Track C, including `players`, `enemies.dilophosaurus`, `arenas.dense-jungle`, and `cavebar`.
  Evidence: `assets/spritecook/manifest.json` includes those top-level keys and the corresponding `file` entries.

- Observation: `src/index.ts` is currently only a placeholder, so the app has no Phaser entrypoint yet.
  Evidence: `src/index.ts` contains only `// Entry point`.

- Observation: Vite warned about the first version of the SpriteCook URL helper because it used a runtime `new URL(...)` path that the bundler could not statically analyze.
  Evidence: Rebuilding after switching to `import.meta.glob('/assets/spritecook/**/*.{png,webp}', ...)` removed the warning and produced copied asset URLs in `dist/assets/`.

## Decision Log

- Decision: Keep Track C scoped to runtime and scene orchestration only, and avoid implementing core game rules, dinosaur AI, or HUD internals beyond what is needed to keep the app alive.
  Rationale: Those systems belong to the other tracks in the spike; keeping this slice narrow reduces cross-track churn and lets the scene shell be validated independently.
  Date/Author: 2026-04-24 / Codex

- Decision: Use the SpriteCook manifest at `assets/spritecook/manifest.json` as the preload source of truth instead of hard-coding asset lists in scene code.
  Rationale: The manifest already names the actual files for heroes, Dilophosaurus, Dense Jungle, and Cave Bar, which keeps preload logic aligned with the generated asset set.
  Date/Author: 2026-04-24 / Codex

- Decision: Make `HuntScene` and `CaveBarScene` minimal and stub-friendly, with scene transitions and visible placeholders rather than unfinished gameplay.
  Rationale: The track contract explicitly allows stubs until integration; the priority is keeping Phaser alive and proving the runtime shell, not simulating game logic.
  Date/Author: 2026-04-24 / Codex

- Decision: Use a tiny `src/main.js` shim that imports `src/index.ts` instead of rewriting `index.html`.
  Rationale: The HTML entry already points at `/src/main.js`, so the shim preserves the existing bootstrap contract while letting TypeScript own the real Phaser setup.
  Date/Author: 2026-04-24 / Codex

- Decision: Resolve SpriteCook asset URLs with a Vite glob instead of runtime path concatenation.
  Rationale: The glob makes Vite bundle the manifest-backed image files and avoids runtime path guessing for the hunt and cave bar scenes.
  Date/Author: 2026-04-24 / Codex

## Context and Orientation

The repository is a Phaser-based TypeScript game. The entrypoint is `src/index.ts`, which should create the game and list the scene order. The shared data contracts already exist in `src/core/types.ts`, `src/core/events.ts`, and `src/core/EventBus.ts`; Track C should treat them as stable and not redefine them.

The SpriteCook manifest at `assets/spritecook/manifest.json` is the asset index that Track C must respect. The relevant groups are:

- `players` for the four hero color families and their animations.
- `enemies.dilophosaurus` for the hunt enemy shell.
- `arenas.dense-jungle` for the hunt background tiles and props.
- `cavebar` for the cave bar tiles and simple scene dressing.

In this plan, a “scene” means one Phaser class that owns a phase of the runtime such as boot, preload, hunt, or cave bar. A “renderer” means a Phaser helper that draws static scene art and does not make gameplay decisions. “Stub” means a minimal implementation that preserves flow and visibility without implementing the final game rules.

The key files for this track are `src/index.ts`, `src/scenes/BootScene.ts`, `src/scenes/PreloadScene.ts`, `src/rendering/ArenaRenderer.ts`, `src/scenes/HuntScene.ts`, and `src/scenes/CaveBarScene.ts`.

## Plan of Work

First, wire `src/index.ts` to create a Phaser `Game` with a small scene list and shared config that works in Vite. Add `BootScene` in `src/scenes/BootScene.ts` as the smallest possible scene that prepares the transition into preload, and keep it free of asset work.

Second, implement `PreloadScene` in `src/scenes/PreloadScene.ts` so it reads `assets/spritecook/manifest.json` and queues the manifest-backed assets needed by Track C. The preload step should cover the hero animation families, Dilophosaurus animations, Dense Jungle tiles and props, and the cave bar tiles and props that the minimal runtime needs to show something useful.

Third, add `ArenaRenderer` in `src/rendering/ArenaRenderer.ts`. It should draw the Dense Jungle arena as a static layered background with parallax-like scroll factors for floor, mid, and canopy, and place the prop sprites from the manifest as scene dressing. This helper should be stateless after creation so it can be reused by `HuntScene` without owning game state.

Fourth, implement `HuntScene` in `src/scenes/HuntScene.ts` as a minimal shell. It should create the arena renderer, place placeholder player and enemy sprites, and keep enough structure for later integration with the logic tracks. If the other gameplay systems are not present yet, this scene should still render the arena, show obvious placeholder text, and expose a safe transition into the cave bar scene.

Fifth, implement `CaveBarScene` in `src/scenes/CaveBarScene.ts` as a minimal hub. It should use the cave bar assets to show a readable ready-state screen and a simple interaction path back to the hunt scene. The scene should not implement upgrades, bartender behavior, or inventory management.

Finally, update the plan itself as each milestone lands, capture any surprises or deviations, and verify the result with `npm run build` plus a smoke check that proves boot and preload start cleanly in the browser or a local dev server.

## Concrete Steps

Work from the repository root at `/tmp/cave-bar-hunter-track-c`.

1. Recreate and maintain this document at `docs/plans/2026-04-24-game-code-spike-track-c-execplan.md`.
2. Implement the scene shell in `src/index.ts` and the `src/scenes/` files.
3. Implement the static arena helper in `src/rendering/ArenaRenderer.ts`.
4. Run:

       npm run build

   A successful run should end with Vite completing the production bundle without TypeScript errors.

5. If practical in this environment, run a lightweight runtime check with the dev server and confirm that the app reaches Boot and Preload without throwing. A good check is to start the app locally, open the page, and confirm the browser console stays clean while the loading phase advances into the next scene.

## Validation and Acceptance

The implementation is acceptable when all of the following are true:

- `npm run build` succeeds from a clean checkout of this track worktree.
- The app starts from `src/index.ts` without a placeholder entrypoint.
- Boot transitions to Preload, and Preload loads the manifest-backed assets without missing-file errors.
- The hunt scene visibly renders the Dense Jungle background through `ArenaRenderer`.
- The cave bar scene exists as a minimal, stable transition target and does not crash the runtime.
- If a smoke test is practical, it should confirm that boot and preload start cleanly and do not immediately fail in the browser console.

## Idempotence and Recovery

The plan is intentionally additive. If a scene file or helper already exists, update it in place instead of deleting and recreating it. The preload step should be safe to rerun because it only queues assets from the manifest, and the build step should be repeatable without changing repository state.

If a smoke check fails because the dev server or browser launch is unavailable in the environment, record that limitation in `Progress` and `Surprises & Discoveries`, then still complete the build validation.

## Artifacts and Notes

Use short proof snippets here as work progresses. For now, the most relevant anchors are:

    src/index.ts
    src/scenes/BootScene.ts
    src/scenes/PreloadScene.ts
    src/rendering/ArenaRenderer.ts
    src/scenes/HuntScene.ts
    src/scenes/CaveBarScene.ts
    assets/spritecook/manifest.json

When a milestone lands, capture the observed behavior in this section with a concise transcript or build summary.

## Interfaces and Dependencies

This track should depend on Phaser from `package.json` and the manifest structure in `assets/spritecook/manifest.json`.

At the end of the track, the following files should exist and be importable from the app entrypoint:

    src/index.ts
    src/scenes/BootScene.ts
    src/scenes/PreloadScene.ts
    src/rendering/ArenaRenderer.ts
    src/scenes/HuntScene.ts
    src/scenes/CaveBarScene.ts

The scene classes should use Phaser’s normal `Scene` base class and should not mutate the shared EventBus contract in `src/core/EventBus.ts`. Any stub data should be local to the scenes or helper classes so that later tracks can replace it without changing the runtime shell.

## Outcomes & Retrospective

The Track C runtime shell now boots through Phaser, preloads the SpriteCook assets from the manifest, renders the Dense Jungle arena, and provides a minimal cave bar scene for flow control. The main implementation lesson was that Vite needs to know about the asset files up front, so the URL helper had to use a glob-based asset map instead of a runtime path string.

## Plan Revision Note

2026-04-24: Initial Track C ExecPlan recreated in this worktree. Revised during implementation to record the `src/main.js` shim, the glob-based SpriteCook asset lookup, and the verified build/smoke-check outcomes.
