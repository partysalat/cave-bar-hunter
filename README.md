# Prehistoric Hunter

4-player cooperative dinosaur hunting game for dinosaur-themed bar.

## Tech Stack

- Phaser 3 - Game engine
- Vite - Build tool
- Vitest - Testing framework

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Build for production
npm run build
```

## Project Structure

```
src/
  entities/        # Game entities (Player, Dinosaur, etc.)
  systems/         # Core systems (Coordinates, Input, Physics, Camera)
  scenes/          # Phaser scenes
  main.js          # Entry point
tests/            # Unit tests
docs/
  design/         # Game design document
  plans/          # Implementation plans
  phase-1-complete.md
```

## Current Status

✅ **Phase 1: Core Mechanics** - Complete
- Coordinate system and isometric rendering (2K resolution)
- Player movement with D-pad/keyboard
- Basic collision detection
- Camera following
- Screen-to-world direction conversion for proper isometric movement

🔄 **Phase 2: Combat & Systems** - Not started

See `docs/phase-1-complete.md` for details.

## Controls (Keyboard Testing)

- WASD: Move player
- (Gamepad support implemented, connect controller)

## Design Document

Full design: `docs/design/2026-01-18-prehistoric-hunter-bar-game-design.md`
