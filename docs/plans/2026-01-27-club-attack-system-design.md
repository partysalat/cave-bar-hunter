# Club Attack System Design

**Date:** 2026-01-27
**Type:** Melee combat feature
**Phase:** 2b - Visual Assets & Combat Enhancement

## Overview

Add functional club/melee weapon attacks to players with proper hand attachment, swing animation, and hit detection. Uses skeleton data from PixelLab character generation for accurate weapon positioning.

## Problem Statement

Currently the bone club is attached to players with a static offset that doesn't:
- Align with the character's hand position
- Adjust based on facing direction (8 directions)
- Animate during attacks
- Provide hit detection functionality

## Design

### 1. Weapon Attachment & Positioning

**Skeleton Data Integration:**
- Load skeleton keypoints from `assets/characters/{color}-hero/{color}-hero.json`
- Use 3D skeleton format with normalized coordinates (0-1 range):
  - x: 0=left, 1=right of sprite
  - y: 0=top, 1=bottom of sprite
  - z: depth (closer to 1 = closer to camera)

**Keypoints used:**
- `LEFT ARM`: [0.616, 0.486, 0.400]
- `RIGHT ARM`: [0.384, 0.487, 0.399]

**Hand Selection by Direction:**
Direction | Hand Used | Reason
----------|-----------|-------
south, south-east, east, north-east | RIGHT ARM | More visible to camera
north, north-west, west, south-west | LEFT ARM | More visible to camera

**Position Calculation:**
1. Get skeleton keypoint for current facing direction
2. Convert normalized (0-1) coordinates to sprite pixels
3. Account for sprite scale (1.5x)
4. Apply small offset for "held" appearance
5. Update every frame as player rotates/moves

### 2. Attack Animation & Swing Motion

**Input Mapping:**
- Button: Face button (A/B) or dedicated melee button
- Separate from RT (spear throw) and LT (dodge)

**Animation Timing:**
Phase | Duration | Description
------|----------|------------
Wind-up | 150ms | Club raises slightly backward
Swing | 300ms | Club swings down in arc (ACTIVE HIT FRAMES)
Recovery | 200ms | Return to idle position
**Total** | **650ms** | Full animation duration
Cooldown | 1000ms | Time before next attack allowed

**Visual Motion:**
1. **Idle:** Held at hand position, slight downward angle
2. **Wind-up:** Rotate -30° backward, slight Y offset up
3. **Swing:** Rotate +120° through arc, parabolic Y motion down
4. **Recovery:** Return to idle rotation/position

**Club Rotation per Direction:**
- Rotation angles adjust based on facing direction
- South: down-right → down-left
- East: right-down → forward-down
- North: up-left → up-right
- (Similar logic for all 8 directions)

**State Properties (Player.js):**
```javascript
this.isAttacking = false;
this.attackTimer = 0;
this.attackPhase = 'none'; // 'windup', 'swing', 'recovery'
this.attackDuration = 650;
this.attackCooldown = 0;
this.attackCooldownTime = 1000;
this.hitEnemiesThisSwing = []; // Track to prevent double-hits
```

### 3. Hit Detection & Damage

**Attack Hitbox:**
- **Shape:** Cone/wedge from player position in facing direction
- **Range:** 2.5 world units (melee range, shorter than spear)
- **Arc angle:** 60° centered on facing direction (±30°)
- **Active frames:** Only during swing phase (150-450ms)
- **Hit limit:** Each enemy hit once per swing maximum

**Hit Detection Algorithm (CombatSystem.js):**
```javascript
checkClubHit(player, target) {
  // 1. Verify player is in swing phase
  if (player.attackPhase !== 'swing') return { hit: false };

  // 2. Check if already hit this swing
  if (player.hitEnemiesThisSwing.includes(target.id)) {
    return { hit: false };
  }

  // 3. Check distance (2.5 world units max)
  const dx = target.worldX - player.worldX;
  const dy = target.worldY - player.worldY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > 2.5) return { hit: false };

  // 4. Check if in attack cone (60° arc)
  const angleToTarget = Math.atan2(dy, dx);
  const facingAngle = Math.atan2(player.facingY, player.facingX);
  let angleDiff = Math.abs(angleToTarget - facingAngle);

  // Normalize angle difference to 0-180°
  if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

  const maxAngleDiff = (60 / 2) * (Math.PI / 180); // 30° in radians
  if (angleDiff > maxAngleDiff) return { hit: false };

  // 5. Hit confirmed
  return { hit: true, damage: 15 };
}
```

**Damage Values:**
- **Base damage:** 15 (vs spear's 10)
- **Weak point multiplier:** 2.5× = 37.5 damage
- **Design rationale:** Higher risk (melee) = higher reward (damage)

**Combat Flow:**
1. Player presses attack button → `startAttack()` called
2. Check `canAttack()` (not already attacking, cooldown ready, not downed)
3. Enter wind-up phase, lock movement
4. Transition to swing phase → **hit detection active**
5. Each frame during swing: check all enemies in range/arc
6. On hit: apply damage, add enemy to `hitEnemiesThisSwing[]`
7. Transition to recovery phase → hit detection off
8. Return to idle, start cooldown
9. Clear `hitEnemiesThisSwing[]` for next attack

## Technical Implementation Notes

### Files to Modify:
1. **Player.js** - Add attack state, weapon positioning logic
2. **CombatSystem.js** - Add `checkClubHit()` method
3. **TestScene.js** - Add attack button input, update loop integration
4. **InputManager.js** - Map attack button (if not already available)

### Skeleton Data Loading:
- Load JSON once per character color at scene initialization
- Cache skeleton data for performance
- Fall back to static offset if JSON missing/invalid

### Animation System:
- Update weapon sprite rotation/position every frame based on `attackTimer`
- Use easing functions for smooth motion (e.g., ease-out for swing)
- Sync visual animation with hit detection phases

### Player Movement During Attack:
- **Locked during attack:** Player cannot move while `isAttacking === true`
- **Can rotate facing:** Allow input to change facing direction for next attack
- **Dodge cancels attack:** LT dodge interrupts attack, goes on cooldown

## Future Enhancements (Not in Scope)

- Different weapon types with unique animations
- Charge attacks (hold button)
- Combo system (multiple attacks in sequence)
- Parry/block mechanics
- Knockback on hit
- Screen shake/hit stop for impact feel

## Success Criteria

- [ ] Club visually attached to player's hand in all 8 directions
- [ ] Club rotates and moves smoothly during attack animation
- [ ] Enemies within 2.5 units and 60° arc take damage during swing phase
- [ ] Each enemy hit once maximum per swing
- [ ] Attack respects 1-second cooldown
- [ ] Player cannot move during attack animation
- [ ] Works for all 4 player colors

## References

- Design doc: `docs/design/2026-01-18-prehistoric-hunter-bar-game-design.md`
- Skeleton data: `assets/characters/red-hero/red-hero.json` (lines 2253-2347)
- Existing combat: `src/systems/CombatSystem.js`
- Player entity: `src/entities/Player.js`