# Club Attack System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add functional melee club attacks with skeleton-based hand attachment, swing animation, and cone-based hit detection.

**Architecture:** Extend Player entity with attack state machine, add skeleton data loader utility, implement cone hit detection in CombatSystem, integrate attack input in TestScene.

**Tech Stack:** Phaser 3, Vitest, ES6 modules

---

## Task 1: Skeleton Data Loader Utility

**Files:**
- Create: `src/systems/SkeletonDataLoader.js`
- Create: `tests/SkeletonDataLoader.test.js`

**Step 1: Write the failing test**

Create `tests/SkeletonDataLoader.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { loadSkeletonData, getHandPosition } from '../src/systems/SkeletonDataLoader.js';

describe('SkeletonDataLoader', () => {
    it('returns null for invalid skeleton data', () => {
        const result = getHandPosition(null, 'south');
        expect(result).toBeNull();
    });

    it('returns right arm position for south direction', () => {
        const mockSkeleton = {
            skeletons: {
                '3d': {
                    keypoints: {
                        'RIGHT ARM': [0.384, 0.487, 0.399],
                        'LEFT ARM': [0.616, 0.486, 0.400]
                    }
                }
            }
        };

        const result = getHandPosition(mockSkeleton, 'south');
        expect(result).toEqual({ x: 0.384, y: 0.487, z: 0.399, hand: 'right' });
    });

    it('returns left arm position for north direction', () => {
        const mockSkeleton = {
            skeletons: {
                '3d': {
                    keypoints: {
                        'RIGHT ARM': [0.384, 0.487, 0.399],
                        'LEFT ARM': [0.616, 0.486, 0.400]
                    }
                }
            }
        };

        const result = getHandPosition(mockSkeleton, 'north');
        expect(result).toEqual({ x: 0.616, y: 0.486, z: 0.400, hand: 'left' });
    });

    it('handles all 8 directions correctly', () => {
        const mockSkeleton = {
            skeletons: {
                '3d': {
                    keypoints: {
                        'RIGHT ARM': [0.384, 0.487, 0.399],
                        'LEFT ARM': [0.616, 0.486, 0.400]
                    }
                }
            }
        };

        // Right hand directions
        expect(getHandPosition(mockSkeleton, 'south').hand).toBe('right');
        expect(getHandPosition(mockSkeleton, 'south-east').hand).toBe('right');
        expect(getHandPosition(mockSkeleton, 'east').hand).toBe('right');
        expect(getHandPosition(mockSkeleton, 'north-east').hand).toBe('right');

        // Left hand directions
        expect(getHandPosition(mockSkeleton, 'north').hand).toBe('left');
        expect(getHandPosition(mockSkeleton, 'north-west').hand).toBe('left');
        expect(getHandPosition(mockSkeleton, 'west').hand).toBe('left');
        expect(getHandPosition(mockSkeleton, 'south-west').hand).toBe('left');
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- SkeletonDataLoader.test.js`
Expected: FAIL with "Cannot find module '../src/systems/SkeletonDataLoader.js'"

**Step 3: Write minimal implementation**

Create `src/systems/SkeletonDataLoader.js`:

```javascript
/**
 * Loads and parses skeleton data from PixelLab character JSON files
 */

/**
 * Loads skeleton data from JSON file path
 * @param {string} jsonPath - Path to character JSON file
 * @returns {Promise<Object|null>} Skeleton data or null
 */
export async function loadSkeletonData(jsonPath) {
    try {
        const response = await fetch(jsonPath);
        if (!response.ok) return null;
        const data = await response.json();
        return data;
    } catch (error) {
        console.warn(`Failed to load skeleton data from ${jsonPath}:`, error);
        return null;
    }
}

/**
 * Maps direction to which hand is more visible
 * @param {string} direction - One of 8 directions
 * @returns {string} 'left' or 'right'
 */
function getHandForDirection(direction) {
    const rightHandDirections = ['south', 'south-east', 'east', 'north-east'];
    return rightHandDirections.includes(direction) ? 'right' : 'left';
}

/**
 * Gets hand position from skeleton data for a specific direction
 * @param {Object} skeletonData - Parsed skeleton JSON data
 * @param {string} direction - Facing direction (south, north, etc.)
 * @returns {Object|null} {x, y, z, hand} normalized coordinates or null
 */
export function getHandPosition(skeletonData, direction) {
    if (!skeletonData?.skeletons?.['3d']?.keypoints) {
        return null;
    }

    const keypoints = skeletonData.skeletons['3d'].keypoints;
    const hand = getHandForDirection(direction);
    const armKey = hand === 'right' ? 'RIGHT ARM' : 'LEFT ARM';

    const armPosition = keypoints[armKey];
    if (!armPosition || armPosition.length < 3) {
        return null;
    }

    return {
        x: armPosition[0],
        y: armPosition[1],
        z: armPosition[2],
        hand
    };
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- SkeletonDataLoader.test.js`
Expected: PASS (all tests green)

**Step 5: Commit**

```bash
git add src/systems/SkeletonDataLoader.js tests/SkeletonDataLoader.test.js
git commit -m "feat: add skeleton data loader for weapon attachment

- Parse skeleton keypoints from PixelLab JSON
- Map 8 directions to visible hand (left/right)
- Return normalized hand position coordinates

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Club Hit Detection in CombatSystem

**Files:**
- Modify: `src/systems/CombatSystem.js`
- Modify: `tests/CombatSystem.test.js`

**Step 1: Write the failing test**

Add to `tests/CombatSystem.test.js`:

```javascript
describe('CombatSystem - Club Melee', () => {
    let mockScene;

    beforeEach(() => {
        mockScene = {
            add: {
                sprite: () => ({
                    setOrigin: () => ({}),
                    setDepth: () => ({}),
                    setTint: () => ({}),
                    play: () => ({})
                })
            }
        };
    });

    it('detects club hit on enemy in range and arc', () => {
        const combat = new CombatSystem();

        // Mock player facing south (0, 1) attacking
        const mockPlayer = {
            worldX: 10,
            worldY: 10,
            facingX: 0,
            facingY: 1,
            attackPhase: 'swing',
            hitEnemiesThisSwing: []
        };

        // Mock enemy directly in front (south)
        const mockEnemy = {
            id: 'enemy1',
            worldX: 10,
            worldY: 12 // 2 units south
        };

        const result = combat.checkClubHit(mockPlayer, mockEnemy);

        expect(result.hit).toBe(true);
        expect(result.damage).toBe(15);
    });

    it('returns no hit when not in swing phase', () => {
        const combat = new CombatSystem();

        const mockPlayer = {
            worldX: 10,
            worldY: 10,
            facingX: 0,
            facingY: 1,
            attackPhase: 'windup', // Not in swing phase
            hitEnemiesThisSwing: []
        };

        const mockEnemy = {
            id: 'enemy1',
            worldX: 10,
            worldY: 12
        };

        const result = combat.checkClubHit(mockPlayer, mockEnemy);

        expect(result.hit).toBe(false);
    });

    it('returns no hit when enemy already hit this swing', () => {
        const combat = new CombatSystem();

        const mockPlayer = {
            worldX: 10,
            worldY: 10,
            facingX: 0,
            facingY: 1,
            attackPhase: 'swing',
            hitEnemiesThisSwing: ['enemy1'] // Already hit
        };

        const mockEnemy = {
            id: 'enemy1',
            worldX: 10,
            worldY: 12
        };

        const result = combat.checkClubHit(mockPlayer, mockEnemy);

        expect(result.hit).toBe(false);
    });

    it('returns no hit when enemy out of range', () => {
        const combat = new CombatSystem();

        const mockPlayer = {
            worldX: 10,
            worldY: 10,
            facingX: 0,
            facingY: 1,
            attackPhase: 'swing',
            hitEnemiesThisSwing: []
        };

        const mockEnemy = {
            id: 'enemy1',
            worldX: 10,
            worldY: 15 // 5 units away, beyond 2.5 range
        };

        const result = combat.checkClubHit(mockPlayer, mockEnemy);

        expect(result.hit).toBe(false);
    });

    it('returns no hit when enemy outside attack cone', () => {
        const combat = new CombatSystem();

        const mockPlayer = {
            worldX: 10,
            worldY: 10,
            facingX: 0,
            facingY: 1, // Facing south
            attackPhase: 'swing',
            hitEnemiesThisSwing: []
        };

        const mockEnemy = {
            id: 'enemy1',
            worldX: 8, // Behind and to the left (north-west)
            worldY: 9
        };

        const result = combat.checkClubHit(mockPlayer, mockEnemy);

        expect(result.hit).toBe(false);
    });

    it('hits enemy within 60 degree arc', () => {
        const combat = new CombatSystem();

        const mockPlayer = {
            worldX: 10,
            worldY: 10,
            facingX: 0,
            facingY: 1, // Facing south
            attackPhase: 'swing',
            hitEnemiesThisSwing: []
        };

        // Enemy 25 degrees to the right (within 30 degree cone)
        const angle = Math.PI / 2 + (25 * Math.PI / 180);
        const distance = 2.0;
        const mockEnemy = {
            id: 'enemy1',
            worldX: 10 + Math.cos(angle) * distance,
            worldY: 10 + Math.sin(angle) * distance
        };

        const result = combat.checkClubHit(mockPlayer, mockEnemy);

        expect(result.hit).toBe(true);
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- CombatSystem.test.js`
Expected: FAIL with "checkClubHit is not a function"

**Step 3: Write minimal implementation**

Add to `src/systems/CombatSystem.js`:

```javascript
/**
 * Check if club attack hits enemy
 * @param {Player} player - Attacking player
 * @param {Object} target - Enemy with worldX, worldY, id
 * @returns {Object} {hit: boolean, damage: number}
 */
checkClubHit(player, target) {
    // 1. Verify player is in swing phase
    if (player.attackPhase !== 'swing') {
        return { hit: false, damage: 0 };
    }

    // 2. Check if already hit this swing
    if (player.hitEnemiesThisSwing.includes(target.id)) {
        return { hit: false, damage: 0 };
    }

    // 3. Check distance (2.5 world units max)
    const dx = target.worldX - player.worldX;
    const dy = target.worldY - player.worldY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 2.5) {
        return { hit: false, damage: 0 };
    }

    // 4. Check if in attack cone (60° arc, ±30° from facing)
    const angleToTarget = Math.atan2(dy, dx);
    const facingAngle = Math.atan2(player.facingY, player.facingX);
    let angleDiff = Math.abs(angleToTarget - facingAngle);

    // Normalize angle difference to 0-180°
    if (angleDiff > Math.PI) {
        angleDiff = 2 * Math.PI - angleDiff;
    }

    const maxAngleDiff = (60 / 2) * (Math.PI / 180); // 30° in radians

    if (angleDiff > maxAngleDiff) {
        return { hit: false, damage: 0 };
    }

    // 5. Hit confirmed
    return { hit: true, damage: 15 };
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- CombatSystem.test.js`
Expected: PASS (all tests green, including new club tests)

**Step 5: Commit**

```bash
git add src/systems/CombatSystem.js tests/CombatSystem.test.js
git commit -m "feat: add club hit detection with cone-based arc

- Check player in swing phase
- Verify 2.5 unit range
- 60 degree attack cone (±30° from facing)
- Prevent double-hits per swing
- Base damage: 15 (higher than spear)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Player Attack State Machine

**Files:**
- Modify: `src/entities/Player.js`
- Modify: `tests/Player.test.js`

**Step 1: Write the failing test**

Add to `tests/Player.test.js`:

```javascript
describe('Player - Club Attack', () => {
    let mockScene;

    beforeEach(() => {
        mockScene = {
            add: {
                sprite: () => ({
                    setOrigin: () => ({}),
                    setDepth: () => ({}),
                    play: () => ({}),
                    setScale: () => ({})
                })
            },
            anims: {
                create: () => ({})
            }
        };
    });

    it('can start attack when not on cooldown', () => {
        const player = new Player(mockScene, 0, 10, 10, 0);

        expect(player.canAttack()).toBe(true);

        player.startAttack();

        expect(player.isAttacking).toBe(true);
        expect(player.attackPhase).toBe('windup');
    });

    it('cannot attack when already attacking', () => {
        const player = new Player(mockScene, 0, 10, 10, 0);

        player.startAttack();
        const canAttackAgain = player.canAttack();

        expect(canAttackAgain).toBe(false);
    });

    it('cannot attack when on cooldown', () => {
        const player = new Player(mockScene, 0, 10, 10, 0);

        player.attackCooldown = 500; // Still on cooldown

        expect(player.canAttack()).toBe(false);
    });

    it('cannot attack when downed', () => {
        const player = new Player(mockScene, 0, 10, 10, 0);

        player.isDowned = true;

        expect(player.canAttack()).toBe(false);
    });

    it('progresses through attack phases over time', () => {
        const player = new Player(mockScene, 0, 10, 10, 0);

        player.startAttack();
        expect(player.attackPhase).toBe('windup');

        // Advance past windup (150ms)
        player.update(160);
        expect(player.attackPhase).toBe('swing');

        // Advance past swing (300ms)
        player.update(310);
        expect(player.attackPhase).toBe('recovery');

        // Advance past recovery (200ms)
        player.update(210);
        expect(player.attackPhase).toBe('none');
        expect(player.isAttacking).toBe(false);
    });

    it('starts cooldown after attack completes', () => {
        const player = new Player(mockScene, 0, 10, 10, 0);

        player.startAttack();

        // Complete entire attack (650ms)
        player.update(660);

        expect(player.attackCooldown).toBeGreaterThan(0);
        expect(player.attackCooldown).toBeLessThanOrEqual(1000);
    });

    it('clears hit enemies list when starting new attack', () => {
        const player = new Player(mockScene, 0, 10, 10, 0);

        player.hitEnemiesThisSwing = ['enemy1', 'enemy2'];
        player.startAttack();

        expect(player.hitEnemiesThisSwing).toEqual([]);
    });

    it('cannot move while attacking', () => {
        const player = new Player(mockScene, 0, 10, 10, 0);

        player.startAttack();
        player.move(1, 0); // Try to move

        expect(player.velocityX).toBe(0);
        expect(player.velocityY).toBe(0);
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- Player.test.js`
Expected: FAIL with "canAttack is not a function"

**Step 3: Write minimal implementation**

Add to `src/entities/Player.js` constructor (after line 85):

```javascript
// Attack stats (club melee)
this.isAttacking = false;
this.attackTimer = 0;
this.attackPhase = 'none'; // 'windup', 'swing', 'recovery', 'none'
this.attackDuration = 650; // Total animation time
this.attackCooldown = 0;
this.attackCooldownTime = 1000; // 1 second between attacks
this.hitEnemiesThisSwing = []; // Track enemies hit this swing

// Attack phase durations
this.windupDuration = 150;
this.swingDuration = 300;
this.recoveryDuration = 200;
```

Add methods to `src/entities/Player.js` (after throwSpear method, around line 225):

```javascript
/**
 * Check if player can attack
 * @returns {boolean}
 */
canAttack() {
    return this.attackCooldown === 0 && !this.isDowned && !this.isAttacking;
}

/**
 * Start club attack
 */
startAttack() {
    if (!this.canAttack()) return;

    this.isAttacking = true;
    this.attackTimer = 0;
    this.attackPhase = 'windup';
    this.hitEnemiesThisSwing = [];

    // Stop movement during attack
    this.velocityX = 0;
    this.velocityY = 0;
}

/**
 * Update attack state
 * @param {number} delta - Time in ms
 */
updateAttack(delta) {
    if (!this.isAttacking) return;

    this.attackTimer += delta;

    // Progress through attack phases
    if (this.attackPhase === 'windup' && this.attackTimer >= this.windupDuration) {
        this.attackPhase = 'swing';
    } else if (this.attackPhase === 'swing' && this.attackTimer >= this.windupDuration + this.swingDuration) {
        this.attackPhase = 'recovery';
    } else if (this.attackPhase === 'recovery' && this.attackTimer >= this.attackDuration) {
        // Attack complete
        this.isAttacking = false;
        this.attackPhase = 'none';
        this.attackTimer = 0;
        this.attackCooldown = this.attackCooldownTime;
        this.hitEnemiesThisSwing = [];
    }
}
```

Modify `move()` method in `src/entities/Player.js` (line 93):

```javascript
move(dirX, dirY) {
    if (this.isDodging || this.isAttacking) return; // Can't move during dodge or attack

    // ... rest of existing code
}
```

Modify `update()` method in `src/entities/Player.js` (line 362):

```javascript
update(delta) {
    super.update(delta);
    this.updateCooldowns(delta);
    this.updateDodge(delta);
    this.updateDownedState(delta);
    this.updateAttack(delta); // Add attack update

    // Update dodge cooldown
    if (this.dodgeCooldown > 0) {
        this.dodgeCooldown -= delta;
        if (this.dodgeCooldown < 0) this.dodgeCooldown = 0;
    }

    // Update perfect dodge buff
    if (this.perfectDodgeBuff > 0) {
        this.perfectDodgeBuff -= delta;
        if (this.perfectDodgeBuff < 0) this.perfectDodgeBuff = 0;
    }

    // Update attack cooldown
    if (this.attackCooldown > 0) {
        this.attackCooldown -= delta;
        if (this.attackCooldown < 0) this.attackCooldown = 0;
    }

    // Update weapon position
    this.updateWeaponPosition();
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- Player.test.js`
Expected: PASS (all tests green)

**Step 5: Commit**

```bash
git add src/entities/Player.js tests/Player.test.js
git commit -m "feat: add player attack state machine

- Attack phases: windup (150ms), swing (300ms), recovery (200ms)
- 1 second cooldown between attacks
- Lock movement during attack
- Track hit enemies to prevent double-hits

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Weapon Positioning with Skeleton Data

**Files:**
- Modify: `src/entities/Player.js`
- Modify: `src/scenes/TestScene.js`

**Step 1: Load skeleton data in TestScene**

Modify `src/scenes/TestScene.js` preload() method (around line 22):

```javascript
preload() {
    // Load player character animations
    const playerColors = ['red', 'blue', 'yellow', 'green'];
    const directions = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];

    playerColors.forEach((color, playerIndex) => {
        directions.forEach(direction => {
            // Load running animation frames (8 frames per direction)
            const runningFrames = [];
            for (let i = 0; i < 8; i++) {
                const frameKey = `player-${playerIndex}-run-${direction}-${i}`;
                const framePath = `/assets/characters/${color}-hero/animations/running-8-frames/${direction}/frame_00${i}.png`;
                this.load.image(frameKey, framePath);
                runningFrames.push({ key: frameKey });
            }

            // Load breathing idle animation frames (4 frames per direction)
            const idleFrames = [];
            for (let i = 0; i < 4; i++) {
                const frameKey = `player-${playerIndex}-idle-${direction}-${i}`;
                const framePath = `/assets/characters/${color}-hero/animations/breathing-idle/${direction}/frame_00${i}.png`;
                this.load.image(frameKey, framePath);
                idleFrames.push({ key: frameKey });
            }
        });

        // Load skeleton data for weapon attachment
        this.load.json(`skeleton-${color}`, `/assets/characters/${color}-hero/${color}-hero.json`);
    });

    // Load weapon assets
    this.load.image('bone-club', '/assets/weapons/bone-club.png');
}
```

**Step 2: Pass skeleton data to player**

Modify `src/scenes/TestScene.js` create() method (around line 53):

```javascript
create() {
    // Create player animations
    this.createPlayerAnimations();

    // Draw isometric ground grid for visualization
    this.drawGroundGrid();

    // Create test player at arena center
    this.player = new Player(this, 0, 15, 12, 0);

    // Load skeleton data for player
    const skeletonData = this.cache.json.get('skeleton-red');
    this.player.setSkeletonData(skeletonData);

    // Create and attach bone club to player 1
    const boneClub = this.add.sprite(0, 0, 'bone-club');
    boneClub.setScale(0.5); // Scale down the weapon
    this.player.setWeaponSprite(boneClub);

    // ... rest of existing code
}
```

**Step 3: Update Player to use skeleton data**

Add to `src/entities/Player.js` (after weaponOffsetY line 38):

```javascript
// Weapon sprite (optional, can be set later)
this.weaponSprite = null;
this.weaponOffsetX = 20; // Fallback offset from player center
this.weaponOffsetY = 10;
this.skeletonData = null; // Skeleton data for hand positioning
```

Add method to `src/entities/Player.js` (after setWeaponSprite, around line 346):

```javascript
/**
 * Sets skeleton data for hand positioning
 * @param {Object} skeletonData - Parsed skeleton JSON
 */
setSkeletonData(skeletonData) {
    this.skeletonData = skeletonData;
}
```

Modify `updateWeaponPosition()` in `src/entities/Player.js` (line 350):

```javascript
/**
 * Updates weapon sprite position relative to player
 */
updateWeaponPosition() {
    if (!this.weaponSprite) return;

    let offsetX = this.weaponOffsetX;
    let offsetY = this.weaponOffsetY;
    let rotation = 0;

    // Use skeleton data if available
    if (this.skeletonData) {
        const direction = this.getCurrentDirection();
        const handPos = this.getHandPositionForDirection(direction);

        if (handPos) {
            // Convert normalized coordinates to sprite pixels
            const spriteWidth = this.sprite.width;
            const spriteHeight = this.sprite.height;
            const scale = this.sprite.scale;

            // Calculate offset from sprite center
            offsetX = (handPos.x - 0.5) * spriteWidth * scale;
            offsetY = (handPos.y - 0.5) * spriteHeight * scale;

            // Add small offset to look "held"
            offsetY += 10;
        }
    }

    // Apply attack animation offsets
    if (this.isAttacking) {
        const attackOffset = this.getAttackAnimationOffset();
        offsetY += attackOffset.y;
        rotation = attackOffset.rotation;
    }

    this.weaponSprite.x = this.sprite.x + offsetX;
    this.weaponSprite.y = this.sprite.y + offsetY;
    this.weaponSprite.rotation = rotation;
    this.weaponSprite.setDepth(this.sprite.depth - 1); // Behind player
}

/**
 * Gets current direction string from facing vector
 * @returns {string} Direction name
 */
getCurrentDirection() {
    // Map facing vector to direction string
    const angle = Math.atan2(this.facingY, this.facingX);
    const degrees = angle * (180 / Math.PI);

    // Normalize to 0-360
    const normalizedDegrees = (degrees + 360) % 360;

    // Map to 8 directions (45 degree segments)
    if (normalizedDegrees < 22.5 || normalizedDegrees >= 337.5) return 'east';
    if (normalizedDegrees < 67.5) return 'south-east';
    if (normalizedDegrees < 112.5) return 'south';
    if (normalizedDegrees < 157.5) return 'south-west';
    if (normalizedDegrees < 202.5) return 'west';
    if (normalizedDegrees < 247.5) return 'north-west';
    if (normalizedDegrees < 292.5) return 'north';
    return 'north-east';
}

/**
 * Gets hand position from skeleton data for direction
 * @param {string} direction
 * @returns {Object|null} {x, y, z, hand}
 */
getHandPositionForDirection(direction) {
    if (!this.skeletonData?.skeletons?.['3d']?.keypoints) {
        return null;
    }

    const keypoints = this.skeletonData.skeletons['3d'].keypoints;
    const rightHandDirections = ['south', 'south-east', 'east', 'north-east'];
    const hand = rightHandDirections.includes(direction) ? 'right' : 'left';
    const armKey = hand === 'right' ? 'RIGHT ARM' : 'LEFT ARM';

    const armPosition = keypoints[armKey];
    if (!armPosition || armPosition.length < 3) {
        return null;
    }

    return {
        x: armPosition[0],
        y: armPosition[1],
        z: armPosition[2],
        hand
    };
}

/**
 * Gets animation offset for attack
 * @returns {Object} {y, rotation}
 */
getAttackAnimationOffset() {
    const progress = this.attackTimer / this.attackDuration;
    let y = 0;
    let rotation = 0;

    if (this.attackPhase === 'windup') {
        // Raise club slightly backward
        const windupProgress = this.attackTimer / this.windupDuration;
        y = -10 * windupProgress;
        rotation = -0.5 * windupProgress; // -30 degrees in radians
    } else if (this.attackPhase === 'swing') {
        // Swing down in arc
        const swingProgress = (this.attackTimer - this.windupDuration) / this.swingDuration;
        y = -10 + (20 * swingProgress); // -10 to +10
        rotation = -0.5 + (2.1 * swingProgress); // -30° to +90° (2.1 radians)
    } else if (this.attackPhase === 'recovery') {
        // Return to idle
        const recoveryProgress = (this.attackTimer - this.windupDuration - this.swingDuration) / this.recoveryDuration;
        y = 10 * (1 - recoveryProgress);
        rotation = 1.6 * (1 - recoveryProgress); // 90° back to 0°
    }

    return { y, rotation };
}
```

**Step 4: Test manually**

Run: `npm run dev`
Expected:
- Club should be positioned at player's hand
- Club position should update based on facing direction
- No console errors

**Step 5: Commit**

```bash
git add src/entities/Player.js src/scenes/TestScene.js
git commit -m "feat: add skeleton-based weapon positioning

- Load skeleton JSON in TestScene
- Calculate hand position from normalized coordinates
- Map facing direction to visible hand (left/right)
- Add attack animation offsets (raise, swing, recovery)
- Fallback to static offset if skeleton unavailable

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Attack Input Integration

**Files:**
- Modify: `src/scenes/TestScene.js`

**Step 1: Add attack button tracking**

Modify `src/scenes/TestScene.js` create() method (after input setup, around line 72):

```javascript
// Setup input
this.inputManager = new InputManager(this);
this.inputManager.setupKeyboard(); // For testing without gamepad

// Track button states for attack (press once, not hold)
this.lastAttackButton = false;
```

**Step 2: Add attack input handling**

Modify `src/scenes/TestScene.js` update() method (around line 96):

```javascript
if (this.player) {
    // Get input for player 0
    const input = this.inputManager.getPlayerInputWithKeyboard(0);

    if (input) {
        const screenDirection = this.inputManager.getDPadDirection(input.dpad);

        if (screenDirection.x !== 0 || screenDirection.y !== 0) {
            // Convert screen-space input to world-space direction
            const worldDirection = screenToWorldDirection(screenDirection.x, screenDirection.y);
            this.player.move(worldDirection.x, worldDirection.y);
        } else {
            this.player.stop();
        }

        // Club attack (B button) - press once per attack
        if (input.buttons.b && !this.lastAttackButton) {
            this.player.startAttack();
        }
        this.lastAttackButton = input.buttons.b;

        // Spear throwing (RT button)
        if (input.buttons.rt && this.player.canThrowSpear()) {
            const throwData = this.player.throwSpear(
                this.player.facingX,
                this.player.facingY
            );

            if (throwData) {
                const projectile = new Projectile(
                    this,
                    this.player.playerNumber,
                    throwData.worldX,
                    throwData.worldY,
                    throwData.worldZ,
                    throwData.dirX,
                    throwData.dirY,
                    throwData.dirZ,
                    throwData.damageMultiplier // Pass buff multiplier
                );
                this.projectiles.push(projectile);
            }
        }

        // Dodge roll (LT button)
        if (input.buttons.lt && this.player.canDodge()) {
            this.player.startDodge();
        }
    }

    this.player.update(delta);

    // ... rest of existing code (projectile updates, etc.)
}
```

**Step 3: Add club hit detection**

Modify `src/scenes/TestScene.js` update() method (after projectile collision, around line 188):

```javascript
// Check club attack hits
if (this.player.attackPhase === 'swing' && this.testDino && !this.testDino.isDead) {
    const clubHit = this.combatSystem.checkClubHit(this.player, this.testDino);

    if (clubHit.hit) {
        // Mark as hit this swing
        if (!this.player.hitEnemiesThisSwing.includes(this.testDino.id)) {
            this.player.hitEnemiesThisSwing.push(this.testDino.id);

            this.testDino.takeDamage(clubHit.damage);
            this.scoreManager.awardDamagePoints(this.player.playerNumber, clubHit.damage);

            console.log(`Club hit! Damage: ${clubHit.damage} | Score: ${this.scoreManager.getScore(0)}`);

            if (this.testDino.health <= 0 && !this.testDino.isDead) {
                this.testDino.isDead = true;
                console.log('DINOSAUR DEFEATED!');
            }
        }
    }
}
```

**Step 4: Add ID to Dinosaur**

Modify `src/entities/Dinosaur.js` constructor (around line 30):

```javascript
constructor(scene, type, worldX, worldY, worldZ) {
    super(scene, worldX, worldY, worldZ);

    this.id = `dino-${Date.now()}-${Math.random()}`; // Unique ID for hit tracking
    this.type = type;

    // ... rest of existing code
}
```

**Step 5: Test manually**

Run: `npm run dev`
Expected:
- Press Q (or B button) to attack with club
- Club should swing animation
- Dinosaur should take damage when in range/arc during swing
- Console logs club hits
- 1 second cooldown between attacks

**Step 6: Commit**

```bash
git add src/scenes/TestScene.js src/entities/Dinosaur.js
git commit -m "feat: integrate club attack input and hit detection

- B button (Q key) triggers club attack
- Check hit during swing phase only
- Track hit enemies to prevent double-hits per swing
- Award damage points on club hit
- Add unique ID to dinosaurs for tracking

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Manual Testing & Polish

**Files:**
- None (manual testing only)

**Step 1: Test all attack scenarios**

Run: `npm run dev`

Test checklist:
- [ ] Club positioned at hand in all 8 directions (walk around)
- [ ] Club swings smoothly when pressing Q/B
- [ ] Club hits dinosaur when in range (within 2.5 units)
- [ ] Club hits dinosaur when in arc (within 60° cone)
- [ ] Club does NOT hit when out of range
- [ ] Club does NOT hit when behind player
- [ ] Each swing hits dinosaur only once
- [ ] 1 second cooldown between attacks
- [ ] Cannot move during attack
- [ ] Can move after attack completes
- [ ] Damage appears in console (15 per hit)
- [ ] Score increases on club hit

**Step 2: Fix any issues found**

If bugs discovered:
1. Document the bug
2. Write a test that reproduces it
3. Fix the bug
4. Verify test passes
5. Commit with descriptive message

**Step 3: Final commit**

```bash
git add -A
git commit -m "polish: final club attack system adjustments

Manual testing complete. All success criteria met:
- Club visually attached to hand in 8 directions
- Smooth swing animation
- Accurate hit detection (2.5 units, 60° arc)
- Single hit per enemy per swing
- 1 second cooldown working
- Movement locked during attack

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Success Criteria Checklist

- [ ] Club visually attached to player's hand in all 8 directions
- [ ] Club rotates and moves smoothly during attack animation
- [ ] Enemies within 2.5 units and 60° arc take damage during swing phase
- [ ] Each enemy hit once maximum per swing
- [ ] Attack respects 1-second cooldown
- [ ] Player cannot move during attack animation
- [ ] Works for all 4 player colors
- [ ] All tests passing
- [ ] Code committed to git

---

## Notes for Engineer

**Architecture Overview:**
- `SkeletonDataLoader`: Utility to parse PixelLab skeleton JSON and extract hand positions
- `CombatSystem.checkClubHit()`: Cone-based hit detection with range and angle checks
- `Player`: Attack state machine with 3 phases (windup, swing, recovery)
- `Player.updateWeaponPosition()`: Calculates hand position and animation offsets
- `TestScene`: Input handling and hit detection integration

**Key Design Decisions:**
- Normalized skeleton coordinates (0-1) → sprite pixels with scale
- Right hand for south/east, left hand for north/west (camera visibility)
- Attack phases: windup (150ms), swing (300ms), recovery (200ms)
- Hit detection only active during swing phase
- Cone check: 60° arc (±30° from facing), 2.5 world units range
- Button press detection (not hold) for single attack per press

**Testing Strategy:**
- Unit tests for skeleton loader, combat system, player state
- Manual testing for visual positioning and gameplay feel
- Use existing test patterns (Vitest, mock Phaser objects)

**YAGNI Reminders:**
- No different weapon types yet (just club)
- No knockback effects
- No screen shake
- No combo system
- These can be added later if needed

**DRY Reminders:**
- Reuse existing patterns: Player cooldowns, CombatSystem hit checks
- Skeleton data loader is utility, not entity-specific
- Attack state machine similar to dodge roll pattern

**Commit Frequency:**
- Commit after each passing test
- Commit after each integration step
- Use conventional commit format: `feat:`, `test:`, `fix:`, `polish:`
