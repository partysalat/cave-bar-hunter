# Compy Pack Hunt Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the first hunt (Compy Pack) with 5 coordinated enemies in Dense Jungle arena, full intro/victory sequences, and session integration.

**Architecture:** Create HuntScene for hunt lifecycle management, CompyAI for individual state machine, PackCoordinator for swarm tactics. Extend existing Dinosaur.js, integrate with SessionManager for persistence. Use placeholder sprites initially, replace with PixelLab-generated assets later.

**Tech Stack:** Phaser 3, Vitest, ES6 modules, existing coordinate/combat systems

**Design Reference:** `docs/plans/2026-02-12-compy-pack-hunt-design.md`

---

## Task 1: Create HuntScene Foundation

**Files:**
- Create: `src/scenes/HuntScene.js`
- Test: `tests/scenes/HuntScene.test.js`

**Step 1: Write the failing test**

```javascript
// tests/scenes/HuntScene.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import HuntScene from '../../src/scenes/HuntScene.js';

describe('HuntScene', () => {
    let scene;
    let mockGame;

    beforeEach(() => {
        // Mock Phaser.Scene
        mockGame = {
            scene: {
                add: vi.fn()
            }
        };
        scene = new HuntScene();
        scene.game = mockGame;
    });

    it('should create with key "HuntScene"', () => {
        expect(scene.sys.config).toBe('HuntScene');
    });

    it('should initialize with null players and enemies', () => {
        scene.create();
        expect(scene.players).toEqual([]);
        expect(scene.compys).toEqual([]);
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- HuntScene.test.js`
Expected: FAIL with "Cannot find module '../../src/scenes/HuntScene.js'"

**Step 3: Write minimal implementation**

```javascript
// src/scenes/HuntScene.js
import Phaser from 'phaser';

/**
 * HuntScene - Main combat arena for dinosaur hunts
 *
 * Manages:
 * - Arena environment (jungle, tar pits, etc.)
 * - Enemy spawning and AI
 * - Combat flow (intro → fight → victory/failure)
 * - Transitions to/from CaveBarScene
 */
export default class HuntScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HuntScene' });
    }

    create() {
        console.log('🎯 Hunt Scene created');

        // Initialize arrays
        this.players = [];
        this.compys = [];
        this.projectiles = [];
    }

    update(time, delta) {
        // Update loop - to be implemented
    }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- HuntScene.test.js`
Expected: PASS (basic structure works)

**Step 5: Commit**

```bash
git add tests/scenes/HuntScene.test.js src/scenes/HuntScene.js
git commit -m "feat: create HuntScene foundation

- Add basic scene structure with players/compys arrays
- Add initial test coverage
- Prepare for arena and AI implementation"
```

---

## Task 2: Add Dense Jungle Arena Floor

**Files:**
- Modify: `src/scenes/HuntScene.js`
- Test: `tests/scenes/HuntScene.test.js`

**Step 1: Write the failing test**

```javascript
// tests/scenes/HuntScene.test.js (add to existing describe block)
it('should build jungle floor grid', () => {
    // Mock Phaser graphics
    const mockGraphics = {
        fillStyle: vi.fn().returnThis(),
        fillRect: vi.fn().returnThis(),
        lineStyle: vi.fn().returnThis(),
        strokeRect: vi.fn().returnThis()
    };
    scene.add = {
        graphics: vi.fn(() => mockGraphics),
        sprite: vi.fn()
    };

    scene.buildJungleFloor();

    expect(scene.add.graphics).toHaveBeenCalled();
    expect(mockGraphics.fillStyle).toHaveBeenCalled();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- HuntScene.test.js -t "should build jungle floor"`
Expected: FAIL with "scene.buildJungleFloor is not a function"

**Step 3: Write implementation**

```javascript
// src/scenes/HuntScene.js (add to class)
import { worldToScreen, calculateDepth } from '../systems/CoordinateSystem.js';

/**
 * Build Dense Jungle floor tiles
 * Arena: 30×25 world units
 * Tile size: 0.64 world units (matching cave bar)
 */
buildJungleFloor() {
    console.log('🏗️  Building jungle floor...');

    const tileSize = 0.64;
    const arenaWidth = 30;
    const arenaHeight = 25;

    let tileCount = 0;

    // Create floor grid
    for (let x = 0; x < arenaWidth; x += tileSize) {
        for (let y = 0; y < arenaHeight; y += tileSize) {
            const worldX = x;
            const worldY = y;
            const worldZ = 0;

            const screenPos = worldToScreen(worldX, worldY, worldZ);
            const depth = calculateDepth(worldY, worldZ);

            // Use placeholder: green rectangle for grass
            const graphics = this.add.graphics();
            graphics.fillStyle(0x3a5f3a, 1); // Dark green
            graphics.fillRect(screenPos.x - 32, screenPos.y - 16, 64, 32);
            graphics.setDepth(depth);

            tileCount++;
        }
    }

    console.log(`✅ Jungle floor built (${tileCount} tiles)`);
}
```

**Step 4: Update create() to call buildJungleFloor()**

```javascript
// src/scenes/HuntScene.js (modify create method)
create() {
    console.log('🎯 Hunt Scene created');

    // Initialize arrays
    this.players = [];
    this.compys = [];
    this.projectiles = [];

    // Build arena
    this.buildJungleFloor();
}
```

**Step 5: Run test to verify it passes**

Run: `npm test -- HuntScene.test.js -t "should build jungle floor"`
Expected: PASS

**Step 6: Commit**

```bash
git add src/scenes/HuntScene.js tests/scenes/HuntScene.test.js
git commit -m "feat: add jungle floor grid to HuntScene

- Build 30×25 tile floor using placeholder graphics
- Use existing coordinate system for isometric rendering
- 0.64 tile size matches cave bar convention"
```

---

## Task 3: Add Tree Props with Collision

**Files:**
- Modify: `src/scenes/HuntScene.js`
- Test: `tests/scenes/HuntScene.test.js`

**Step 1: Write the failing test**

```javascript
// tests/scenes/HuntScene.test.js (add to existing describe block)
it('should place 8 tree props with collision zones', () => {
    scene.add = {
        graphics: vi.fn(),
        circle: vi.fn(),
        sprite: vi.fn()
    };

    scene.addTrees();

    expect(scene.trees).toBeDefined();
    expect(scene.trees.length).toBe(8);
    expect(scene.trees[0]).toHaveProperty('worldX');
    expect(scene.trees[0]).toHaveProperty('worldY');
    expect(scene.trees[0]).toHaveProperty('radius');
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- HuntScene.test.js -t "should place 8 tree"`
Expected: FAIL with "scene.addTrees is not a function"

**Step 3: Write implementation**

```javascript
// src/scenes/HuntScene.js (add method)
/**
 * Add tree props with collision
 * Trees block line-of-sight and projectiles
 * 8 trees scattered around arena (per design: 6-8)
 */
addTrees() {
    console.log('🏗️  Adding tree props...');

    this.trees = [];

    // Tree positions (scattered around arena, avoiding center spawn)
    const treePositions = [
        { x: 5, y: 5, z: 0 },      // NW
        { x: 22, y: 8, z: 0 },     // NE
        { x: 7, y: 12, z: 0 },     // W
        { x: 20, y: 15, z: 0 },    // E
        { x: 10, y: 20, z: 0 },    // SW
        { x: 18, y: 22, z: 0 },    // SE
        { x: 15, y: 3, z: 0 },     // N
        { x: 12, y: 18, z: 0 }     // S
    ];

    const treeRadius = 1.5; // Per design

    treePositions.forEach(pos => {
        const screenPos = worldToScreen(pos.x, pos.y, pos.z);
        const depth = calculateDepth(pos.y, pos.z);

        // Placeholder: Brown circle for tree trunk
        const trunk = this.add.circle(screenPos.x, screenPos.y, 40, 0x4a3728);
        trunk.setDepth(depth);

        // Store tree data for collision
        this.trees.push({
            worldX: pos.x,
            worldY: pos.y,
            worldZ: pos.z,
            radius: treeRadius,
            sprite: trunk
        });
    });

    console.log(`✅ Added ${this.trees.length} trees`);
}
```

**Step 4: Update create() to call addTrees()**

```javascript
// src/scenes/HuntScene.js (modify create method)
create() {
    console.log('🎯 Hunt Scene created');

    // Initialize arrays
    this.players = [];
    this.compys = [];
    this.projectiles = [];

    // Build arena
    this.buildJungleFloor();
    this.addTrees();
}
```

**Step 5: Run test to verify it passes**

Run: `npm test -- HuntScene.test.js -t "should place 8 tree"`
Expected: PASS

**Step 6: Commit**

```bash
git add src/scenes/HuntScene.js tests/scenes/HuntScene.test.js
git commit -m "feat: add tree props with collision zones

- Place 8 trees around arena (avoiding center spawn)
- Store tree data for collision detection
- Use placeholder brown circles for trunks
- 1.5 world unit radius per design spec"
```

---

## Task 4: Spawn Players in Center Formation

**Files:**
- Modify: `src/scenes/HuntScene.js`
- Test: `tests/scenes/HuntScene.test.js`

**Step 1: Write the failing test**

```javascript
// tests/scenes/HuntScene.test.js (add to existing describe block)
import Player from '../../src/entities/Player.js';

vi.mock('../../src/entities/Player.js', () => {
    return {
        default: vi.fn().mockImplementation((scene, playerIndex, x, y, z) => ({
            playerIndex,
            worldX: x,
            worldY: y,
            worldZ: z,
            update: vi.fn()
        }))
    };
});

it('should spawn 4 players in center formation', () => {
    scene.spawnPlayers();

    expect(scene.players.length).toBe(4);
    expect(scene.players[0].worldX).toBeCloseTo(15, 1); // Center
    expect(scene.players[0].worldY).toBeCloseTo(12.5, 1); // Center
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- HuntScene.test.js -t "should spawn 4 players"`
Expected: FAIL with "scene.spawnPlayers is not a function"

**Step 3: Write implementation**

```javascript
// src/scenes/HuntScene.js (add import and method)
import Player from '../entities/Player.js';
import InputManager from '../systems/InputManager.js';
import { gameSession } from '../systems/SessionManager.js';

/**
 * Spawn players in center formation (2×2 grid)
 * Arena center: (15, 12.5) for 30×25 arena
 * Spacing: 2 world units apart
 */
spawnPlayers() {
    console.log('🏗️  Spawning players...');

    const centerX = 15;
    const centerY = 12.5;
    const spacing = 2;

    // 2×2 grid formation
    const positions = [
        { x: centerX - spacing / 2, y: centerY - spacing / 2 }, // Player 0 (red) - NW
        { x: centerX + spacing / 2, y: centerY - spacing / 2 }, // Player 1 (blue) - NE
        { x: centerX - spacing / 2, y: centerY + spacing / 2 }, // Player 2 (yellow) - SW
        { x: centerX + spacing / 2, y: centerY + spacing / 2 }  // Player 3 (green) - SE
    ];

    for (let i = 0; i < 4; i++) {
        const pos = positions[i];
        const player = new Player(this, i, pos.x, pos.y, 0);

        // Set hunt speed (faster than cave bar)
        player.moveSpeed = 6; // Per design: 6 world units/sec

        this.players.push(player);
    }

    console.log(`✅ Spawned ${this.players.length} players`);
}
```

**Step 4: Update create() and preload()**

```javascript
// src/scenes/HuntScene.js (add preload method)
preload() {
    // Load player sprite sheets
    const playerColors = ['red', 'blue', 'yellow', 'green'];
    playerColors.forEach((color, index) => {
        this.load.atlas(
            `player-${index}`,
            `/assets/generated/spritesheets/${color}-hero.png`,
            `/assets/generated/spritesheets/${color}-hero.json`
        );
    });
}

create() {
    console.log('🎯 Hunt Scene created');

    // Initialize systems
    this.inputManager = new InputManager(this);
    this.inputManager.setupKeyboard(); // Testing fallback

    // Initialize arrays
    this.players = [];
    this.compys = [];
    this.projectiles = [];

    // Build arena
    this.buildJungleFloor();
    this.addTrees();

    // Spawn entities
    this.spawnPlayers();
}
```

**Step 5: Run test to verify it passes**

Run: `npm test -- HuntScene.test.js -t "should spawn 4 players"`
Expected: PASS

**Step 6: Commit**

```bash
git add src/scenes/HuntScene.js tests/scenes/HuntScene.test.js
git commit -m "feat: spawn players in center formation

- Spawn 4 players in 2×2 grid at arena center
- Set hunt speed to 6 world units/sec
- Load player sprite sheets in preload
- Initialize InputManager for testing"
```

---

## Task 5: Create CompyAI State Machine Foundation

**Files:**
- Create: `src/ai/CompyAI.js`
- Test: `tests/ai/CompyAI.test.js`

**Step 1: Write the failing test**

```javascript
// tests/ai/CompyAI.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import CompyAI from '../../src/ai/CompyAI.js';

describe('CompyAI', () => {
    let ai;
    let mockCompy;
    let mockPlayers;

    beforeEach(() => {
        mockCompy = {
            worldX: 20,
            worldY: 15,
            worldZ: 0,
            velocity: { x: 0, y: 0, z: 0 },
            health: 20,
            maxHealth: 20
        };

        mockPlayers = [
            { worldX: 15, worldY: 12, worldZ: 0, health: 2 }
        ];

        ai = new CompyAI(mockCompy, [], mockPlayers);
    });

    it('should initialize in CIRCLING state', () => {
        expect(ai.state).toBe('CIRCLING');
        expect(ai.compy).toBe(mockCompy);
        expect(ai.players).toBe(mockPlayers);
    });

    it('should have null target initially', () => {
        expect(ai.target).toBeNull();
    });

    it('should have attack cooldown at 0', () => {
        expect(ai.attackCooldown).toBe(0);
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- CompyAI.test.js`
Expected: FAIL with "Cannot find module '../../src/ai/CompyAI.js'"

**Step 3: Write minimal implementation**

```javascript
// src/ai/CompyAI.js
/**
 * CompyAI - Individual Compy state machine
 *
 * States: CIRCLING → LUNGING → BITING → RETREATING
 *
 * Design reference: docs/plans/2026-02-12-compy-pack-hunt-design.md
 */
export default class CompyAI {
    /**
     * @param {Object} compy - The Compy dinosaur entity
     * @param {Array} allCompys - All Compys in pack (for coordination)
     * @param {Array} players - All player entities
     */
    constructor(compy, allCompys, players) {
        this.compy = compy;
        this.packMembers = allCompys;
        this.players = players;

        // State machine
        this.state = 'CIRCLING';
        this.target = null;

        // Attack timing
        this.attackCooldown = 0; // Seconds until can attack again
        this.stateTimer = 0; // Time in current state

        // Movement params
        this.orbitRadius = 4; // 3-5 world units per design
        this.orbitAngle = Math.random() * Math.PI * 2; // Random start angle
    }

    /**
     * Main update loop - called each frame
     * @param {number} delta - Time since last frame (ms)
     */
    update(delta) {
        const deltaSeconds = delta / 1000;

        // Decrement cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaSeconds;
        }

        // Increment state timer
        this.stateTimer += deltaSeconds;

        // State machine
        switch (this.state) {
            case 'CIRCLING':
                this.updateCircling(deltaSeconds);
                break;
            case 'LUNGING':
                this.updateLunging(deltaSeconds);
                break;
            case 'BITING':
                this.updateBiting(deltaSeconds);
                break;
            case 'RETREATING':
                this.updateRetreating(deltaSeconds);
                break;
        }
    }

    /**
     * Placeholder state methods - to be implemented
     */
    updateCircling(delta) {
        // TODO: Implement circling behavior
    }

    updateLunging(delta) {
        // TODO: Implement lunge attack
    }

    updateBiting(delta) {
        // TODO: Implement bite damage
    }

    updateRetreating(delta) {
        // TODO: Implement retreat behavior
    }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- CompyAI.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/ai/CompyAI.test.js src/ai/CompyAI.js
git commit -m "feat: create CompyAI state machine foundation

- Add state machine with CIRCLING/LUNGING/BITING/RETREATING
- Initialize with compy, pack members, and players
- Add attack cooldown and state timer tracking
- Placeholder state update methods"
```

---

## Task 6: Implement CIRCLING State

**Files:**
- Modify: `src/ai/CompyAI.js`
- Test: `tests/ai/CompyAI.test.js`

**Step 1: Write the failing test**

```javascript
// tests/ai/CompyAI.test.js (add to describe block)
it('should orbit target player in CIRCLING state', () => {
    ai.target = mockPlayers[0];
    ai.state = 'CIRCLING';

    const initialAngle = ai.orbitAngle;
    ai.update(100); // 100ms

    // Angle should increase (orbiting)
    expect(ai.orbitAngle).toBeGreaterThan(initialAngle);

    // Compy velocity should be set
    expect(mockCompy.velocity.x).not.toBe(0);
    expect(mockCompy.velocity.y).not.toBe(0);
});

it('should select target if none exists', () => {
    ai.target = null;
    ai.update(100);

    // Should pick a target
    expect(ai.target).not.toBeNull();
    expect(mockPlayers).toContain(ai.target);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- CompyAI.test.js -t "CIRCLING"`
Expected: FAIL with "Expected velocity to be set"

**Step 3: Implement CIRCLING state**

```javascript
// src/ai/CompyAI.js (replace updateCircling method)
/**
 * CIRCLING state - orbit target player at 3-5 unit radius
 * Constantly repositions to flanks/rear
 * Transitions to LUNGING when attack opportunity arises
 */
updateCircling(delta) {
    // Select target if none
    if (!this.target || this.target.isDead) {
        this.target = this.selectTarget();
    }

    if (!this.target) {
        // No valid target, stay idle
        this.compy.velocity.x = 0;
        this.compy.velocity.y = 0;
        return;
    }

    // Orbit around target
    this.orbitAngle += delta * 0.5; // Rotation speed (radians/sec)

    // Calculate desired position on orbit
    const desiredX = this.target.worldX + Math.cos(this.orbitAngle) * this.orbitRadius;
    const desiredY = this.target.worldY + Math.sin(this.orbitAngle) * this.orbitRadius;

    // Move toward desired position
    const dx = desiredX - this.compy.worldX;
    const dy = desiredY - this.compy.worldY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0.1) {
        const speed = 6; // Per design: 6 world units/sec
        this.compy.velocity.x = (dx / distance) * speed;
        this.compy.velocity.y = (dy / distance) * speed;
    } else {
        this.compy.velocity.x = 0;
        this.compy.velocity.y = 0;
    }

    // Check if should attack (cooldown ready, random chance)
    if (this.attackCooldown <= 0 && Math.random() < 0.02) {
        this.transitionToLunging();
    }
}

/**
 * Select target player
 * For now: pick closest player (pack coordination will improve this)
 */
selectTarget() {
    const alivePlayers = this.players.filter(p => !p.isDead);
    if (alivePlayers.length === 0) return null;

    // Find closest player
    let closest = alivePlayers[0];
    let minDist = this.getDistanceTo(closest);

    for (const player of alivePlayers) {
        const dist = this.getDistanceTo(player);
        if (dist < minDist) {
            minDist = dist;
            closest = player;
        }
    }

    return closest;
}

/**
 * Calculate 2D distance to entity
 */
getDistanceTo(entity) {
    const dx = entity.worldX - this.compy.worldX;
    const dy = entity.worldY - this.compy.worldY;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Transition to LUNGING state
 */
transitionToLunging() {
    this.state = 'LUNGING';
    this.stateTimer = 0;
    console.log('Compy lunging at target!');
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- CompyAI.test.js -t "CIRCLING"`
Expected: PASS

**Step 5: Commit**

```bash
git add src/ai/CompyAI.js tests/ai/CompyAI.test.js
git commit -m "feat: implement CompyAI CIRCLING state

- Orbit target player at 3-5 unit radius
- Select closest player as target
- Rotate around target at 0.5 rad/sec
- Transition to LUNGING randomly when cooldown ready"
```

---

## Task 7: Implement LUNGING State

**Files:**
- Modify: `src/ai/CompyAI.js`
- Test: `tests/ai/CompyAI.test.js`

**Step 1: Write the failing test**

```javascript
// tests/ai/CompyAI.test.js (add to describe block)
it('should telegraph for 0.5s in LUNGING state', () => {
    ai.state = 'LUNGING';
    ai.stateTimer = 0;
    ai.target = mockPlayers[0];

    ai.update(300); // 300ms into lunge

    // Still telegraphing (< 0.5s)
    expect(ai.state).toBe('LUNGING');
    expect(ai.stateTimer).toBeCloseTo(0.3, 1);
});

it('should charge after telegraph completes', () => {
    ai.state = 'LUNGING';
    ai.stateTimer = 0.6; // Past telegraph
    ai.target = mockPlayers[0];

    ai.update(100);

    // Should be charging at 12 units/sec
    const speed = Math.sqrt(
        mockCompy.velocity.x ** 2 + mockCompy.velocity.y ** 2
    );
    expect(speed).toBeCloseTo(12, 0);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- CompyAI.test.js -t "LUNGING"`
Expected: FAIL with "Expected charging speed"

**Step 3: Implement LUNGING state**

```javascript
// src/ai/CompyAI.js (replace updateLunging method)
/**
 * LUNGING state - telegraph (0.5s) then charge (0.5s)
 * Telegraph: Crouch, red glow (visual handled by renderer)
 * Charge: Rush at 12 units/sec toward player
 * Transition to BITING when reaches player or after 1s total
 */
updateLunging(delta) {
    const TELEGRAPH_DURATION = 0.5;
    const LUNGE_DURATION = 1.0;

    if (!this.target) {
        // Lost target, return to circling
        this.transitionToCircling();
        return;
    }

    if (this.stateTimer < TELEGRAPH_DURATION) {
        // Telegraph phase - freeze in place, face target
        this.compy.velocity.x = 0;
        this.compy.velocity.y = 0;

        // Store lunge direction for charge phase
        const dx = this.target.worldX - this.compy.worldX;
        const dy = this.target.worldY - this.compy.worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        this.lungeDirX = dx / distance;
        this.lungeDirY = dy / distance;
    } else {
        // Charge phase - rush toward target at 12 units/sec
        const LUNGE_SPEED = 12;
        this.compy.velocity.x = this.lungeDirX * LUNGE_SPEED;
        this.compy.velocity.y = this.lungeDirY * LUNGE_SPEED;

        // Check if reached player
        const distToTarget = this.getDistanceTo(this.target);
        if (distToTarget <= 0.5) { // Attack range per design
            this.transitionToBiting();
            return;
        }
    }

    // Timeout after 1 second
    if (this.stateTimer >= LUNGE_DURATION) {
        // Missed - retreat
        this.transitionToRetreating();
    }
}

transitionToBiting() {
    this.state = 'BITING';
    this.stateTimer = 0;
}

transitionToRetreating() {
    this.state = 'RETREATING';
    this.stateTimer = 0;
}

transitionToCircling() {
    this.state = 'CIRCLING';
    this.stateTimer = 0;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- CompyAI.test.js -t "LUNGING"`
Expected: PASS

**Step 5: Commit**

```bash
git add src/ai/CompyAI.js tests/ai/CompyAI.test.js
git commit -m "feat: implement CompyAI LUNGING state

- Telegraph for 0.5s (freeze, face target)
- Charge for 0.5s at 12 units/sec
- Transition to BITING when reaches player (0.5 unit range)
- Transition to RETREATING on timeout (1s total)"
```

---

## Task 8: Implement BITING State

**Files:**
- Modify: `src/ai/CompyAI.js`
- Test: `tests/ai/CompyAI.test.js`

**Step 1: Write the failing test**

```javascript
// tests/ai/CompyAI.test.js (add to describe block)
it('should deal 0.5 damage in BITING state', () => {
    ai.state = 'BITING';
    ai.stateTimer = 0;
    ai.target = mockPlayers[0];
    mockPlayers[0].takeDamage = vi.fn();

    ai.update(100);

    // Should deal damage once
    expect(mockPlayers[0].takeDamage).toHaveBeenCalledWith(0.5);
});

it('should transition to RETREATING after 0.5s', () => {
    ai.state = 'BITING';
    ai.stateTimer = 0.6;

    ai.update(100);

    expect(ai.state).toBe('RETREATING');
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- CompyAI.test.js -t "BITING"`
Expected: FAIL with "Expected takeDamage to be called"

**Step 3: Implement BITING state**

```javascript
// src/ai/CompyAI.js (replace updateBiting method)
/**
 * BITING state - deal damage and brief recovery
 * Duration: 0.5s
 * Damage: 0.5 (4 hits to down player)
 * Recovery: 0.3s cannot move after bite
 */
updateBiting(delta) {
    const BITE_DURATION = 0.5;
    const RECOVERY_DURATION = 0.3;

    // Freeze during bite
    this.compy.velocity.x = 0;
    this.compy.velocity.y = 0;

    // Deal damage on first frame only
    if (this.stateTimer < delta && this.target && !this.target.isDead) {
        // Check if still in range
        const distToTarget = this.getDistanceTo(this.target);
        if (distToTarget <= 0.5) {
            this.target.takeDamage(0.5); // Per design: 0.5 damage
            console.log('Compy bit player for 0.5 damage!');
        }
    }

    // Transition to retreating after bite completes
    if (this.stateTimer >= BITE_DURATION) {
        this.transitionToRetreating();
        this.attackCooldown = 2.0; // 2 second cooldown per design
    }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- CompyAI.test.js -t "BITING"`
Expected: PASS

**Step 5: Commit**

```bash
git add src/ai/CompyAI.js tests/ai/CompyAI.test.js
git commit -m "feat: implement CompyAI BITING state

- Deal 0.5 damage to player in range
- Freeze during bite animation (0.5s)
- Transition to RETREATING after bite
- Set 2 second attack cooldown"
```

---

## Task 9: Implement RETREATING State

**Files:**
- Modify: `src/ai/CompyAI.js`
- Test: `tests/ai/CompyAI.test.js`

**Step 1: Write the failing test**

```javascript
// tests/ai/CompyAI.test.js (add to describe block)
it('should back away in RETREATING state', () => {
    ai.state = 'RETREATING';
    ai.stateTimer = 0;
    ai.target = mockPlayers[0];

    // Store initial position
    const initialX = mockCompy.worldX;
    const initialY = mockCompy.worldY;

    ai.update(100);

    // Should be moving away from target
    const dx = mockCompy.velocity.x;
    const dy = mockCompy.velocity.y;
    const targetDx = mockPlayers[0].worldX - initialX;
    const targetDy = mockPlayers[0].worldY - initialY;

    // Dot product should be negative (moving opposite direction)
    const dotProduct = dx * targetDx + dy * targetDy;
    expect(dotProduct).toBeLessThan(0);
});

it('should return to CIRCLING after 2-3 seconds', () => {
    ai.state = 'RETREATING';
    ai.stateTimer = 2.5;

    ai.update(100);

    expect(ai.state).toBe('CIRCLING');
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- CompyAI.test.js -t "RETREATING"`
Expected: FAIL with "Expected negative dot product"

**Step 3: Implement RETREATING state**

```javascript
// src/ai/CompyAI.js (replace updateRetreating method)
/**
 * RETREATING state - back away 4-5 units
 * Duration: 2-3 seconds
 * Injured Compys (< 50% HP) retreat more often
 */
updateRetreating(delta) {
    const RETREAT_DURATION = 2.5; // Average of 2-3 seconds
    const RETREAT_SPEED = 4; // Slower than normal movement

    if (!this.target) {
        // No target, just stop
        this.compy.velocity.x = 0;
        this.compy.velocity.y = 0;
        this.transitionToCircling();
        return;
    }

    // Move away from target
    const dx = this.compy.worldX - this.target.worldX;
    const dy = this.compy.worldY - this.target.worldY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        this.compy.velocity.x = (dx / distance) * RETREAT_SPEED;
        this.compy.velocity.y = (dy / distance) * RETREAT_SPEED;
    }

    // Return to circling after duration
    if (this.stateTimer >= RETREAT_DURATION) {
        this.transitionToCircling();
    }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- CompyAI.test.js -t "RETREATING"`
Expected: PASS

**Step 5: Commit**

```bash
git add src/ai/CompyAI.js tests/ai/CompyAI.test.js
git commit -m "feat: implement CompyAI RETREATING state

- Back away from target at 4 units/sec
- Duration 2.5 seconds average
- Return to CIRCLING after retreat
- Complete basic state machine cycle"
```

---

## Task 10: Integrate CompyAI with Dinosaur Entity

**Files:**
- Modify: `src/entities/Dinosaur.js`
- Modify: `src/scenes/HuntScene.js`
- Test: `tests/entities/Dinosaur.test.js`

**Step 1: Write the failing test**

```javascript
// tests/entities/Dinosaur.test.js (add to existing describe block or create new)
import CompyAI from '../../src/ai/CompyAI.js';

vi.mock('../../src/ai/CompyAI.js', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            update: vi.fn(),
            state: 'CIRCLING'
        }))
    };
});

it('should create AI controller for compy type', () => {
    const dino = new Dinosaur(mockScene, 'compy', 10, 10, 0);
    dino.initializeAI([], [mockPlayer]);

    expect(dino.ai).toBeDefined();
    expect(CompyAI).toHaveBeenCalled();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- Dinosaur.test.js -t "AI controller"`
Expected: FAIL with "dino.initializeAI is not a function"

**Step 3: Add AI initialization to Dinosaur**

```javascript
// src/entities/Dinosaur.js (add method and modify constructor)
import CompyAI from '../ai/CompyAI.js';

constructor(scene, type, worldX, worldY, worldZ) {
    super(scene, worldX, worldY, worldZ);

    this.id = `dino-${Date.now()}-${Math.random()}`;
    this.type = type;
    this.health = this.getHealthForType(type);
    this.maxHealth = this.health;
    this.isDead = false;

    // Collision
    this.radius = this.getRadiusForType(type);

    // Weak points
    this.weakPoints = this.createWeakPointsForType(type);

    // AI (initialized separately)
    this.ai = null;

    // Temp visualization
    const color = type === 'compy' ? 0xff00ff : 0x00ffff;
    this.sprite.setTint(color);
}

/**
 * Initialize AI controller
 * @param {Array} allDinosaurs - All dinosaurs in scene (for pack coordination)
 * @param {Array} players - All player entities
 */
initializeAI(allDinosaurs, players) {
    if (this.type === 'compy') {
        this.ai = new CompyAI(this, allDinosaurs, players);
        console.log('CompyAI initialized');
    }
    // Other dinosaur types will have different AI
}

/**
 * Update with AI
 */
update(delta) {
    super.update(delta);

    // Update weak point positions
    for (const wp of this.weakPoints) {
        wp.updatePosition(this.worldX, this.worldY, this.worldZ);
    }

    // Update AI if present
    if (this.ai && !this.isDead) {
        this.ai.update(delta);
    }
}
```

**Step 4: Spawn Compys in HuntScene**

```javascript
// src/scenes/HuntScene.js (add method)
import Dinosaur from '../entities/Dinosaur.js';

/**
 * Spawn 5 Compys around perimeter
 * Positions: N, E, S (×2), W
 */
spawnCompys() {
    console.log('🏗️  Spawning Compys...');

    // Perimeter spawn positions (per design)
    const compyPositions = [
        { x: 15, y: 3 },   // North
        { x: 25, y: 12 },  // East
        { x: 12, y: 22 },  // South 1
        { x: 18, y: 22 },  // South 2
        { x: 5, y: 12 }    // West
    ];

    const playerCount = this.players.filter(p => !p.isDead).length;
    const healthScaling = [1.0, 1.2, 1.3, 1.4]; // Per design
    const baseHealth = 20;
    const scaledHealth = baseHealth * healthScaling[playerCount - 1];

    compyPositions.forEach(pos => {
        const compy = new Dinosaur(this, 'compy', pos.x, pos.y, 0);
        compy.health = scaledHealth;
        compy.maxHealth = scaledHealth;
        this.compys.push(compy);
    });

    // Initialize AI for all Compys
    this.compys.forEach(compy => {
        compy.initializeAI(this.compys, this.players);
    });

    console.log(`✅ Spawned ${this.compys.length} Compys (${scaledHealth} HP each)`);
}
```

**Step 5: Update HuntScene create()**

```javascript
// src/scenes/HuntScene.js (modify create)
create() {
    console.log('🎯 Hunt Scene created');

    // Initialize systems
    this.inputManager = new InputManager(this);
    this.inputManager.setupKeyboard();

    // Initialize arrays
    this.players = [];
    this.compys = [];
    this.projectiles = [];

    // Build arena
    this.buildJungleFloor();
    this.addTrees();

    // Spawn entities
    this.spawnPlayers();
    this.spawnCompys();
}
```

**Step 6: Run test to verify it passes**

Run: `npm test -- Dinosaur.test.js -t "AI controller"`
Expected: PASS

**Step 7: Commit**

```bash
git add src/entities/Dinosaur.js src/scenes/HuntScene.js tests/entities/Dinosaur.test.js
git commit -m "feat: integrate CompyAI with Dinosaur entity

- Add initializeAI method to Dinosaur
- Spawn 5 Compys around arena perimeter
- Apply health scaling based on player count
- Connect AI update loop to Dinosaur update"
```

---

## Task 11: Add Player Movement in HuntScene

**Files:**
- Modify: `src/scenes/HuntScene.js`

**Step 1: Implement player update loop**

```javascript
// src/scenes/HuntScene.js (add update method)
import { screenToWorldDirection } from '../systems/CoordinateSystem.js';
import { updatePlayerAnimation } from '../systems/SpriteDirectionSystem.js';

update(time, delta) {
    // Update players
    this.players.forEach((player, index) => {
        const input = this.inputManager.getPlayerInputWithKeyboard(index);

        if (input) {
            // Movement
            const screenDirection = this.inputManager.getDPadDirection(input.dpad);

            if (screenDirection.x !== 0 || screenDirection.y !== 0) {
                const worldDirection = screenToWorldDirection(screenDirection.x, screenDirection.y);
                const moveSpeed = player.moveSpeed;
                const deltaSeconds = delta / 1000;

                player.worldX += worldDirection.x * moveSpeed * deltaSeconds;
                player.worldY += worldDirection.y * moveSpeed * deltaSeconds;
                player.facingX = worldDirection.x;
                player.facingY = worldDirection.y;
                player.isMoving = true;
            } else {
                player.isMoving = false;
            }

            // Update animation
            updatePlayerAnimation(player.sprite, player.playerNumber, player.facingX, player.facingY, player.isMoving);
        }

        player.update(delta);
    });

    // Update Compys
    this.compys.forEach(compy => {
        if (!compy.isDead) {
            compy.update(delta);
        }
    });
}
```

**Step 2: Add player animations**

```javascript
// src/scenes/HuntScene.js (add to preload)
preload() {
    // Load player sprite sheets
    const playerColors = ['red', 'blue', 'yellow', 'green'];
    playerColors.forEach((color, index) => {
        this.load.atlas(
            `player-${index}`,
            `/assets/generated/spritesheets/${color}-hero.png`,
            `/assets/generated/spritesheets/${color}-hero.json`
        );
    });
}

create() {
    // ... existing code ...

    // Create player animations
    this.createPlayerAnimations();

    // ... rest of create ...
}

/**
 * Create player animations (idle, run) for all 4 players
 */
createPlayerAnimations() {
    const directions = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];

    for (let playerIndex = 0; playerIndex < 4; playerIndex++) {
        const atlasKey = `player-${playerIndex}`;

        directions.forEach(direction => {
            // Running animation
            this.anims.create({
                key: `player-${playerIndex}-run-${direction}`,
                frames: this.anims.generateFrameNames(atlasKey, {
                    prefix: `player-${playerIndex}-run-${direction}-`,
                    start: 0,
                    end: 7
                }),
                frameRate: 12,
                repeat: -1
            });

            // Idle animation
            this.anims.create({
                key: `player-${playerIndex}-idle-${direction}`,
                frames: this.anims.generateFrameNames(atlasKey, {
                    prefix: `player-${playerIndex}-idle-${direction}-`,
                    start: 0,
                    end: 3
                }),
                frameRate: 6,
                repeat: -1
            });
        });
    }

    console.log('✅ Player animations created');
}
```

**Step 3: Test manually**

Run: `npm run dev`
Navigate to HuntScene, verify:
- Players spawn in center
- 5 Compys spawn around perimeter
- Compys circle players
- Players can move with WASD

**Step 4: Commit**

```bash
git add src/scenes/HuntScene.js
git commit -m "feat: add player movement and Compy AI to HuntScene

- Implement update loop for player movement
- Create player animations (idle, run)
- Update Compys with AI each frame
- Test manually: players move, Compys circle"
```

---

## Task 12: Add HuntScene to Game Config

**Files:**
- Modify: `src/main.js`

**Step 1: Add HuntScene to game config**

```javascript
// src/main.js (add import and update config)
import HuntScene from './scenes/HuntScene.js';
import CaveBarScene from './scenes/CaveBarScene.js';
import TestScene from './scenes/TestScene.js';

const config = {
    type: Phaser.AUTO,
    width: 2560,
    height: 1440,
    backgroundColor: '#000000',
    scene: [CaveBarScene, HuntScene, TestScene], // Add HuntScene
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
```

**Step 2: Update CaveBarScene transition**

```javascript
// src/scenes/CaveBarScene.js (modify triggerExit method)
triggerExit() {
    console.log('🚪 Time\'s up! Exiting cave bar...');

    this.timerActive = false;

    // Save player state
    gameSession.savePlayerState(this.players);

    // Show exit message
    const camera = this.cameras.main;
    const exitText = this.add.text(
        camera.width / 2,
        camera.height / 2,
        'TIME\'S UP!\nGET READY FOR THE HUNT!',
        {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#ff9900',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 8
        }
    );
    exitText.setOrigin(0.5);
    exitText.setScrollFactor(0);
    exitText.setDepth(150000);

    // Transition to HuntScene (not TestScene)
    this.time.delayedCall(2000, () => {
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            console.log('🎯 Transitioning to HuntScene...');
            this.scene.start('HuntScene'); // Changed from TestScene
        });
    });
}
```

**Step 3: Test scene transitions**

Run: `npm run dev`
Verify:
- Game starts in CaveBarScene
- 30-second timer counts down
- "TIME'S UP!" appears
- Transitions to HuntScene
- Players and Compys spawn correctly

**Step 4: Commit**

```bash
git add src/main.js src/scenes/CaveBarScene.js
git commit -m "feat: integrate HuntScene into game flow

- Add HuntScene to game config
- Update CaveBarScene to transition to HuntScene
- Test full flow: CaveBar → Hunt"
```

---

## Task 13: Create PackCoordinator Foundation

**Files:**
- Create: `src/ai/PackCoordinator.js`
- Test: `tests/ai/PackCoordinator.test.js`

**Step 1: Write the failing test**

```javascript
// tests/ai/PackCoordinator.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PackCoordinator from '../../src/ai/PackCoordinator.js';

describe('PackCoordinator', () => {
    let coordinator;
    let mockCompys;
    let mockPlayers;

    beforeEach(() => {
        mockCompys = [
            { worldX: 20, worldY: 10, ai: { target: null } },
            { worldX: 10, worldY: 20, ai: { target: null } },
            { worldX: 20, worldY: 20, ai: { target: null } }
        ];

        mockPlayers = [
            { worldX: 15, worldY: 15, health: 2, maxHealth: 2 },
            { worldX: 25, worldY: 10, health: 1, maxHealth: 2 }
        ];

        coordinator = new PackCoordinator(mockCompys, mockPlayers);
    });

    it('should initialize with compys and players', () => {
        expect(coordinator.compys).toBe(mockCompys);
        expect(coordinator.players).toBe(mockPlayers);
    });

    it('should have empty attack queue', () => {
        expect(coordinator.attackQueue).toEqual([]);
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- PackCoordinator.test.js`
Expected: FAIL with "Cannot find module"

**Step 3: Write minimal implementation**

```javascript
// src/ai/PackCoordinator.js
/**
 * PackCoordinator - Manages pack-level AI for Compy swarm
 *
 * Coordinates 5 Compys to execute swarm tactics:
 * - Pincer attacks (2 Compys, front+back)
 * - Swarm attacks (3 Compys, rapid succession)
 * - Target prioritization (isolated, low-health players)
 *
 * Design reference: docs/plans/2026-02-12-compy-pack-hunt-design.md
 */
export default class PackCoordinator {
    /**
     * @param {Array} compys - All Compy dinosaur entities
     * @param {Array} players - All player entities
     */
    constructor(compys, players) {
        this.compys = compys;
        this.players = players;

        // Attack scheduling
        this.attackQueue = [];

        // Timers
        this.coordinationTimer = 0; // Time until next coordination check
        this.coordinationInterval = 2.0; // Check every 2 seconds
    }

    /**
     * Main update loop
     * @param {number} delta - Time since last frame (ms)
     */
    update(delta) {
        const deltaSeconds = delta / 1000;

        this.coordinationTimer -= deltaSeconds;

        if (this.coordinationTimer <= 0) {
            this.coordinationTimer = this.coordinationInterval;
            this.analyzeAndCoordinate();
        }

        // Process attack queue
        this.processAttackQueue(deltaSeconds);
    }

    /**
     * Analyze player positions and queue coordinated attacks
     */
    analyzeAndCoordinate() {
        // TODO: Implement coordination logic
    }

    /**
     * Process scheduled attacks
     */
    processAttackQueue(delta) {
        // TODO: Execute queued attacks
    }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- PackCoordinator.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/ai/PackCoordinator.test.js src/ai/PackCoordinator.js
git commit -m "feat: create PackCoordinator foundation

- Add coordinator for pack-level AI
- Initialize with compys and players
- Add attack queue and coordination timer
- Placeholder methods for coordination logic"
```

---

## Task 14: Implement Target Prioritization

**Files:**
- Modify: `src/ai/PackCoordinator.js`
- Test: `tests/ai/PackCoordinator.test.js`

**Step 1: Write the failing test**

```javascript
// tests/ai/PackCoordinator.test.js (add to describe block)
it('should prioritize isolated players', () => {
    // Player 1 at (25, 10) is far from Player 0 at (15, 15)
    const priorities = coordinator.getPriorityTargets();

    expect(priorities.isolated).toContain(mockPlayers[1]);
});

it('should prioritize low-health players', () => {
    const priorities = coordinator.getPriorityTargets();

    // Player 1 has 1 HP (low health)
    expect(priorities.lowHealth).toContain(mockPlayers[1]);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- PackCoordinator.test.js -t "prioritize"`
Expected: FAIL with "coordinator.getPriorityTargets is not a function"

**Step 3: Implement target prioritization**

```javascript
// src/ai/PackCoordinator.js (add method)
/**
 * Identify priority targets for pack coordination
 * @returns {Object} { isolated: [], lowHealth: [] }
 */
getPriorityTargets() {
    const alivePlayers = this.players.filter(p => !p.isDead);
    const priorities = {
        isolated: [],
        lowHealth: []
    };

    if (alivePlayers.length === 0) return priorities;

    // Find isolated players (>5 units from all teammates)
    alivePlayers.forEach(player => {
        let minDistToTeammate = Infinity;

        alivePlayers.forEach(other => {
            if (player === other) return;

            const dx = player.worldX - other.worldX;
            const dy = player.worldY - other.worldY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < minDistToTeammate) {
                minDistToTeammate = dist;
            }
        });

        // Isolated if >5 units from nearest teammate (per design)
        if (minDistToTeammate > 5) {
            priorities.isolated.push(player);
        }
    });

    // Find low-health players (1 HP = one hit from down)
    alivePlayers.forEach(player => {
        if (player.health <= 1) {
            priorities.lowHealth.push(player);
        }
    });

    return priorities;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- PackCoordinator.test.js -t "prioritize"`
Expected: PASS

**Step 5: Commit**

```bash
git add src/ai/PackCoordinator.js tests/ai/PackCoordinator.test.js
git commit -m "feat: implement target prioritization in PackCoordinator

- Identify isolated players (>5 units from teammates)
- Identify low-health players (≤1 HP)
- Return priority targets for pack coordination"
```

---

## Task 15: Implement Spread Targets Logic

**Files:**
- Modify: `src/ai/PackCoordinator.js`
- Test: `tests/ai/PackCoordinator.test.js`

**Step 1: Write the failing test**

```javascript
// tests/ai/PackCoordinator.test.js (add to describe block)
it('should assign different targets initially', () => {
    coordinator.assignTargets();

    // All Compys should have targets
    mockCompys.forEach(compy => {
        expect(compy.ai.target).not.toBeNull();
    });

    // Targets should be spread (not all same)
    const targets = mockCompys.map(c => c.ai.target);
    const uniqueTargets = new Set(targets);
    expect(uniqueTargets.size).toBeGreaterThan(1);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- PackCoordinator.test.js -t "assign different"`
Expected: FAIL with "coordinator.assignTargets is not a function"

**Step 3: Implement spread targets**

```javascript
// src/ai/PackCoordinator.js (add method)
/**
 * Assign targets to Compys
 * Strategy: Spread targets evenly, prioritize isolated/low-health
 */
assignTargets() {
    const alivePlayers = this.players.filter(p => !p.isDead);
    const aliveCompys = this.compys.filter(c => !c.isDead && c.ai);

    if (alivePlayers.length === 0 || aliveCompys.length === 0) return;

    const priorities = this.getPriorityTargets();

    // Assign 2-3 Compys to isolated players
    let compyIndex = 0;
    priorities.isolated.forEach(isolatedPlayer => {
        const compysToAssign = Math.min(2, aliveCompys.length - compyIndex);
        for (let i = 0; i < compysToAssign; i++) {
            if (compyIndex < aliveCompys.length) {
                aliveCompys[compyIndex].ai.target = isolatedPlayer;
                compyIndex++;
            }
        }
    });

    // Assign 2 Compys to low-health players
    priorities.lowHealth.forEach(lowHealthPlayer => {
        if (priorities.isolated.includes(lowHealthPlayer)) return; // Already assigned

        const compysToAssign = Math.min(2, aliveCompys.length - compyIndex);
        for (let i = 0; i < compysToAssign; i++) {
            if (compyIndex < aliveCompys.length) {
                aliveCompys[compyIndex].ai.target = lowHealthPlayer;
                compyIndex++;
            }
        }
    });

    // Spread remaining Compys evenly across players
    while (compyIndex < aliveCompys.length) {
        const playerIndex = compyIndex % alivePlayers.length;
        aliveCompys[compyIndex].ai.target = alivePlayers[playerIndex];
        compyIndex++;
    }
}
```

**Step 4: Update analyzeAndCoordinate to call assignTargets**

```javascript
// src/ai/PackCoordinator.js (replace analyzeAndCoordinate)
/**
 * Analyze player positions and assign targets
 */
analyzeAndCoordinate() {
    this.assignTargets();
    // TODO: Schedule coordinated attack patterns
}
```

**Step 5: Run test to verify it passes**

Run: `npm test -- PackCoordinator.test.js -t "assign different"`
Expected: PASS

**Step 6: Commit**

```bash
git add src/ai/PackCoordinator.js tests/ai/PackCoordinator.test.js
git commit -m "feat: implement spread targets logic

- Assign 2-3 Compys to isolated players
- Assign 2 Compys to low-health players
- Spread remaining Compys evenly across all players
- Update analyzeAndCoordinate to call assignTargets"
```

---

## Task 16: Integrate PackCoordinator with HuntScene

**Files:**
- Modify: `src/scenes/HuntScene.js`

**Step 1: Add PackCoordinator to HuntScene**

```javascript
// src/scenes/HuntScene.js (add import)
import PackCoordinator from '../ai/PackCoordinator.js';

create() {
    console.log('🎯 Hunt Scene created');

    // ... existing code ...

    // Spawn entities
    this.spawnPlayers();
    this.spawnCompys();

    // Initialize pack coordinator
    this.packCoordinator = new PackCoordinator(this.compys, this.players);
    console.log('✅ Pack coordinator initialized');
}
```

**Step 2: Update PackCoordinator each frame**

```javascript
// src/scenes/HuntScene.js (modify update method)
update(time, delta) {
    // Update pack coordinator (assigns targets)
    if (this.packCoordinator) {
        this.packCoordinator.update(delta);
    }

    // Update players
    this.players.forEach((player, index) => {
        // ... existing player update code ...
    });

    // Update Compys
    this.compys.forEach(compy => {
        if (!compy.isDead) {
            compy.update(delta);
        }
    });
}
```

**Step 3: Test manually**

Run: `npm run dev`
Verify:
- Compys target different players initially
- If a player moves away (>5 units), 2-3 Compys should switch to them
- Compys coordinate attacks

**Step 4: Commit**

```bash
git add src/scenes/HuntScene.js
git commit -m "feat: integrate PackCoordinator with HuntScene

- Initialize PackCoordinator with compys and players
- Update coordinator each frame before Compy AI
- Coordinator assigns targets based on priorities"
```

---

## Summary & Next Steps

**Completed Tasks (1-16):**
✅ HuntScene foundation
✅ Dense Jungle arena (floor, trees)
✅ Player spawning and movement
✅ CompyAI state machine (CIRCLING → LUNGING → BITING → RETREATING)
✅ Compy spawning with AI integration
✅ PackCoordinator foundation
✅ Target prioritization (isolated, low-health)
✅ Spread targets logic
✅ Full integration with HuntScene

**Remaining Work:**
- Pincer attack pattern (2 Compys, front+back)
- Swarm attack pattern (3 Compys, staggered)
- Hunt intro sequence (camera pan, title card)
- Victory sequence (score tally, celebration)
- Failure sequence (retry prompt)
- Transition back to CaveBarScene
- SessionManager integration
- Visual assets (Compy sprites, jungle tiles)

**To continue implementation, use:**
- `@superpowers:subagent-driven-development` (stay in this session, fresh subagent per task)
- OR open new session with `@superpowers:executing-plans` (parallel execution)

---

**End of Implementation Plan**