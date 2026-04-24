# Migrate All Scenes To Generated SpriteCook Entity Atlases

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with `.agents/PLANS.md`. It is written against the repository state on `main` after the SpriteCook atlas pipeline was added and refined in commits `6b7a273`, `2ef8e55`, and `e3b0d7f`.

## Purpose / Big Picture

After this work, the game stops loading raw animated SpriteCook `.webp` files at runtime. Every scene that shows animated characters or enemies will use the generated entity atlases in `assets/generated/spritecook/entities/` instead. A human will be able to start the game, reach the hunt scene, see all four hunters and the Dilophosaurus animate from Phaser atlas frames, enter the cave bar, and see the hunter and bartender animate there too. The runtime will only keep the raw SpriteCook files for static environment art such as jungle tiles, cave bar props, and still images.

The proof is direct. From the repository root, run `npm run build:spritesheets`, then `npm run dev`, open the local Vite URL, and verify that HuntScene and CaveBarScene both show atlas-driven animation without using the DOM-image workaround or raw animated WebP playback.

## Progress

- [x] (2026-04-24 19:26Z) Reviewed `.agents/PLANS.md`, the current `PreloadScene`, `spritecookAssets` helpers, `HuntScene`, `CaveBarScene`, and the generated atlas output under `assets/generated/spritecook/entities/`.
- [x] (2026-04-24 19:29Z) Wrote this ExecPlan for the full scene migration from raw SpriteCook animation files to generated entity atlases.
- [x] (2026-04-24 19:42Z) Added generated-atlas discovery and animation registration helpers in `src/rendering/spritecookAssets.ts`, while narrowing raw SpriteCook runtime loading to static `.png` assets only.
- [x] (2026-04-24 19:44Z) Updated `src/scenes/PreloadScene.ts` to preload static SpriteCook art separately from generated entity atlases and register Phaser animations from the generated metadata.
- [x] (2026-04-24 19:47Z) Replaced the `AnimatedDomSprite` experiment in `src/scenes/HuntScene.ts` with atlas-backed Phaser sprites for all hunters and the Dilophosaurus.
- [x] (2026-04-24 19:48Z) Updated `src/scenes/CaveBarScene.ts` so the visible hunter and bartender use atlas-backed Phaser sprites.
- [x] (2026-04-24 19:49Z) Removed the animated-WebP runtime spike code by deleting `src/rendering/AnimatedDomSprite.ts` and removing Phaser DOM-container setup from `src/index.ts`.
- [x] (2026-04-24 19:53Z) Updated focused rendering tests for the new static-vs-generated contract and validated the migration with `./node_modules/.bin/tsc --noEmit`, focused Vitest coverage, and `npm run build`.
- [ ] Run a manual browser check of HuntScene and CaveBarScene after the clean atlas migration.

## Surprises & Discoveries

- Observation: The generated SpriteCook output is already in the right deployment shape for scene migration. The converter writes one atlas per entity plus one per-entity animation metadata file.
  Evidence: `assets/generated/spritecook/entities/` currently contains `red.png/.json/-animations.json`, `blue.*`, `yellow.*`, `green.*`, `dilophosaurus.*`, `trex.*`, and `bartender.*`.

- Observation: The current runtime still preloads every raw SpriteCook asset from `assets/spritecook/manifest.json`, even though the generated atlases now exist.
  Evidence: `src/scenes/PreloadScene.ts` calls `listSpriteCookAssets()` and then `this.load.image(asset.key, spriteCookAssetUrl(asset.file))` for every listed file.

- Observation: The hunt scene already carries an ad hoc animated-WebP workaround that should not survive the clean migration.
  Evidence: `src/scenes/HuntScene.ts` imports `AnimatedDomSprite`, `spriteCookAssetUrl`, and hard-coded `RED_IDLE_ANIMATION_FRAMES`, then uses that only for player `0`.

- Observation: The cave bar scene still renders the hunter and bartender as static `image` objects.
  Evidence: `src/scenes/CaveBarScene.ts` creates `image(...)` objects with raw `spriteCookAssetKey(...)` values for the hunter and bartender.

- Observation: The generated atlas manifest already records skipped bad source clips, which means the runtime can avoid guessing when an animation is unavailable.
  Evidence: `assets/generated/spritecook/manifest.json` has a `skipped` array that includes `animations/red/brace-idle.webp` and `animations/green/dodge.webp`.

- Observation: Restricting the raw SpriteCook `import.meta.glob(...)` to `.png` files materially cleans up the production bundle and prevents the old animated `.webp` inputs from leaking back in as dead assets.
  Evidence: Before narrowing the glob, `npm run build` emitted dozens of raw animation `.webp` files into `dist/assets/`; after the change, the build output only includes static `.png` art plus the generated entity atlases.

## Decision Log

- Decision: Make the migration clean rather than hybrid. Scene runtime should use generated atlases for animated entities everywhere instead of mixing raw animated assets with generated atlases long-term.
  Rationale: A partial migration would preserve duplicate asset-loading logic, leave the DOM animation workaround in place, and make future animation bugs harder to reason about.
  Date/Author: 2026-04-24 / Codex

- Decision: Keep raw SpriteCook runtime loading only for static environment and prop art.
  Rationale: The generated atlas pipeline currently solves animation delivery, not tile or prop packaging. Static jungle and cave bar assets already load and render correctly as plain textures.
  Date/Author: 2026-04-24 / Codex

- Decision: Drive Phaser animations from the generated `*-animations.json` files rather than re-deriving frame ranges from atlas frame names at runtime.
  Rationale: The animation metadata already captures frame order, frame size, durations, repeat semantics, source file provenance, and normalization details. Reusing it is more explicit and less fragile.
  Date/Author: 2026-04-24 / Codex

- Decision: Treat missing generated animations as explicit fallbacks to static stills rather than silent failures.
  Rationale: Some source animations are known to be missing or malformed. The runtime should still render a character or enemy in a stable way while making the gap visible in code and tests.
  Date/Author: 2026-04-24 / Codex

- Decision: Narrow raw SpriteCook asset discovery to static `.png` files instead of globbing the full raw tree.
  Rationale: The clean migration goal is not only scene behavior but also asset ownership. If the raw animated `.webp` files remain in the eager Vite glob, they still get pulled into the production bundle even after scenes stop using them.
  Date/Author: 2026-04-24 / Codex

## Outcomes & Retrospective

The runtime migration is now implemented in code. `PreloadScene` loads static raw SpriteCook `.png` assets and generated entity atlases separately, `spritecookAssets.ts` registers Phaser animations from the generated metadata, `HuntScene` uses atlas-backed sprites for all four hunters plus the Dilophosaurus, and `CaveBarScene` uses atlas-backed sprites for the hunter and bartender. The DOM-image experiment is gone, and raw animated `.webp` files are no longer part of the eager runtime asset glob.

Validation is strong at the code level: `./node_modules/.bin/tsc --noEmit`, focused Vitest rendering/UI/input/logic coverage, and `npm run build` all passed after the migration. The remaining acceptance item is manual browser verification of HuntScene and CaveBarScene in the live Vite app.

## Context and Orientation

This repository is a Phaser 3 plus Vite game prototype. `src/index.ts` boots `BootScene`, `PreloadScene`, `HuntScene`, and `CaveBarScene`. `src/scenes/PreloadScene.ts` is where runtime assets are currently loaded. `src/rendering/spritecookAssets.ts` is the central helper for turning SpriteCook manifest entries into Phaser texture keys and file URLs. `src/scenes/HuntScene.ts` is the main gameplay scene. `src/scenes/CaveBarScene.ts` is the bar intermission scene.

The term “generated atlas” in this repository means a single packed PNG plus a matching JSON atlas file written by `scripts/build-spritesheets.js` into `assets/generated/spritecook/entities/`. Each atlas groups every animation for one entity, such as `red` or `dilophosaurus`. Each entity also has a `*-animations.json` file that maps animation names like `idle` or `shield-attack` to atlas frame names, frame dimensions, frame rate, durations, and repeat behavior.

The term “raw SpriteCook asset” means the original AI-generated files under `assets/spritecook/`. Static art such as `assets/spritecook/arena/dense-jungle/tiles/floor.png` is still useful directly at runtime. Animated `.webp` files under `assets/spritecook/animations/`, `assets/spritecook/enemies/`, and `assets/spritecook/cavebar/bartender/` should stop being runtime dependencies once this plan is complete.

Today the runtime is inconsistent. `PreloadScene` still loads every raw SpriteCook file. `HuntScene` mostly uses static `image` objects and includes a one-off `AnimatedDomSprite` path for the red hunter. `CaveBarScene` shows static images for both the hunter and the bartender. The generated atlases exist, but no scene consumes them yet.

## Plan of Work

Start by extending `src/rendering/spritecookAssets.ts` into a two-layer asset helper. Keep the existing raw static-art helpers for jungle and cave bar props, but add a generated-atlas section that reads `assets/generated/spritecook/manifest.json` and the per-entity `*-animations.json` files through Vite import globs. Define a stable API that answers three questions: which atlas image/JSON pair belongs to an entity, which animation names exist for that entity, and which static fallback key should be used when a requested animation is unavailable.

Then update `src/scenes/PreloadScene.ts`. Replace the current “load everything from raw SpriteCook” loop with two explicit phases. The first phase loads static environment art from the raw SpriteCook tree, because tile sprites and cave bar props still come from plain `.png` files. The second phase loads the generated atlas image/JSON pair for each animated entity. PreloadScene should also initialize or call a helper that registers Phaser animations after the atlas files are loaded. The registration logic must use the generated animation metadata rather than hard-coded frame name patterns, because that metadata is where the normalized frame sizes, ordering, and repeat semantics already live.

After that, rework `src/scenes/HuntScene.ts` so animated entities are normal Phaser sprites. Remove the `AnimatedDomSprite` import, the hard-coded `RED_IDLE_ANIMATION_FRAMES`, and the direct `spriteCookAssetUrl` dependency. Replace those with a small helper that creates a Phaser sprite using the correct entity atlas and immediately plays an animation such as `spritecook.anim.red.idle` or `spritecook.anim.dilophosaurus.idle`. The scene should use the generated atlas animations for all four hunters and the dinosaur. Static text, HUD logic, round orchestration, and environment rendering should stay intact.

Next, rework `src/scenes/CaveBarScene.ts` the same way. The cave bar hunter should come from the hunter atlas, and the bartender should come from the bartender atlas. The room art stays on raw static textures. The cave bar scene currently only needs a simple idle loop, but the code should be written so that later interactions can switch to `cheer` or `grunt` without needing another asset-system refactor.

Once both scenes are migrated, remove any runtime code that only existed for the animated-WebP spike. If `src/rendering/AnimatedDomSprite.ts` has no remaining callers, delete it. Remove any helper exports from `spritecookAssets.ts` that were only needed for raw animated `.webp` playback. Keep the helper surface focused on “static raw art” plus “generated animated entities.”

Finally, add focused tests or helper-level assertions where the repository already has coverage. The migration does not need pixel-perfect rendering tests, but it does need executable proof that animation metadata can be discovered, atlases can be preloaded without missing-file crashes, and scenes choose a static fallback when a generated animation is absent.

## Concrete Steps

From the repository root `/Users/ben/git/private/cave-bar-hunter`, perform the work in this order:

    1. Update `src/rendering/spritecookAssets.ts` to add generated-atlas discovery and animation metadata helpers. Keep raw static-art helpers for tiles and props.
    2. Update `src/scenes/PreloadScene.ts` so it loads static raw art plus generated entity atlases, then registers Phaser animations from the generated animation metadata.
    3. Update `src/scenes/HuntScene.ts` so hunters and the Dilophosaurus use atlas-backed Phaser sprites and animation keys.
    4. Update `src/scenes/CaveBarScene.ts` so the visible hunter and bartender use atlas-backed Phaser sprites and animation keys.
    5. Remove `src/rendering/AnimatedDomSprite.ts` if it is no longer used anywhere.
    6. Add or update focused tests for any new helper behavior.
    7. Run validation commands and document the results in this ExecPlan.

The commands to run after each milestone are:

    npm run build:spritesheets
    ./node_modules/.bin/tsc --noEmit
    ./node_modules/.bin/vitest run tests/logic/ActionResolver.test.ts tests/input tests/ui
    npm run build

For the browser proof, run:

    npm run dev

Then open the local Vite URL and inspect HuntScene and CaveBarScene.

## Validation and Acceptance

This migration is complete when all of the following are true.

First, `npm run build:spritesheets` succeeds and leaves `assets/generated/spritecook/manifest.json` pointing at the expected entity atlases. No scene code should depend on extracted one-off test frames or direct animated-WebP playback.

Second, `./node_modules/.bin/tsc --noEmit` passes, focused Vitest coverage passes, and `npm run build` passes.

Third, after running `npm run dev`, a human can open the game, reach HuntScene, and observe all four hunters and the Dilophosaurus animating from generated atlases. The red hunter must no longer be special-cased through DOM rendering. The scene should continue to show the same gameplay text, HUD overlays, and round-loop behavior it had before the migration.

Fourth, after pressing `C` to enter CaveBarScene, the visible hunter and bartender should animate from generated atlases while the static bar environment continues to render correctly from raw tile and prop art.

Fifth, missing generated clips must degrade gracefully. If a requested animation is absent because the source clip was missing or malformed, the runtime should still render a static fallback texture rather than crashing preload or scene creation.

## Idempotence and Recovery

`npm run build:spritesheets` is safe to run repeatedly and should overwrite the generated atlas output in place. The runtime migration should also be additive while in progress: it is acceptable to keep a helper that still loads static raw art while generated animation loading is introduced.

If atlas registration breaks mid-implementation, recover by keeping the static raw-art path intact and migrating one scene at a time behind clear helper boundaries. Do not leave direct `spriteCookAssetUrl(...)` animated-WebP playback in production scene code once the migration is done; either keep the old static `image` fallback or finish the atlas-backed path.

If a generated animation is missing, fall back to the entity’s existing static still. For hunters, use the currently working idle/still texture key. For the bartender and dinosaurs, use the existing `still` texture keys already referenced by the scenes. That keeps the game playable while preserving a visible signal that an atlas clip is unavailable.

## Artifacts and Notes

The files that matter most for this migration are:

    src/scenes/PreloadScene.ts
    src/rendering/spritecookAssets.ts
    src/scenes/HuntScene.ts
    src/scenes/CaveBarScene.ts
    src/rendering/ArenaRenderer.ts
    assets/generated/spritecook/manifest.json
    assets/generated/spritecook/entities/red.json
    assets/generated/spritecook/entities/red-animations.json
    assets/generated/spritecook/entities/dilophosaurus.json
    assets/generated/spritecook/entities/bartender-animations.json
    scripts/build-spritesheets.js

Known generated-asset caveats at the time this plan was written:

    assets/generated/spritecook/manifest.json lists `animations/red/brace-idle.webp` as skipped because the source file does not exist.
    assets/generated/spritecook/manifest.json lists `animations/green/dodge.webp` as skipped because `webpmux` cannot parse the source file.

Those caveats are not blockers for the scene migration as long as the runtime has explicit static fallbacks.

## Interfaces and Dependencies

At the end of this migration, `src/rendering/spritecookAssets.ts` must expose a stable helper surface that covers at least these behaviors:

    getSpriteCookStaticTextureKey(pathParts: string[]): string
    listSpriteCookStaticAssets(): Array<{ key: string; file: string; path: string[] }>
    listGeneratedSpriteCookEntities(): Array<{ entity: string; image: string; atlas: string; animations: string }>
    getGeneratedSpriteCookAnimation(entity: string, animation: string): {
      frames: string[];
      frameRate: number | null;
      durations: number[];
      repeat: number;
    } | null

The exact names can differ, but the capability must exist and scene code must use it rather than hard-coding generated file paths.

PreloadScene must load atlas assets with Phaser’s atlas loader, not with plain `load.image`. The generated atlas JSON files are Hash atlases produced by `free-tex-packer-core`, so the Phaser loader should treat them as atlas metadata and create frame keys matching the entries listed in each `*-animations.json`.

HuntScene and CaveBarScene must create `Phaser.GameObjects.Sprite` instances for animated entities and call `.play(...)` with generated animation keys. Static jungle and cave bar props may remain `Image` or `TileSprite` instances because they are not animated.

The migration may keep using `scripts/build-spritesheets.js` exactly as the generated asset source of truth. No additional conversion script should be introduced unless this ExecPlan is amended to explain why.

Revision note: Created this ExecPlan to define a clean all-scenes migration from raw SpriteCook animated assets to the generated entity atlas pipeline, instead of continuing with a hybrid runtime or DOM animation workaround.
