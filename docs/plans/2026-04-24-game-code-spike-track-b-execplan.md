# Track B: Weak Points, Zone Resolution, and Dilophosaurus Telegraphs

This ExecPlan is a living document. It must be maintained in accordance with `/Users/ben/git/private/cave-bar-hunter/.agents/PLANS.md`.

## Purpose / Big Picture

Track B gives the game a real dinosaur-side decision layer for the spike. After this work, the logic layer can track weak-point damage per boss, determine which players are caught by a declared dinosaur attack, and choose a Dilophosaurus telegraph deterministically from player positions. A human should be able to prove the behavior by running focused unit tests in `tests/logic/dino/` and seeing the expected weak-point and attack-selection cases pass without any Phaser dependency.

## Progress

- [x] (2026-04-24 00:00Z) Recreated the Track B ExecPlan in this worktree and aligned it to the current repository state.
- [x] (2026-04-24 10:54Z) Implemented `src/logic/dino/WeakPointSystem.ts`, `src/logic/dino/AttackZoneResolver.ts`, and `src/logic/dino/DilophosaurusAI.ts` as deterministic, Phaser-free logic modules.
- [x] (2026-04-24 10:54Z) Added focused tests under `tests/logic/dino/` covering weak-point accumulation, zone resolution, and Dilophosaurus telegraph selection.
- [x] (2026-04-24 10:55Z) Ran `npx tsc --noEmit` successfully against the new TypeScript logic files.
- [x] (2026-04-24 10:55Z) Ran the focused Track B Vitest slice and confirmed all tests passed.

## Surprises & Discoveries

- Observation: `src/core/types.ts` and `src/core/events.ts` already exist in this worktree, so Track B can rely on the shared `AttackDeclaration`, `Position`, `PlayerId`, and `WeakPoint` contracts without changing shared files.
  Evidence: `src/core/types.ts` already defines `WeakPoint` as `'head' | 'legs'`, and `src/core/events.ts` already exposes `DINO_TELEGRAPH` with an `AttackDeclaration` payload.

- Observation: There is not yet a `src/logic/dino/` directory in this worktree, which means the Track B code will be additive rather than a rewrite.
  Evidence: `rg --files src/logic tests/logic` returned no matches before implementation began.

- Observation: A full four-player roster cannot produce a "bite otherwise" case if every player slot is always occupied, because the board only has three zones.
  Evidence: The first Dilophosaurus telegraph tests used all four player slots and both unexpectedly selected `spit`; the bite tests only became valid after switching to sparse player records.

## Decision Log

- Decision: Keep Track B fully Phaser-free and deterministic so the systems can be covered with fast unit tests.
  Rationale: The spike design explicitly separates logic from rendering, and this slice is about proving the dinosaur decision rules rather than scene integration.
  Date/Author: 2026-04-24 / Codex

- Decision: Model weak-point handling as a small standalone `WeakPointSystem` instead of folding it into the Dilophosaurus AI.
  Rationale: The spike design says weak-point accumulation is shared with the later `StaggerSystem`, so the state needs to be reusable and testable on its own.
  Date/Author: 2026-04-24 / Codex

- Decision: Resolve attacks from positions using `AttackZoneResolver` rather than baking zone math into the dinosaur AI.
  Rationale: Zone resolution is a generic combat concern and the spike contract calls for a separate resolver that can be verified independently.
  Date/Author: 2026-04-24 / Codex

- Decision: Make Dilophosaurus telegraph selection follow the spike rule exactly: spit when at least two players share a zone, otherwise bite.
  Rationale: This is the behavior the spike spec asks us to prove, and it keeps the AI simple enough to test deterministically.
  Date/Author: 2026-04-24 / Codex

- Decision: Accept sparse player position records for Track B so inactive player slots can exist and the bite path can be tested.
  Rationale: The game supports fewer than four active players, and the zone-count rule needs that sparse representation to exercise the non-spit branch without inventing fake positions.
  Date/Author: 2026-04-24 / Codex

## Outcomes & Retrospective

Track B is complete for the spike slice in this worktree. The three pure logic modules now exist under `src/logic/dino/`, and the focused tests under `tests/logic/dino/` pass. The main lesson from implementation was that the telegraph-selection rule only becomes meaningful when inactive player slots are representable, so the logic accepts sparse player records rather than assuming all four seats are always occupied.

## Context and Orientation

The repository already contains the shared contracts that Track B must consume. `src/core/types.ts` defines the game primitives for `Position`, `PlayerId`, `WeakPoint`, `AttackDeclaration`, and related types. `src/core/events.ts` defines the event names used by the rest of the spike, including `DINO_TELEGRAPH`, which carries an `AttackDeclaration`. `src/core/EventBus.ts` provides the typed pub/sub helper, but Track B does not need to depend on it directly unless a test or later integration asks for an event-emitting wrapper.

The Track B work belongs under `src/logic/dino/`. That directory does not exist yet in this worktree, so the first code changes should create it and add three plain TypeScript modules: `WeakPointSystem`, `AttackZoneResolver`, and `DilophosaurusAI`. The matching tests belong under `tests/logic/dino/` and should stay focused on pure logic only. The relevant spike design lives in `docs/superpowers/specs/2026-04-23-game-code-spike-design.md`, especially the Track B section, which says the systems must be implemented in dependency order and unit tested.

In this spike, a weak point is a named damage bucket on the dinosaur, currently `head` and `legs`. An attack declaration is the shared output that tells the rest of the game what kind of incoming attack is being telegraphed. A zone is one of the three horizontal distance bands from the boss, `close`, `mid`, or `far`, paired with a flank. Track B should keep those definitions simple and explicit so the tests can reason about them without mocks or frame-based timing.

## Plan of Work

First, create `src/logic/dino/WeakPointSystem.ts` as a small stateful helper with an explicit constructor for weak-point thresholds and current damage state. It should expose `applyDamage(weakPoint, amount)`, `getAccumulatedDamage(weakPoint)`, and `getThreshold(weakPoint)`. The implementation should be deterministic and should not infer boss state from Phaser objects. If a weak point is damaged past its threshold, the system should report that fact in a way the later `StaggerSystem` can consume, but it should not know anything about rendering, animation, or scene flow.

Second, create `src/logic/dino/AttackZoneResolver.ts` to translate a shared `AttackDeclaration` into affected positions and affected player ids. The resolver should know the Dilophosaurus attack shapes needed for this spike: spit affects the `mid` zone across all flanks, and bite targets the `close` zone with a single target. The file should keep the mapping logic pure so tests can verify both the zone list and the player-hit list from a set of positions.

Third, create `src/logic/dino/DilophosaurusAI.ts` as the boss-side selector. It should accept the current player positions and return an `AttackDeclaration` from `selectTelegraph()`. The selection rule is the spike contract: spit if two or more players share the same zone, bite otherwise. The class should also expose `getWeakPointThresholds()` so tests can confirm the intended `head` and `legs` thresholds without needing to inspect internal constants.

Fourth, add tests in `tests/logic/dino/` that prove the systems independently and together. One test file should cover weak-point accumulation and threshold reporting. One should cover attack-zone resolution against a few representative player layouts. One should cover Dilophosaurus telegraph selection, including the edge cases where players are spread out, stacked in a zone, or tied in a way that should still count as a shared zone. The tests should import from the new `src/logic/dino/` modules only and should not depend on any scene, HUD, input, or Phaser code.

## Concrete Steps

From `/tmp/cave-bar-hunter-track-b`, inspect the new logic surface after each file is added so the next step stays aligned with the current state. The expected commands are:

    npm test -- --run tests/logic/dino/WeakPointSystem.test.ts
    npm test -- --run tests/logic/dino/AttackZoneResolver.test.ts
    npm test -- --run tests/logic/dino/DilophosaurusAI.test.ts
    npm test -- --run tests/logic/dino

If the repository’s Vitest invocation needs a slightly different path shape, use the same working directory and keep the run focused on the Track B test directory rather than the whole suite.

## Validation and Acceptance

This slice is complete when the focused Track B tests pass and the output demonstrates the expected behavior. The minimum proof is that weak-point damage accumulates to a threshold, attack-zone resolution maps a declared spit or bite to the right positions and player ids, and Dilophosaurus telegraph selection chooses spit for a shared zone and bite otherwise.

The acceptance check is intentionally narrow: if a test names a player arrangement and the expected telegraph or hit list, the result should be stable on every run. There should be no randomness, no timing sensitivity, and no dependency on browser APIs.

## Idempotence and Recovery

All work in this plan should be additive. Re-running the tests is safe, and re-opening the files should not require any cleanup beyond normal git worktree hygiene. If a file is partially implemented, the next pass should continue from the current contents rather than deleting and rewriting it. If a shared contract ever seems necessary, stop and report it rather than changing `src/core/*` speculatively.

## Artifacts and Notes

When the implementation is done, capture the exact passing test command and a short summary of the observed behavior here. A useful transcript will mention the test file names and the number of passing tests, because that is the quickest way for the next contributor to confirm the slice really works.

Observed result: `npm test -- --run tests/logic/dino` passed with 3 files and 11 tests green.

Observed result: `npx tsc --noEmit` completed with no errors after the sparse-record typing fix in `DilophosaurusAI`.

## Interfaces and Dependencies

The Track B modules should settle on these concrete interfaces:

    src/logic/dino/WeakPointSystem.ts
    export class WeakPointSystem {
      constructor(thresholds?: Partial<Record<WeakPoint, number>>);
      applyDamage(weakPoint: WeakPoint, amount: number): { accumulatedDamage: number; threshold: number; thresholdReached: boolean };
      getAccumulatedDamage(weakPoint: WeakPoint): number;
      getThreshold(weakPoint: WeakPoint): number;
    }

    src/logic/dino/AttackZoneResolver.ts
    export class AttackZoneResolver {
      getAffectedPlayers(attack: AttackDeclaration, playerPositions: Partial<Record<PlayerId, Position>>): PlayerId[];
      getAffectedZones(attack: AttackDeclaration): Position[];
    }

    src/logic/dino/DilophosaurusAI.ts
    export class DilophosaurusAI {
      constructor(options?: { weakPointThresholds?: Partial<Record<WeakPoint, number>> });
      selectTelegraph(playerPositions: Partial<Record<PlayerId, Position>>): AttackDeclaration;
      getWeakPointThresholds(): Record<WeakPoint, number>;
    }

These signatures are prescriptive for the spike because they keep the implementation testable and make the later Track B integration straightforward. If a different shape becomes necessary, that should be recorded in the Decision Log together with the test that forced the change.

Note: `WeakPointSystem` keeps the default thresholds at 15 for `head` and 20 for `legs`, then raises the threshold by 50 percent after a threshold is crossed. `AttackZoneResolver` works with sparse player position records so inactive seats can be omitted. `DilophosaurusAI` accepts the same sparse shape, which is what makes the non-spit branch testable.
