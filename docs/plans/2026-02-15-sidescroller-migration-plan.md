# Sidescroller Migration Plan
**Date:** 2026-02-15
**From:** Isometric top-down (Phase 3 in-progress)
**To:** 2D sidescroller

## Decision

Pivot to sidescroller before completing Phase 3 content. The Compy Pack hunt is 85% done but not integrated into game flow. This is the right time to migrate - we have proven systems but minimal sunk cost in isometric-specific content.

## What Survives Unchanged

These systems have no isometric dependencies:

| System | File | Notes |
|---|---|---|
| CombatSystem | `src/systems/CombatSystem.js` | Pure logic, no coordinates |
| ScoreManager | `src/systems/ScoreManager.js` | Pure data |
| SessionManager | `src/systems/SessionManager.js` | Scene flow only |
| UpgradeManager | `src/systems/UpgradeManager.js` | Stat modifiers |
| InputManager | `src/systems/InputManager.js` | Minor change: add jump action |
| PhysicsManager | `src/systems/PhysicsManager.js` | Simplify: remove Z axis |
| Entity base | `src/entities/Entity.js` | Remove worldZ, add jump velocity |

## Migration Phases

---

### Phase M1: Coordinate System Replacement

**Goal:** Replace isometric projection with simple 2D linear mapping.

**Delete:**
- `worldToScreen()` isometric formula
- `screenToWorld()` isometric inverse
- `screenToWorldDirection()` (critical isometric helper - no longer needed)
- `calculateDepth()` complex depth sorting
- Constants: TILE_WIDTH, TILE_HEIGHT, HEIGHT_SCALE

**Replace with:**
```javascript
// CoordinateSystem.js - new version
const PIXELS_PER_UNIT = 64;     // 1 world unit = 64 pixels
const SCREEN_FLOOR_Y = 900;     // Y pixel position of ground (worldY=0)
const GROUND_Y = 0;             // world units

function worldToScreen(worldX, worldY) {
  return {
    x: worldX * PIXELS_PER_UNIT,
    y: SCREEN_FLOOR_Y - worldY * PIXELS_PER_UNIT
  };
}

function calculateDepth(worldX, worldY) {
  // Simple: players in front of background, behind foreground decorations
  // Y height doesn't affect depth in sidescroller - it's a 2D plane
  return 10; // most entities share a depth layer
}
```

**Impact:** Every entity that calls `worldToScreen()` now gets correct 2D screen position automatically. The rest of the entity system is unchanged.

**Tests to update:** `tests/CoordinateSystem.test.js` - rewrite for new simple math.

---

### Phase M2: Entity & Physics Simplification

**Goal:** Remove worldZ from all entities, add worldY as vertical (height).

**Entity.js changes:**
- Remove `worldZ` property
- `worldY` now means **vertical height** (0 = ground), not isometric depth
- Add `velocityY` for jump physics (separate from `worldVelocityY` which was isometric depth velocity)
- Add `onGround` boolean

**PhysicsManager.js changes:**
- Remove Z-axis collision checks
- Add gravity constant: `GRAVITY = -40` (world units/second²)
- Apply gravity to all entities with `affectedByGravity = true` each frame
- Ground collision: if `worldY < 0`, set `worldY = 0`, `velocityY = 0`, `onGround = true`
- Platform collision: AABB check against platform rectangles in world space

**Remove:**
- Sphere-vs-box 3D collision (keep 2D AABB version)
- Z-axis overlap checks
- Height-aware isometric collision logic

**Keep:**
- Spatial partitioning grid (still useful for 2D)
- Circle-vs-rectangle for projectile/enemy hits

---

### Phase M3: Player Movement

**Goal:** Replace 8-directional isometric movement with left/right + jump.

**Player.js changes:**

Remove:
```javascript
// DELETE: isometric direction conversion
const worldDir = this.scene.coordinateSystem.screenToWorldDirection(inputDir);
this.worldVelocityX = worldDir.x * this.speed;
this.worldVelocityY = worldDir.y * this.speed;
```

Replace with:
```javascript
// NEW: simple 2D movement
const input = this.inputManager.getInput(this.playerIndex);

// Horizontal
this.velocityX = input.horizontal * this.speed; // -1, 0, or 1

// Jump
if (input.jump && this.onGround) {
  this.velocityY = JUMP_VELOCITY; // +15 units/second
  this.onGround = false;
}

// Gravity applied by PhysicsManager each frame
```

**SpriteDirectionSystem.js changes:**
- Remove 8-direction rotation logic
- Replace with 2-state: `'left'` or `'right'`
- `sprite.setFlipX(facingLeft)` instead of swapping texture keys
- Remove 8-rotation sprite asset loading

**InputManager.js changes:**
- Add `jump` to input state (D-pad up or face button B)
- `horizontal` replaces the multi-direction D-pad handling

---

### Phase M4: Arena Redesign

**Goal:** Replace top-down Dense Jungle arena with sidescroller layout.

**HuntScene.js changes:**
- Remove isometric tile grid rendering
- Add: background layer (parallax), platform layer, foreground layer
- Platforms defined as `{ worldX, worldY, width }` rectangles
- Camera: horizontal follow only (no vertical scroll)

**Arena data structure (new):**
```javascript
const JUNGLE_ARENA = {
  width: 80,           // world units
  platforms: [
    { x: 10, y: 5, width: 8 },   // left mid platform
    { x: 35, y: 8, width: 6 },   // center high platform
    { x: 60, y: 5, width: 8 },   // right mid platform
  ],
  spawnPoints: [
    { x: 15, y: 0 },  // player 1
    { x: 20, y: 0 },  // player 2
    { x: 25, y: 0 },  // player 3
    { x: 30, y: 0 },  // player 4
  ],
  enemySpawnPoints: [
    { x: 5, y: 0 },   // left edge
    { x: 75, y: 0 },  // right edge
  ]
};
```

**Tileset generation:**
Run `create_sidescroller_tileset` MCP tool for each arena theme before implementing. Store generated tilesets in `assets/tilesets/`.

---

### Phase M5: Compy Pack Adaptation

**Goal:** Adapt existing CompyAI to 2D movement.

The CompyAI state machine (CIRCLING → LUNGING → BITING → RETREATING) is mostly salvageable:

| State | Isometric behavior | 2D adaptation |
|---|---|---|
| CIRCLING | Orbit around target | Move left/right at mid-range, occasionally jump |
| LUNGING | Dash toward target | Horizontal dash toward target X |
| BITING | Close range attack | Melee hitbox check at player X |
| RETREATING | Move away | Reverse horizontal direction |

**PackCoordinator:** Keep as-is - it manages target selection and attack timing, which is coordinate-agnostic.

**Pincer attack in 2D:** Two Compys approach from opposite sides of target. Works naturally in a sidescroller - one from left, one from right.

---

### Phase M6: Assets

**Player sprites:**
- Generate new side-view sprites via PixelLab `create_character` with `view: "side"`
- 4 colors × left-facing only (flip in code for right-facing)
- Animations: idle, run, jump, attack, dodge, downed

**Dinosaur sprites:**
- Compys: Generate side-view via PixelLab `create_character` (quadruped template)
- Larger bosses: Commission or generate as static large sprites

**Tilesets:**
- Generate 5 arena tilesets via `create_sidescroller_tileset` MCP tool

**What to discard:**
- `assets/characters/{color}-hero/rotations/` - 8-direction sprites no longer needed
- `assets/generated/spritesheets/` - sprite sheets built from isometric frames
- `scripts/build-spritesheets.js` - may need update for new animation structure

---

## Migration Order

Execute phases in sequence. Each phase should leave tests passing before starting next.

```
M1: CoordinateSystem  →  tests pass
M2: Entity/Physics    →  tests pass
M3: Player movement   →  playable in browser (basic movement + jump)
M4: Arena             →  first arena visible with platforms
M5: Compy AI          →  first hunt playable end-to-end
M6: Assets            →  visual polish
```

## Test Strategy

- Run `npm test` after each phase
- Core system tests (CoordinateSystem, PhysicsManager, CombatSystem) catch regressions
- Manual playtest after M3 - movement feel is critical to get right before building content

## Code Removal Summary

Lines deleted:
- `CoordinateSystem.js`: ~80 lines (isometric math) → ~30 lines (simple 2D)
- `SpriteDirectionSystem.js`: ~120 lines (8-direction) → ~20 lines (flip flag)
- `Player.js`: ~60 lines (isometric movement conversion)
- `PhysicsManager.js`: ~80 lines (3D collision, Z-axis logic)
- `Entity.js`: ~20 lines (worldZ handling)

Lines added:
- `PhysicsManager.js`: ~50 lines (gravity, platform collision)
- `Player.js`: ~30 lines (jump input, horizontal movement)
- Arena data files: ~30 lines each

**Net: ~360 lines removed, ~150 lines added.**

## Risks

| Risk | Mitigation |
|---|---|
| Jump feel takes iteration | Tune JUMP_VELOCITY and GRAVITY constants, expose in dev config |
| 4-player screen crowding | Players pass through each other (no collision) |
| Boss turn direction causes AI confusion | Boss facing is a simple state flag, AI targets by worldX comparison |
| PixelLab asset style inconsistency | Use same prompts/settings for all characters |