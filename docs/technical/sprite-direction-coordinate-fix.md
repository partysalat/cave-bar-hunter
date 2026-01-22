# Sprite Direction Coordinate Space Fix

## Problem

When pressing W to move north (from the player's screen perspective), the sprite showed north-west instead of north. This is the same coordinate space issue that affected movement input.

## Root Cause

The game uses isometric coordinates with two coordinate spaces:

1. **Screen Space**: What the player sees (W = north, D = east, S = south, A = west)
2. **World Space**: Isometric game world coordinates (different axes due to 45° rotation)

**The Issue:**
- Player movement correctly converts screen input → world direction (using `screenToWorldDirection()`)
- Player facing is stored in **world space** (facingX, facingY)
- But sprite direction names (north, south, east, west) are in **screen space**
- The sprite system was using world-space facing directly without conversion

**Result:** W key → world direction (-1, -1) → interpreted as "north-west" instead of converting back to screen "north"

## Solution

### 1. Added Inverse Coordinate Conversion

Added `worldToScreenDirection()` to `CoordinateSystem.js`:

```javascript
export function worldToScreenDirection(worldDirX, worldDirY) {
    return {
        x: (worldDirX - worldDirY) / 2,
        y: (worldDirX + worldDirY) / 2
    };
}
```

This is the mathematical inverse of `screenToWorldDirection()`:
- `screenToWorldDirection`: Input → Movement
- `worldToScreenDirection`: Facing → Sprite

### 2. Updated Sprite Direction System

Modified `SpriteDirectionSystem.js` to:
1. Accept world-space facing direction (facingX, facingY)
2. Convert to screen-space using `worldToScreenDirection()`
3. Determine sprite direction from screen-space direction

```javascript
export function getDirectionFromFacing(worldFacingX, worldFacingY) {
    // Convert world-space facing to screen-space
    const screenDir = worldToScreenDirection(worldFacingX, worldFacingY);

    // Get sprite direction from screen-space facing
    return getDirectionFromScreenFacing(screenDir.x, screenDir.y);
}
```

## Verification

### Tests Added
- 12 CoordinateSystem tests (all passing)
  - 5 tests for `worldToScreenDirection()`
  - Verifies round-trip conversion (screen → world → screen)
  - Tests all 8 cardinal/diagonal directions

- 4 SpriteDirectionSystem tests (all passing)
  - Verifies W key → north sprite
  - Verifies all 8 screen directions map correctly

### Results
```
✅ All 60 tests passing
✅ Input conversion: screen → world → sprite now consistent
✅ No more misaligned sprite directions
```

## Key Principle

**Always be aware of coordinate space:**
- User input is in **screen space**
- Movement/physics is in **world space** (isometric)
- Sprite selection is in **screen space** (visual representation)

When converting between spaces, use the appropriate conversion functions:
- `screenToWorldDirection()` - for input/movement
- `worldToScreenDirection()` - for sprite selection

## Files Modified

1. `src/systems/CoordinateSystem.js` - Added `worldToScreenDirection()`
2. `src/systems/SpriteDirectionSystem.js` - Updated to convert world → screen before sprite selection
3. `tests/CoordinateSystem.test.js` - Added inverse conversion tests
4. `tests/SpriteDirectionSystem.test.js` - Updated to test world-space input
5. `tests/Player.test.js` - Added `setTexture()` to mock sprite

## Prevention

This pattern should be applied to **any** system that interprets directional data:
- Attack direction indicators
- Enemy facing
- Projectile trails
- Minimap indicators
- Any visual representation of world-space direction

**Rule:** If it's visual and directional, convert to screen space first.
