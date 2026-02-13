# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Prehistoric Hunter** - A 4-player cooperative dinosaur hunting game for a dinosaur-themed bar. Built with Phaser 3, featuring isometric top-down gameplay where players work together to defeat escalating dinosaur bosses while competing for individual scores.

**Tech Stack:**
- Phaser 3 (game engine)
- Vite (build tool & dev server)
- Vitest (testing framework)
- ES6 modules (no TypeScript)

## Development Commands

```bash
# Development
npm run dev              # Start dev server (default: http://localhost:5173)
npm test                 # Run tests in watch mode
npm run test:ui          # Run tests with Vitest UI

# Asset Generation
npm run build:spritesheets  # Generate optimized sprite sheets from character frames

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Running individual tests
npm test -- CoordinateSystem.test.js    # Run specific test file
npm test -- -t "test name pattern"      # Run tests matching pattern
```

Use 'bd' for task tracking

### Sprite Sheet Build System

The game uses optimized sprite sheets instead of loading individual frames:

**Location:** `scripts/build-spritesheets.js`

**What it does:**
- Scans `assets/characters/{color}-hero/animations/` directories
- Packs all animation frames into a single PNG per character
- Generates Phaser 3 compatible JSON atlases
- Outputs to `assets/generated/spritesheets/`

**When to run:**
- After adding new animations to character folders
- After modifying existing animation frames
- When setting up the project for the first time

**Output:**
- `assets/generated/spritesheets/{color}-hero.png` - Packed sprite sheet image
- `assets/generated/spritesheets/{color}-hero.json` - Frame atlas metadata

**Benefits:**
- Reduces ~4000+ individual PNG loads down to 8 files (4 PNGs + 4 JSONs)
- Better GPU memory usage and texture management
- Faster initial load times
- Automatic frame naming that matches game code expectations

**Frame Naming Convention:**
`player-{playerIndex}-{animKey}-{direction}-{frameNum}`

Example: `player-0-run-south-3` = Red hero, running animation, facing south, frame 3

## Core Architecture

### 3D Isometric World

The game uses a **3D world space** with isometric 2D rendering:

- **World Space** (worldX, worldY, worldZ): All gameplay logic, physics, and entity positions
  - worldX: horizontal (0-30 units)
  - worldY: depth/distance from camera (0-25 units)
  - worldZ: height/elevation (0-10+ units)

- **Screen Space**: 2D isometric projection for rendering only
  - Never use screen coordinates for gameplay logic
  - Derived from world coordinates via `CoordinateSystem.worldToScreen()`

**Key System:** `src/systems/CoordinateSystem.js`
- `worldToScreen()`: Converts 3D world → 2D screen for rendering
- `screenToWorld()`: Inverse conversion (e.g., for mouse clicks)
- `screenToWorldDirection()`: Converts screen input direction → world direction (crucial for isometric movement)
- `calculateDepth()`: Determines sprite render order based on worldY/worldZ

**Resolution:** 2K (2560×1440) with 2× scaled isometric tiles
- TILE_WIDTH: 128px, TILE_HEIGHT: 64px
- HEIGHT_SCALE: 100px per world unit Z

### Entity System

**Base Class:** `src/entities/Entity.js`
- All game objects inherit from Entity
- Maintains world position (worldX, worldY, worldZ) and velocity
- Automatically updates screen position and depth every frame
- Don't manually set sprite.x/sprite.y - use world coordinates

**Entity Types:**
- `Player.js`: Caveman hunters (4 color variants: red/blue/yellow/green)
- `Dinosaur.js`: Enemy bosses with health, weak points, AI behaviors
- `Projectile.js`: Thrown spears and other projectiles
- `WeakPoint.js`: Targetable weak spots on dinosaurs

### Core Systems

**Input:** `src/systems/InputManager.js`
- Supports up to 4 gamepads simultaneously
- D-pad for 8-directional movement
- Keyboard fallback (WASD) for Player 0 during development
- Button mapping for combat actions

**Physics:** `src/systems/PhysicsManager.js`
- Custom 3D collision detection (not using Phaser physics)
- Sphere-vs-sphere, box-vs-box, sphere-vs-box collision
- Height-aware collision (Z-axis matters)

**Combat:** `src/systems/CombatSystem.js`
- Damage calculations with weak point multipliers
- Perfect dodge timing windows (0.5s before hit)
- Invincibility frames tracking
- Status effects (burn, slow, shield, damage buffs)

**Camera:** `src/systems/CameraController.js`
- Follows center point of all active players
- Smooth lerp-based movement
- Prepared for dynamic zoom (not yet implemented)

**Scoring:** `src/systems/ScoreManager.js`
- Real-time score tracking per player
- Point awards: damage (1pt), weak points (3pt), perfect dodges (5pt), saves (10pt)
- Combo tracking and multipliers

**Sprite Direction:** `src/systems/SpriteDirectionSystem.js`
- Maps world-space movement to correct sprite rotation (8 directions)
- Handles character texture selection based on facing direction
- Player sprites: `/assets/characters/{color}-hero/rotations/{direction}.png`

### Testing Conventions

- All core systems have unit tests in `tests/`
- Test files mirror source structure: `src/systems/Foo.js` → `tests/Foo.test.js`
- Use Vitest for all testing
- Mock Phaser objects when needed (see existing tests for patterns)

## Asset Structure

```
assets/
  characters/
    {color}-hero/          # Player character sprites
      rotations/           # 8 directional rotations
        south.png
        south-east.png
        east.png
        north-east.png
        north.png
        north-west.png
        west.png
        south-west.png
      metadata.json        # Character generation metadata
```

**Asset Naming:**
- Player textures: `player-{playerIndex}-{direction}` (e.g., `player-0-south`)
- Colors map to player indices: 0=red, 1=blue, 2=yellow, 3=green

## Game Design References

**Full Design:** `docs/design/2026-01-18-prehistoric-hunter-bar-game-design.md` (1480 lines)
- Session structure (5 escalating hunts)
- Combat mechanics (telegraph → attack → recovery → stagger)
- Weak point system and perfect dodge timing
- All 12 dinosaurs with behaviors
- Cave bar hub and upgrade system
- Complete technical architecture

**Phase Documentation:**
- `docs/phase-1-complete.md`: Core mechanics completion summary
- `docs/plans/`: Implementation plans for each phase

## Phase Status

✅ **Phase 1: Core Mechanics** - Complete
- Coordinate system, entity framework, input, basic collision, camera

✅ **Phase 2: Combat & Systems** - Complete
- Projectiles, weak points, dodge mechanics, damage, scoring, downed state, HUD

🔄 **Phase 2b: Visual Assets** - In Progress
- Generating pixel art assets via PixelLab MCP
- Player character sprites (4 colors × 8 directions)
- Animations (walking, idle, attack, dodge, downed)

🔄 **Phase 3: Content Creation** - Not Started
- All 12 dinosaurs with unique behaviors
- 6 arena environments
- Cave bar scene and shop
- Weapons and cocktail system

## Important Notes

**Coordinate System:**
- Always think in world coordinates first, never screen coordinates
- Screen direction input (like from D-pad) must be converted via `screenToWorldDirection()` before applying to world position
- This conversion is critical for isometric movement to feel correct

**Entity Updates:**
- Entities automatically convert world → screen coordinates each frame
- Set entity.worldX/Y/Z and velocity, never sprite.x/y directly
- Depth sorting happens automatically via `calculateDepth()`

**Isometric Movement:**
- When player presses "up" on screen, this doesn't map directly to worldY
- Use `screenToWorldDirection()` to get proper world-space movement vector
- See `InputManager.js` and `Player.js` for reference implementation

**Testing:**
- Run tests frequently during development
- Test files already exist for all core systems
- Update tests when modifying system behavior

**Design Doc:**
- Refer to `docs/design/2026-01-18-prehistoric-hunter-bar-game-design.md` for complete game specifications
- Contains exact damage values, timing windows, boss patterns, and technical requirements

