# Compy Pack Hunt Implementation Plan v2

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Implement the first hunt (Compy Pack) with 5 coordinated enemies in Dense Jungle arena, full intro/victory sequences, and session integration.

**Architecture:** Create HuntScene for hunt lifecycle management, CompyAI for individual state machine, PackCoordinator for swarm tactics. Extend existing Dinosaur.js, integrate with SessionManager for persistence. Use placeholder sprites initially, replace with PixelLab-generated assets later.

**Tech Stack:** Phaser 3, Vitest, ES6 modules, existing coordinate/combat systems

**Design Reference:** `docs/plans/2026-02-12-compy-pack-hunt-design.md`

---

## Phase 0: Discovery & Verification

### Task 0: Verify Dependencies and Create Test Fixtures

**Files:**
- Modify: `src/entities/Dinosaur.js`
- Create: `tests/fixtures/mockPhaser.js`
- Verify: Player.js, SpriteDirectionSystem.js, assets

**Step 1: Create comprehensive Phaser mocks**

```javascript
// tests/fixtures/mockPhaser.js
import { vi } from 'vitest';

/**
 * Creates a mock Phaser scene with all necessary game objects
 */
export function createMockScene() {
    const mockGraphics = {
        fillStyle: vi.fn().returnThis(),
        fillRect: vi.fn().returnThis(),
        lineStyle: vi.fn().returnThis(),
        strokeRect: vi.fn().returnThis(),
        setDepth: vi.fn().returnThis(),
        clear: vi.fn().returnThis()
    };

    const mockSprite = {
        x: 0,
        y: 0,
        setDepth: vi.fn().returnThis(),
        setTint: vi.fn().returnThis(),
        setAlpha: vi.fn().returnThis(),
        play: vi.fn().returnThis(),
        anims: {
            currentAnim: null,
            play: vi.fn()
        },
        destroy: vi.fn()
    };

    const scene = {
        add: {
            graphics: vi.fn(() => ({ ...mockGraphics })),
            sprite: vi.fn(() => ({ ...mockSprite })),
            circle: vi.fn(() => ({ ...mockSprite })),
            text: vi.fn(() => ({ ...mockSprite }))
        },
        anims: {
            create: vi.fn(),
            generateFrameNames: vi.fn((atlas, config) => {
                const frames = [];
                for (let i = config.start; i <= config.end; i++) {
                    frames.push({ key: `${config.prefix}${i}` });
                }
                return frames;
            })
        },
        load: {
            atlas: vi.fn()
        },
        time: {
            delayedCall: vi.fn()
        },
        cameras: {
            main: {
                fadeOut: vi.fn(),
                once: vi.fn()
            }
        }
    };

    return scene;
}

/**
 * Creates a mock player with realistic interface
 */
export function createMockPlayer(overrides = {}) {
    return {
        playerNumber: 0,
        worldX: 15,
        worldY: 12.5,
        worldZ: 0,
        velocity: { x: 0, y: 0, z: 0 },
        health: 2,
        maxHealth: 2,
        isDowned: false,
        isDead: false,
        takeDamage: vi.fn(function(damage) {
            this.health -= damage;
            if (this.health <= 0) {
                this.health = 0;
                this.isDowned = true;
            }
        }),
        update: vi.fn(),
        facingX: 0,
        facingY: 1,
        isMoving: false,
        moveSpeed: 8,
        radius: 0.5,
        sprite: {
            setDepth: vi.fn(),
            play: vi.fn(),
            anims: { currentAnim: null }
        },
        ...overrides
    };
}

/**
 * Creates a mock compy with realistic interface
 */
export function createMockCompy(overrides = {}) {
    return {
        type: 'compy',
        worldX: 20,
        worldY: 15,
        worldZ: 0,
        velocity: { x: 0, y: 0, z: 0 },
        health: 20,
        maxHealth: 20,
        isDead: false,
        ai: null,
        update: vi.fn(),
        takeDamage: vi.fn(function(damage) {
            this.health -= damage;
            if (this.health <= 0) {
                this.health = 0;
                this.isDead = true;
            }
        }),
        radius: 0.8,
        sprite: {
            setDepth: vi.fn(),
            setTint: vi.fn(),
            setAlpha: vi.fn()
        },
        ...overrides
    };
}
```

**Step 2: Extend Dinosaur.js with AI support**

```javascript
// src/entities/Dinosaur.js (add to existing class)

/**
 * Initialize AI controller
 * @param {Array} allDinosaurs - All dinosaurs in scene (for pack coordination)
 * @param {Array} players - All player entities
 */
initializeAI(allDinosaurs, players) {
    if (this.ai) {
        console.warn('AI already initialized for this dinosaur');
        return;
    }

    // Different AI for different types
    if (this.type === 'compy') {
        // Will import CompyAI in later task
        this.ai = null; // Placeholder
        console.log('Compy AI slot created');
    }
    // Other dinosaur types will have different AI
}

/**
 * Update with AI (modify existing update method)
 */
update(delta) {
    super.update(delta);

    // Update weak point positions relative to dinosaur
    for (const wp of this.weakPoints) {
        wp.updatePosition(this.worldX, this.worldY, this.worldZ);
    }

    // Update AI if present
    if (this.ai && !this.isDead) {
        this.ai.update(delta);
    }
}
```

**Step 3: Verify existing systems**

```bash
# Check Player.js has required methods
grep -n "takeDamage" src/entities/Player.js
grep -n "health" src/entities/Player.js

# Check spritesheets exist
ls -la assets/generated/spritesheets/

# Run existing tests to ensure nothing is broken
npm test
```

**Step 4: Write verification test**

```javascript
// tests/entities/Dinosaur.test.js (add to existing tests)
import { describe, it, expect, beforeEach } from 'vitest';
import Dinosaur from '../../src/entities/Dinosaur.js';
import { createMockScene } from '../fixtures/mockPhaser.js';

describe('Dinosaur AI Integration', () => {
    let scene;
    let dino;

    beforeEach(() => {
        scene = createMockScene();
        dino = new Dinosaur(scene, 'compy', 10, 10, 0);
    });

    it('should have initializeAI method', () => {
        expect(typeof dino.initializeAI).toBe('function');
    });

    it('should update AI if present', () => {
        const mockAI = {
            update: vi.fn()
        };
        dino.ai = mockAI;

        dino.update(100);

        expect(mockAI.update).toHaveBeenCalledWith(100);
    });

    it('should not call AI update if dinosaur is dead', () => {
        const mockAI = {
            update: vi.fn()
        };
        dino.ai = mockAI;
        dino.isDead = true;

        dino.update(100);

        expect(mockAI.update).not.toHaveBeenCalled();
    });
});
```

**Step 5: Run tests and commit**

```bash
npm test -- Dinosaur.test.js
git add src/entities/Dinosaur.js tests/fixtures/mockPhaser.js tests/entities/Dinosaur.test.js
git commit -m "chore: add AI integration support to Dinosaur

- Add initializeAI method for AI controller setup
- Modify update to call AI if present
- Create comprehensive test fixtures
- Verify Player.js interface compatibility
- Add AI integration tests"
```

---

## Phase 1: HuntScene Foundation

### Task 1: Create HuntScene with Proper Test Setup

**Files:**
- Create: `src/scenes/HuntScene.js`
- Create: `tests/scenes/HuntScene.test.js`

**Step 1: Write the failing test with real mocks**

```javascript
// tests/scenes/HuntScene.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import HuntScene from '../../src/scenes/HuntScene.js';
import { createMockScene } from '../fixtures/mockPhaser.js';

describe('HuntScene', () => {
    let scene;

    beforeEach(() => {
        scene = new HuntScene();
        // Copy mock methods to scene
        const mockScene = createMockScene();
        Object.assign(scene, mockScene);
    });

    it('should have key "HuntScene"', () => {
        expect(scene.constructor.name).toBe('HuntScene');
    });

    it('should initialize with empty arrays', () => {
        scene.create();
        expect(scene.players).toEqual([]);
        expect(scene.compys).toEqual([]);
        expect(scene.projectiles).toEqual([]);
        expect(scene.trees).toEqual([]);
    });

    it('should initialize hunt state', () => {
        scene.create();
        expect(scene.huntState).toBe('intro');
        expect(scene.huntTimer).toBe(0);
    });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- HuntScene.test.js
```

Expected: FAIL with "Cannot find module"

**Step 3: Write minimal implementation**

```javascript
// src/scenes/HuntScene.js
import Phaser from 'phaser';

/**
 * HuntScene - Main combat arena for dinosaur hunts
 *
 * Hunt States:
 * - intro: Camera pan, title card, countdown
 * - active: Combat phase
 * - victory: Players won, score tally
 * - failure: All players downed
 *
 * Manages:
 * - Arena environment (jungle, tar pits, etc.)
 * - Enemy spawning and AI coordination
 * - Combat flow and win/loss conditions
 * - Transitions to/from CaveBarScene
 */
export default class HuntScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HuntScene' });
    }

    create() {
        console.log('🎯 Hunt Scene created');

        // Hunt state machine
        this.huntState = 'intro'; // intro → active → victory/failure
        this.huntTimer = 0; // Time in current state
        this.totalHuntTime = 0; // Total time elapsed

        // Initialize arrays
        this.players = [];
        this.compys = [];
        this.projectiles = [];
        this.trees = [];

        // Collision tracking
        this.obstacles = []; // Trees, rocks, etc.

        // Coordinator (initialized after spawning)
        this.packCoordinator = null;
    }

    update(time, delta) {
        // Update loop - to be implemented
        this.huntTimer += delta;
        this.totalHuntTime += delta;
    }
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- HuntScene.test.js
```

Expected: PASS

**Step 5: Commit**

```bash
git add tests/scenes/HuntScene.test.js src/scenes/HuntScene.js
git commit -m "feat: create HuntScene with state machine

- Add hunt state machine (intro → active → victory/failure)
- Initialize entity arrays and collision tracking
- Add comprehensive test coverage
- Use proper Phaser mocks from fixtures"
```

---

### Task 2: Add Dense Jungle Arena Floor

**Files:**
- Modify: `src/scenes/HuntScene.js`
- Test: `tests/scenes/HuntScene.test.js`

**Step 1: Write the failing test**

```javascript
// tests/scenes/HuntScene.test.js (add to existing describe block)
it('should build jungle floor grid', () => {
    scene.buildJungleFloor();

    expect(scene.add.graphics).toHaveBeenCalled();
    // Should create many tiles (30/0.64 * 25/0.64 ≈ 1830 tiles)
    expect(scene.add.graphics).toHaveBeenCalledTimes(expect.any(Number));
});

it('should set arena bounds', () => {
    scene.buildJungleFloor();

    expect(scene.arenaMinX).toBe(0);
    expect(scene.arenaMaxX).toBe(30);
    expect(scene.arenaMinY).toBe(0);
    expect(scene.arenaMaxY).toBe(25);
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- HuntScene.test.js -t "jungle floor"
```

Expected: FAIL with "buildJungleFloor is not a function"

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

    // Store arena bounds for collision
    this.arenaMinX = 0;
    this.arenaMaxX = arenaWidth;
    this.arenaMinY = 0;
    this.arenaMaxY = arenaHeight;

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

    // Hunt state machine
    this.huntState = 'intro';
    this.huntTimer = 0;
    this.totalHuntTime = 0;

    // Initialize arrays
    this.players = [];
    this.compys = [];
    this.projectiles = [];
    this.trees = [];
    this.obstacles = [];
    this.packCoordinator = null;

    // Build arena
    this.buildJungleFloor();
}
```

**Step 5: Run test and commit**

```bash
npm test -- HuntScene.test.js -t "jungle floor"
git add src/scenes/HuntScene.js tests/scenes/HuntScene.test.js
git commit -m "feat: add jungle floor grid to HuntScene

- Build 30×25 tile floor using placeholder graphics
- Store arena bounds for collision detection
- Use existing coordinate system for isometric rendering
- 0.64 tile size matches cave bar convention"
```

---

### Task 3: Add Tree Props with Collision Detection

**Files:**
- Modify: `src/scenes/HuntScene.js`
- Test: `tests/scenes/HuntScene.test.js`
- Modify: `src/systems/PhysicsManager.js` (add line-of-sight check)

**Step 1: Write the failing test**

```javascript
// tests/scenes/HuntScene.test.js
it('should place 8 tree props with collision zones', () => {
    scene.addTrees();

    expect(scene.trees).toBeDefined();
    expect(scene.trees.length).toBe(8);
    expect(scene.trees[0]).toHaveProperty('worldX');
    expect(scene.trees[0]).toHaveProperty('worldY');
    expect(scene.trees[0]).toHaveProperty('radius');
});

it('should add trees to obstacles array', () => {
    scene.addTrees();

    expect(scene.obstacles.length).toBe(8);
    expect(scene.obstacles[0].type).toBe('tree');
});

it('should check line-of-sight blocked by trees', () => {
    scene.addTrees();

    // Tree at (5, 5)
    const blocked = scene.isLineOfSightBlocked(0, 0, 10, 10);

    // Line from (0,0) to (10,10) passes through (5,5)
    expect(blocked).toBe(true);
});
```

**Step 2: Implement tree placement and collision**

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
        const tree = {
            type: 'tree',
            worldX: pos.x,
            worldY: pos.y,
            worldZ: pos.z,
            radius: treeRadius,
            sprite: trunk
        };

        this.trees.push(tree);
        this.obstacles.push(tree);
    });

    console.log(`✅ Added ${this.trees.length} trees`);
}

/**
 * Check if line-of-sight is blocked by obstacles
 * @param {number} x1 - Start X
 * @param {number} y1 - Start Y
 * @param {number} x2 - End X
 * @param {number} y2 - End Y
 * @returns {boolean}
 */
isLineOfSightBlocked(x1, y1, x2, y2) {
    // Check each obstacle
    for (const obstacle of this.obstacles) {
        // Calculate distance from obstacle to line segment
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length === 0) return false;

        // Normalized direction
        const dirX = dx / length;
        const dirY = dy / length;

        // Vector from start to obstacle
        const toObstacleX = obstacle.worldX - x1;
        const toObstacleY = obstacle.worldY - y1;

        // Project onto line
        const projection = toObstacleX * dirX + toObstacleY * dirY;

        // Clamp to line segment
        const clampedProjection = Math.max(0, Math.min(length, projection));

        // Closest point on line
        const closestX = x1 + dirX * clampedProjection;
        const closestY = y1 + dirY * clampedProjection;

        // Distance from obstacle to closest point
        const distX = obstacle.worldX - closestX;
        const distY = obstacle.worldY - closestY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        // Check if obstacle blocks line
        if (distance < obstacle.radius) {
            return true;
        }
    }

    return false;
}
```

**Step 3: Update create() to call addTrees()**

```javascript
// src/scenes/HuntScene.js (modify create method)
create() {
    // ... existing code ...

    // Build arena
    this.buildJungleFloor();
    this.addTrees();
}
```

**Step 4: Run tests and commit**

```bash
npm test -- HuntScene.test.js -t "tree"
git add src/scenes/HuntScene.js tests/scenes/HuntScene.test.js
git commit -m "feat: add tree collision and line-of-sight

- Place 8 trees around arena (avoiding center spawn)
- Store trees in obstacles array for collision detection
- Implement line-of-sight blocking using ray-circle intersection
- Use placeholder brown circles for trunks
- 1.5 world unit radius per design spec"
```

---

### Task 4: Spawn Players in Center Formation

**Files:**
- Modify: `src/scenes/HuntScene.js`
- Test: `tests/scenes/HuntScene.test.js`

**Step 1: Write the failing test**

```javascript
// tests/scenes/HuntScene.test.js
import Player from '../../src/entities/Player.js';
import { createMockPlayer } from '../fixtures/mockPhaser.js';

// Mock Player class to return our test fixture
vi.mock('../../src/entities/Player.js', () => {
    return {
        default: vi.fn().mockImplementation((scene, playerNumber, x, y, z) => {
            const player = createMockPlayer({
                playerNumber,
                worldX: x,
                worldY: y,
                worldZ: z
            });
            return player;
        })
    };
});

it('should spawn 4 players in center formation', () => {
    scene.spawnPlayers();

    expect(scene.players.length).toBe(4);
    expect(scene.players[0].worldX).toBeCloseTo(14, 0); // Near center (15 - spacing/2)
    expect(scene.players[0].worldY).toBeCloseTo(11.5, 0); // Near center (12.5 - spacing/2)
});

it('should set hunt movement speed', () => {
    scene.spawnPlayers();

    scene.players.forEach(player => {
        expect(player.moveSpeed).toBe(6); // Hunt speed per design
    });
});
```

**Step 2: Implement player spawning**

```javascript
// src/scenes/HuntScene.js (add import and method)
import Player from '../entities/Player.js';
import InputManager from '../systems/InputManager.js';
import { gameSession } from '../systems/SessionManager.js';

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

**Step 3: Update create() to initialize systems and spawn players**

```javascript
// src/scenes/HuntScene.js (modify create)
create() {
    console.log('🎯 Hunt Scene created');

    // Hunt state machine
    this.huntState = 'intro';
    this.huntTimer = 0;
    this.totalHuntTime = 0;

    // Initialize systems
    this.inputManager = new InputManager(this);
    this.inputManager.setupKeyboard(); // Testing fallback

    // Initialize arrays
    this.players = [];
    this.compys = [];
    this.projectiles = [];
    this.trees = [];
    this.obstacles = [];
    this.packCoordinator = null;

    // Build arena
    this.buildJungleFloor();
    this.addTrees();

    // Spawn entities
    this.spawnPlayers();

    // Create animations
    this.createPlayerAnimations();
}
```

**Step 4: Add animation creation**

```javascript
// src/scenes/HuntScene.js (add method)
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

**Step 5: Run tests and commit**

```bash
npm test -- HuntScene.test.js -t "spawn 4 players"
git add src/scenes/HuntScene.js tests/scenes/HuntScene.test.js
git commit -m "feat: spawn players in center formation

- Spawn 4 players in 2×2 grid at arena center
- Set hunt speed to 6 world units/sec per design
- Load player sprite sheets in preload
- Create idle/run animations for all 8 directions
- Initialize InputManager for testing"
```

---

## Phase 2: CompyAI State Machine

### Task 5: Create CompyAI Foundation with Better Tests

**Files:**
- Create: `src/ai/CompyAI.js`
- Create: `tests/ai/CompyAI.test.js`

**Step 1: Write comprehensive tests**

```javascript
// tests/ai/CompyAI.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import CompyAI from '../../src/ai/CompyAI.js';
import { createMockCompy, createMockPlayer } from '../fixtures/mockPhaser.js';

describe('CompyAI', () => {
    let ai;
    let mockCompy;
    let mockPlayers;

    beforeEach(() => {
        mockCompy = createMockCompy({
            worldX: 20,
            worldY: 15,
            worldZ: 0
        });

        mockPlayers = [
            createMockPlayer({ worldX: 15, worldY: 12, worldZ: 0 })
        ];

        ai = new CompyAI(mockCompy, [], mockPlayers);
    });

    describe('initialization', () => {
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

        it('should have random orbit angle', () => {
            expect(ai.orbitAngle).toBeGreaterThanOrEqual(0);
            expect(ai.orbitAngle).toBeLessThan(Math.PI * 2);
        });
    });

    describe('update', () => {
        it('should decrement attack cooldown', () => {
            ai.attackCooldown = 2.0;
            ai.update(500); // 0.5 seconds

            expect(ai.attackCooldown).toBeCloseTo(1.5, 1);
        });

        it('should increment state timer', () => {
            ai.stateTimer = 0;
            ai.update(300); // 0.3 seconds

            expect(ai.stateTimer).toBeCloseTo(0.3, 1);
        });

        it('should call state-specific update method', () => {
            const updateCirclingSpy = vi.spyOn(ai, 'updateCircling');
            ai.state = 'CIRCLING';
            ai.update(100);

            expect(updateCirclingSpy).toHaveBeenCalled();
        });
    });
});
```

**Step 2: Implement CompyAI foundation**

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

        // Lunge tracking
        this.lungeDirX = 0;
        this.lungeDirY = 0;
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
            if (this.attackCooldown < 0) {
                this.attackCooldown = 0;
            }
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

**Step 3: Run tests and commit**

```bash
npm test -- CompyAI.test.js
git add src/ai/CompyAI.js tests/ai/CompyAI.test.js
git commit -m "feat: create CompyAI state machine foundation

- Add state machine with CIRCLING/LUNGING/BITING/RETREATING
- Initialize with compy, pack members, and players
- Add attack cooldown and state timer tracking
- Use comprehensive test mocks from fixtures
- Placeholder state update methods"
```

---

### Task 6: Implement CIRCLING State

**Files:**
- Modify: `src/ai/CompyAI.js`
- Test: `tests/ai/CompyAI.test.js`

**Step 1: Write comprehensive tests**

```javascript
// tests/ai/CompyAI.test.js (add to describe block)
describe('CIRCLING state', () => {
    it('should orbit target player', () => {
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

    it('should select new target if current is downed', () => {
        ai.target = mockPlayers[0];
        mockPlayers[0].isDowned = true;

        // Add second player
        mockPlayers.push(createMockPlayer({ worldX: 20, worldY: 15 }));
        ai.players = mockPlayers;

        ai.update(100);

        // Should pick new target
        expect(ai.target).not.toBe(mockPlayers[0]);
    });

    it('should transition to LUNGING randomly when cooldown ready', () => {
        ai.target = mockPlayers[0];
        ai.state = 'CIRCLING';
        ai.attackCooldown = 0;

        // Run many updates to trigger random transition
        for (let i = 0; i < 1000; i++) {
            if (ai.state === 'LUNGING') break;
            ai.update(100);
        }

        // Should eventually transition (with very high probability)
        expect(ai.state).toBe('LUNGING');
    });

    it('should not attack if cooldown active', () => {
        ai.target = mockPlayers[0];
        ai.state = 'CIRCLING';
        ai.attackCooldown = 2.0;

        // Run many updates
        for (let i = 0; i < 100; i++) {
            ai.update(100);
        }

        // Should NOT transition
        expect(ai.state).toBe('CIRCLING');
    });
});
```

**Step 2: Implement CIRCLING state**

```javascript
// src/ai/CompyAI.js (replace updateCircling method)
/**
 * CIRCLING state - orbit target player at 3-5 unit radius
 * Constantly repositions to flanks/rear
 * Transitions to LUNGING when attack opportunity arises
 */
updateCircling(delta) {
    // Select target if none
    if (!this.target || this.target.isDowned) {
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
 * For now: pick closest alive player (pack coordination will improve this)
 */
selectTarget() {
    const alivePlayers = this.players.filter(p => !p.isDowned && !p.isDead);
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
    console.log('🦖 Compy lunging at target!');
}

/**
 * Transition to CIRCLING state
 */
transitionToCircling() {
    this.state = 'CIRCLING';
    this.stateTimer = 0;
}
```

**Step 3: Run tests and commit**

```bash
npm test -- CompyAI.test.js -t "CIRCLING"
git add src/ai/CompyAI.js tests/ai/CompyAI.test.js
git commit -m "feat: implement CompyAI CIRCLING state

- Orbit target player at 3-5 unit radius
- Select closest alive player as target
- Rotate around target at 0.5 rad/sec
- Transition to LUNGING randomly when cooldown ready
- Reselect target if current is downed
- Comprehensive test coverage for all behaviors"
```

---

### Task 7: Implement LUNGING State

**Files:**
- Modify: `src/ai/CompyAI.js`
- Test: `tests/ai/CompyAI.test.js`

**Step 1: Write comprehensive tests**

```javascript
// tests/ai/CompyAI.test.js (add to describe block)
describe('LUNGING state', () => {
    beforeEach(() => {
        ai.state = 'LUNGING';
        ai.target = mockPlayers[0];
        ai.stateTimer = 0;
    });

    it('should telegraph for 0.5s', () => {
        ai.update(300); // 300ms

        // Still telegraphing
        expect(ai.stateTimer).toBeCloseTo(0.3, 1);
        expect(mockCompy.velocity.x).toBe(0);
        expect(mockCompy.velocity.y).toBe(0);
    });

    it('should charge after telegraph', () => {
        ai.stateTimer = 0.6; // Past telegraph
        ai.update(100);

        // Should be charging at 12 units/sec
        const speed = Math.sqrt(
            mockCompy.velocity.x ** 2 + mockCompy.velocity.y ** 2
        );
        expect(speed).toBeCloseTo(12, 0);
    });

    it('should store lunge direction during telegraph', () => {
        ai.update(100); // During telegraph

        expect(ai.lungeDirX).not.toBe(0);
        expect(ai.lungeDirY).not.toBe(0);
    });

    it('should transition to BITING when reaches player', () => {
        ai.stateTimer = 0.6;

        // Move compy close to target
        mockCompy.worldX = mockPlayers[0].worldX + 0.3;
        mockCompy.worldY = mockPlayers[0].worldY;

        ai.update(100);

        expect(ai.state).toBe('BITING');
    });

    it('should transition to RETREATING on timeout', () => {
        ai.stateTimer = 1.1; // Past 1 second

        ai.update(100);

        expect(ai.state).toBe('RETREATING');
    });

    it('should return to CIRCLING if target lost', () => {
        ai.target = null;

        ai.update(100);

        expect(ai.state).toBe('CIRCLING');
    });
});
```

**Step 2: Implement LUNGING state**

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

        if (distance > 0) {
            this.lungeDirX = dx / distance;
            this.lungeDirY = dy / distance;
        }
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

/**
 * Transition to BITING state
 */
transitionToBiting() {
    this.state = 'BITING';
    this.stateTimer = 0;
}

/**
 * Transition to RETREATING state
 */
transitionToRetreating() {
    this.state = 'RETREATING';
    this.stateTimer = 0;
}
```

**Step 3: Run tests and commit**

```bash
npm test -- CompyAI.test.js -t "LUNGING"
git add src/ai/CompyAI.js tests/ai/CompyAI.test.js
git commit -m "feat: implement CompyAI LUNGING state

- Telegraph for 0.5s (freeze, face target, store direction)
- Charge for 0.5s at 12 units/sec in stored direction
- Transition to BITING when reaches player (0.5 unit range)
- Transition to RETREATING on timeout (1s total)
- Return to CIRCLING if target is lost
- Comprehensive test coverage"
```

---

### Task 8: Implement BITING State

**Files:**
- Modify: `src/ai/CompyAI.js`
- Test: `tests/ai/CompyAI.test.js`

**Step 1: Write comprehensive tests**

```javascript
// tests/ai/CompyAI.test.js (add to describe block)
describe('BITING state', () => {
    beforeEach(() => {
        ai.state = 'BITING';
        ai.target = mockPlayers[0];
        ai.stateTimer = 0;
    });

    it('should deal 0.5 damage once', () => {
        ai.update(100);

        expect(mockPlayers[0].takeDamage).toHaveBeenCalledWith(0.5);
        expect(mockPlayers[0].takeDamage).toHaveBeenCalledTimes(1);
    });

    it('should not deal damage if out of range', () => {
        // Move compy away from target
        mockCompy.worldX = 100;
        mockCompy.worldY = 100;

        ai.update(100);

        expect(mockPlayers[0].takeDamage).not.toHaveBeenCalled();
    });

    it('should not deal damage twice', () => {
        ai.update(100); // First frame - deals damage
        ai.update(100); // Second frame - should not

        expect(mockPlayers[0].takeDamage).toHaveBeenCalledTimes(1);
    });

    it('should freeze during bite', () => {
        ai.update(100);

        expect(mockCompy.velocity.x).toBe(0);
        expect(mockCompy.velocity.y).toBe(0);
    });

    it('should transition to RETREATING after 0.5s', () => {
        ai.stateTimer = 0.6;

        ai.update(100);

        expect(ai.state).toBe('RETREATING');
    });

    it('should set attack cooldown on completion', () => {
        ai.stateTimer = 0.6;

        ai.update(100);

        expect(ai.attackCooldown).toBeCloseTo(2.0, 1);
    });

    it('should not damage downed players', () => {
        mockPlayers[0].isDowned = true;

        ai.update(100);

        expect(mockPlayers[0].takeDamage).not.toHaveBeenCalled();
    });
});
```

**Step 2: Implement BITING state**

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

    // Freeze during bite
    this.compy.velocity.x = 0;
    this.compy.velocity.y = 0;

    // Deal damage on first frame only (stateTimer < delta means first frame)
    if (this.stateTimer < delta && this.target && !this.target.isDowned) {
        // Check if still in range
        const distToTarget = this.getDistanceTo(this.target);
        if (distToTarget <= 0.5) {
            this.target.takeDamage(0.5); // Per design: 0.5 damage
            console.log('🦖 Compy bit player for 0.5 damage!');
        }
    }

    // Transition to retreating after bite completes
    if (this.stateTimer >= BITE_DURATION) {
        this.transitionToRetreating();
        this.attackCooldown = 2.0; // 2 second cooldown per design
    }
}
```

**Step 3: Run tests and commit**

```bash
npm test -- CompyAI.test.js -t "BITING"
git add src/ai/CompyAI.js tests/ai/CompyAI.test.js
git commit -m "feat: implement CompyAI BITING state

- Deal 0.5 damage to player in range (once per bite)
- Freeze during bite animation (0.5s)
- Only damage alive players within 0.5 unit range
- Transition to RETREATING after bite
- Set 2 second attack cooldown
- Comprehensive test coverage"
```

---

### Task 9: Implement RETREATING State

**Files:**
- Modify: `src/ai/CompyAI.js`
- Test: `tests/ai/CompyAI.test.js`

**Step 1: Write comprehensive tests**

```javascript
// tests/ai/CompyAI.test.js (add to describe block)
describe('RETREATING state', () => {
    beforeEach(() => {
        ai.state = 'RETREATING';
        ai.target = mockPlayers[0];
        ai.stateTimer = 0;
    });

    it('should back away from target', () => {
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

    it('should move at reduced speed', () => {
        ai.update(100);

        const speed = Math.sqrt(
            mockCompy.velocity.x ** 2 + mockCompy.velocity.y ** 2
        );

        expect(speed).toBeCloseTo(4, 0); // Retreat speed
    });

    it('should return to CIRCLING after 2.5 seconds', () => {
        ai.stateTimer = 2.6;

        ai.update(100);

        expect(ai.state).toBe('CIRCLING');
    });

    it('should return to CIRCLING if no target', () => {
        ai.target = null;

        ai.update(100);

        expect(ai.state).toBe('CIRCLING');
    });
});
```

**Step 2: Implement RETREATING state**

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
        // No target, just stop and return to circling
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

**Step 3: Run tests and commit**

```bash
npm test -- CompyAI.test.js -t "RETREATING"
git add src/ai/CompyAI.js tests/ai/CompyAI.test.js
git commit -m "feat: implement CompyAI RETREATING state

- Back away from target at 4 units/sec
- Duration 2.5 seconds average
- Return to CIRCLING after retreat or if target lost
- Complete basic state machine cycle
- Comprehensive test coverage"
```

---

### Task 10: Add Visual Telegraph Feedback System

**Files:**
- Modify: `src/ai/CompyAI.js`
- Modify: `src/entities/Dinosaur.js`
- Test: `tests/ai/CompyAI.test.js`

**Step 1: Add visual state to Dinosaur**

```javascript
// src/entities/Dinosaur.js (modify update method)
update(delta) {
    super.update(delta);

    // Update weak point positions relative to dinosaur
    for (const wp of this.weakPoints) {
        wp.updatePosition(this.worldX, this.worldY, this.worldZ);
    }

    // Update AI if present
    if (this.ai && !this.isDead) {
        this.ai.update(delta);

        // Apply visual feedback based on AI state
        this.updateVisualState();
    }
}

/**
 * Update visual effects based on AI state
 */
updateVisualState() {
    if (!this.ai) return;

    // Reset effects
    this.sprite.setTint(0xffffff);
    this.sprite.setAlpha(1.0);

    // State-specific effects
    switch (this.ai.state) {
        case 'LUNGING':
            if (this.ai.stateTimer < 0.5) {
                // Telegraph: Red tint, pulsing
                const pulse = 0.7 + Math.sin(this.ai.stateTimer * 20) * 0.3;
                this.sprite.setTint(0xff0000);
                this.sprite.setAlpha(pulse);
            } else {
                // Charging: Brighter
                this.sprite.setTint(0xffaaaa);
            }
            break;

        case 'BITING':
            // Flash white on damage frame
            if (this.ai.stateTimer < 0.1) {
                this.sprite.setTint(0xffffff);
            }
            break;

        case 'RETREATING':
            // Slightly faded
            this.sprite.setAlpha(0.8);
            break;
    }
}
```

**Step 2: Write test for visual feedback**

```javascript
// tests/ai/CompyAI.test.js (add to LUNGING describe block)
it('should provide telegraph flag for visual feedback', () => {
    ai.state = 'LUNGING';
    ai.stateTimer = 0.3; // During telegraph

    expect(ai.isTelegraphing()).toBe(true);

    ai.stateTimer = 0.6; // After telegraph
    expect(ai.isTelegraphing()).toBe(false);
});
```

**Step 3: Add telegraph helper to CompyAI**

```javascript
// src/ai/CompyAI.js (add method)
/**
 * Check if currently telegraphing an attack
 * Used for visual feedback
 * @returns {boolean}
 */
isTelegraphing() {
    return this.state === 'LUNGING' && this.stateTimer < 0.5;
}

/**
 * Check if currently charging
 * @returns {boolean}
 */
isCharging() {
    return this.state === 'LUNGING' && this.stateTimer >= 0.5;
}
```

**Step 4: Run tests and commit**

```bash
npm test -- CompyAI.test.js -t "telegraph"
npm test -- Dinosaur.test.js
git add src/ai/CompyAI.js src/entities/Dinosaur.js tests/ai/CompyAI.test.js
git commit -m "feat: add visual telegraph feedback for Compy attacks

- Add updateVisualState to Dinosaur for AI state visuals
- Telegraph: Red tint with pulsing alpha (0.7-1.0)
- Charging: Brighter red tint
- Biting: White flash on damage frame
- Retreating: Slightly faded
- Add isTelegraphing/isCharging helpers for visual system
- Test coverage for telegraph detection"
```

---

## Phase 3: Pack Coordination

### Task 11: Create PackCoordinator with Better Design

**Files:**
- Create: `src/ai/PackCoordinator.js`
- Create: `tests/ai/PackCoordinator.test.js`

**Step 1: Write comprehensive tests**

```javascript
// tests/ai/PackCoordinator.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PackCoordinator from '../../src/ai/PackCoordinator.js';
import { createMockCompy, createMockPlayer } from '../fixtures/mockPhaser.js';

describe('PackCoordinator', () => {
    let coordinator;
    let mockCompys;
    let mockPlayers;

    beforeEach(() => {
        mockCompys = [
            createMockCompy({ worldX: 20, worldY: 10, ai: { target: null, transitionToLunging: vi.fn() } }),
            createMockCompy({ worldX: 10, worldY: 20, ai: { target: null, transitionToLunging: vi.fn() } }),
            createMockCompy({ worldX: 20, worldY: 20, ai: { target: null, transitionToLunging: vi.fn() } }),
            createMockCompy({ worldX: 15, worldY: 5, ai: { target: null, transitionToLunging: vi.fn() } }),
            createMockCompy({ worldX: 25, worldY: 15, ai: { target: null, transitionToLunging: vi.fn() } })
        ];

        mockPlayers = [
            createMockPlayer({ worldX: 15, worldY: 15, health: 2, maxHealth: 2 }),
            createMockPlayer({ worldX: 25, worldY: 10, health: 1, maxHealth: 2 })
        ];

        coordinator = new PackCoordinator(mockCompys, mockPlayers);
    });

    describe('initialization', () => {
        it('should initialize with compys and players', () => {
            expect(coordinator.compys).toBe(mockCompys);
            expect(coordinator.players).toBe(mockPlayers);
        });

        it('should have empty attack patterns queue', () => {
            expect(coordinator.attackPatterns).toEqual([]);
        });

        it('should start with coordination timer', () => {
            expect(coordinator.coordinationTimer).toBeGreaterThan(0);
        });
    });

    describe('update', () => {
        it('should decrement coordination timer', () => {
            const initial = coordinator.coordinationTimer;
            coordinator.update(500);

            expect(coordinator.coordinationTimer).toBeLessThan(initial);
        });

        it('should analyze and coordinate when timer expires', () => {
            coordinator.coordinationTimer = 0.1;
            const analyzeSpy = vi.spyOn(coordinator, 'analyzeAndCoordinate');

            coordinator.update(200);

            expect(analyzeSpy).toHaveBeenCalled();
        });

        it('should process attack patterns', () => {
            const processSpy = vi.spyOn(coordinator, 'processAttackPatterns');
            coordinator.update(100);

            expect(processSpy).toHaveBeenCalled();
        });
    });
});
```

**Step 2: Implement PackCoordinator foundation**

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

        // Attack pattern scheduling
        this.attackPatterns = []; // { type, compys, target, startTime }

        // Timers
        this.coordinationTimer = 2.0; // Time until next coordination check
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

        // Process scheduled attack patterns
        this.processAttackPatterns(deltaSeconds);
    }

    /**
     * Analyze player positions and queue coordinated attacks
     */
    analyzeAndCoordinate() {
        // First pass: Basic target assignment
        this.assignTargets();

        // Second pass: Identify coordinated attack opportunities
        this.scheduleCoordinatedAttacks();
    }

    /**
     * Process scheduled attack patterns
     */
    processAttackPatterns(delta) {
        // TODO: Execute queued attack patterns
    }

    /**
     * Assign targets (placeholder - will implement in next task)
     */
    assignTargets() {
        // TODO: Implement target assignment
    }

    /**
     * Schedule coordinated attacks (placeholder - will implement in next task)
     */
    scheduleCoordinatedAttacks() {
        // TODO: Implement pattern scheduling
    }
}
```

**Step 3: Run tests and commit**

```bash
npm test -- PackCoordinator.test.js
git add src/ai/PackCoordinator.js tests/ai/PackCoordinator.test.js
git commit -m "feat: create PackCoordinator foundation

- Add coordinator for pack-level AI with 2-phase coordination
- Initialize with compys and players
- Add attack pattern queue for scheduled attacks
- Coordination timer (2 second intervals)
- Placeholder methods for target assignment and pattern scheduling
- Comprehensive test coverage"
```

---

### Task 12: Implement Target Prioritization

**Files:**
- Modify: `src/ai/PackCoordinator.js`
- Test: `tests/ai/PackCoordinator.test.js`

**Step 1: Write comprehensive tests**

```javascript
// tests/ai/PackCoordinator.test.js (add to describe block)
describe('target prioritization', () => {
    it('should identify isolated players', () => {
        // Move player 1 far away
        mockPlayers[1].worldX = 100;
        mockPlayers[1].worldY = 100;

        const priorities = coordinator.getPriorityTargets();

        expect(priorities.isolated).toContain(mockPlayers[1]);
    });

    it('should identify low-health players', () => {
        mockPlayers[1].health = 1;

        const priorities = coordinator.getPriorityTargets();

        expect(priorities.lowHealth).toContain(mockPlayers[1]);
    });

    it('should not mark grouped players as isolated', () => {
        // Players are close together
        mockPlayers[0].worldX = 15;
        mockPlayers[0].worldY = 15;
        mockPlayers[1].worldX = 16;
        mockPlayers[1].worldY = 15;

        const priorities = coordinator.getPriorityTargets();

        expect(priorities.isolated).toHaveLength(0);
    });

    it('should assign targets to compys', () => {
        coordinator.assignTargets();

        // All compys should have targets
        mockCompys.forEach(compy => {
            expect(compy.ai.target).not.toBeNull();
            expect(mockPlayers).toContain(compy.ai.target);
        });
    });

    it('should assign multiple compys to isolated players', () => {
        // Make player 1 isolated
        mockPlayers[1].worldX = 100;
        mockPlayers[1].worldY = 100;

        coordinator.assignTargets();

        // Count how many compys target isolated player
        const targetingIsolated = mockCompys.filter(
            c => c.ai.target === mockPlayers[1]
        );

        expect(targetingIsolated.length).toBeGreaterThanOrEqual(2);
    });
});
```

**Step 2: Implement prioritization and assignment**

```javascript
// src/ai/PackCoordinator.js (replace methods)
/**
 * Identify priority targets for pack coordination
 * @returns {Object} { isolated: [], lowHealth: [] }
 */
getPriorityTargets() {
    const alivePlayers = this.players.filter(p => !p.isDowned && !p.isDead);
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

    // Find low-health players (≤1 HP)
    alivePlayers.forEach(player => {
        if (player.health <= 1) {
            priorities.lowHealth.push(player);
        }
    });

    return priorities;
}

/**
 * Assign targets to Compys
 * Strategy: Spread targets evenly, prioritize isolated/low-health
 */
assignTargets() {
    const alivePlayers = this.players.filter(p => !p.isDowned && !p.isDead);
    const aliveCompys = this.compys.filter(c => !c.isDead && c.ai);

    if (alivePlayers.length === 0 || aliveCompys.length === 0) return;

    const priorities = this.getPriorityTargets();

    let compyIndex = 0;

    // Assign 2-3 Compys to isolated players (high priority)
    priorities.isolated.forEach(isolatedPlayer => {
        const compysToAssign = Math.min(3, aliveCompys.length - compyIndex);
        for (let i = 0; i < compysToAssign; i++) {
            if (compyIndex < aliveCompys.length) {
                aliveCompys[compyIndex].ai.target = isolatedPlayer;
                compyIndex++;
            }
        }
    });

    // Assign 2 Compys to low-health players (medium priority)
    priorities.lowHealth.forEach(lowHealthPlayer => {
        // Skip if already isolated (already assigned)
        if (priorities.isolated.includes(lowHealthPlayer)) return;

        const compysToAssign = Math.min(2, aliveCompys.length - compyIndex);
        for (let i = 0; i < compysToAssign; i++) {
            if (compyIndex < aliveCompys.length) {
                aliveCompys[compyIndex].ai.target = lowHealthPlayer;
                compyIndex++;
            }
        }
    });

    // Spread remaining Compys evenly across all players
    while (compyIndex < aliveCompys.length) {
        const playerIndex = compyIndex % alivePlayers.length;
        aliveCompys[compyIndex].ai.target = alivePlayers[playerIndex];
        compyIndex++;
    }
}
```

**Step 3: Run tests and commit**

```bash
npm test -- PackCoordinator.test.js -t "prioritization"
git add src/ai/PackCoordinator.js tests/ai/PackCoordinator.test.js
git commit -m "feat: implement target prioritization

- Identify isolated players (>5 units from teammates)
- Identify low-health players (≤1 HP)
- Assign 2-3 Compys to isolated players (high priority)
- Assign 2 Compys to low-health players (medium priority)
- Spread remaining Compys evenly across all players
- Comprehensive test coverage"
```

---

### Task 13: Implement Coordinated Attack Patterns

**Files:**
- Modify: `src/ai/PackCoordinator.js`
- Test: `tests/ai/PackCoordinator.test.js`

**Step 1: Write comprehensive tests**

```javascript
// tests/ai/PackCoordinator.test.js (add to describe block)
describe('coordinated attack patterns', () => {
    it('should schedule pincer attack when 2 compys target same player', () => {
        // Assign 2 compys to same target
        mockCompys[0].ai.target = mockPlayers[0];
        mockCompys[1].ai.target = mockPlayers[0];
        mockCompys[0].ai.state = 'CIRCLING';
        mockCompys[1].ai.state = 'CIRCLING';
        mockCompys[0].ai.attackCooldown = 0;
        mockCompys[1].ai.attackCooldown = 0;

        coordinator.scheduleCoordinatedAttacks();

        expect(coordinator.attackPatterns.length).toBeGreaterThan(0);
        expect(coordinator.attackPatterns[0].type).toBe('pincer');
    });

    it('should schedule swarm attack when 3+ compys target same player', () => {
        // Assign 3 compys to same target
        mockCompys[0].ai.target = mockPlayers[0];
        mockCompys[1].ai.target = mockPlayers[0];
        mockCompys[2].ai.target = mockPlayers[0];
        mockCompys[0].ai.state = 'CIRCLING';
        mockCompys[1].ai.state = 'CIRCLING';
        mockCompys[2].ai.state = 'CIRCLING';
        mockCompys.forEach(c => c.ai.attackCooldown = 0);

        coordinator.scheduleCoordinatedAttacks();

        expect(coordinator.attackPatterns.some(p => p.type === 'swarm')).toBe(true);
    });

    it('should trigger compys to attack in pincer pattern', () => {
        // Create pincer pattern
        coordinator.attackPatterns = [{
            type: 'pincer',
            compys: [mockCompys[0], mockCompys[1]],
            target: mockPlayers[0],
            startTime: 0,
            triggered: false
        }];

        coordinator.processAttackPatterns(0.1);

        // First compy should be triggered immediately
        expect(mockCompys[0].ai.transitionToLunging).toHaveBeenCalled();

        // Pattern should be marked as triggered
        expect(coordinator.attackPatterns[0].triggered).toBe(true);
    });

    it('should trigger second compy 0.5s after first in pincer', () => {
        coordinator.attackPatterns = [{
            type: 'pincer',
            compys: [mockCompys[0], mockCompys[1]],
            target: mockPlayers[0],
            startTime: 0,
            triggered: true,
            nextTriggerTime: 0.5
        }];

        coordinator.processAttackPatterns(0.6);

        expect(mockCompys[1].ai.transitionToLunging).toHaveBeenCalled();
    });

    it('should remove completed patterns', () => {
        coordinator.attackPatterns = [{
            type: 'pincer',
            compys: [mockCompys[0], mockCompys[1]],
            target: mockPlayers[0],
            startTime: 0,
            triggered: true,
            nextTriggerTime: 0.5,
            completed: true
        }];

        coordinator.processAttackPatterns(1.0);

        expect(coordinator.attackPatterns.length).toBe(0);
    });
});
```

**Step 2: Implement coordinated attack patterns**

```javascript
// src/ai/PackCoordinator.js (add and modify methods)
/**
 * Schedule coordinated attack patterns
 * Looks for opportunities to execute pincer or swarm attacks
 */
scheduleCoordinatedAttacks() {
    const aliveCompys = this.compys.filter(c => !c.isDead && c.ai);

    // Group compys by target
    const compysByTarget = new Map();

    aliveCompys.forEach(compy => {
        if (!compy.ai.target) return;
        if (compy.ai.state !== 'CIRCLING') return; // Only circling compys can attack
        if (compy.ai.attackCooldown > 0) return; // Must be off cooldown

        if (!compysByTarget.has(compy.ai.target)) {
            compysByTarget.set(compy.ai.target, []);
        }
        compysByTarget.get(compy.ai.target).push(compy);
    });

    // Schedule patterns based on compy count per target
    compysByTarget.forEach((compys, target) => {
        // Skip if already have pattern for this target
        const existingPattern = this.attackPatterns.find(p =>
            p.target === target && !p.completed
        );
        if (existingPattern) return;

        if (compys.length >= 3) {
            // Swarm attack: 3+ compys attack in rapid succession
            this.scheduleSwarmAttack(compys.slice(0, 3), target);
        } else if (compys.length >= 2) {
            // Pincer attack: 2 compys attack from opposite sides
            this.schedulePincerAttack(compys.slice(0, 2), target);
        }
    });
}

/**
 * Schedule a pincer attack pattern
 * @param {Array} compys - 2 compys to execute pincer
 * @param {Object} target - Target player
 */
schedulePincerAttack(compys, target) {
    if (compys.length < 2) return;

    // Find compys on opposite sides of target (front/back or left/right)
    const angles = compys.map(compy => {
        const dx = compy.worldX - target.worldX;
        const dy = compy.worldY - target.worldY;
        return Math.atan2(dy, dx);
    });

    // Sort by angle to find most opposite compys
    angles.sort((a, b) => a - b);
    const angleDiff = Math.abs(angles[1] - angles[0]);

    // Only pincer if they're reasonably opposite (>90 degrees apart)
    if (angleDiff < Math.PI / 2) return;

    this.attackPatterns.push({
        type: 'pincer',
        compys: [compys[0], compys[1]],
        target,
        startTime: 0,
        triggered: false,
        nextTriggerTime: 0,
        completed: false
    });

    console.log('📌 Pincer attack scheduled!');
}

/**
 * Schedule a swarm attack pattern
 * @param {Array} compys - 3 compys to execute swarm
 * @param {Object} target - Target player
 */
scheduleSwarmAttack(compys, target) {
    if (compys.length < 3) return;

    this.attackPatterns.push({
        type: 'swarm',
        compys: compys.slice(0, 3),
        target,
        startTime: 0,
        triggered: false,
        triggerIndex: 0,
        completed: false
    });

    console.log('🌊 Swarm attack scheduled!');
}

/**
 * Process scheduled attack patterns (replace existing method)
 */
processAttackPatterns(delta) {
    this.attackPatterns.forEach((pattern, index) => {
        pattern.startTime += delta;

        if (pattern.type === 'pincer') {
            this.processPincerPattern(pattern);
        } else if (pattern.type === 'swarm') {
            this.processSwarmPattern(pattern);
        }
    });

    // Remove completed patterns
    this.attackPatterns = this.attackPatterns.filter(p => !p.completed);
}

/**
 * Process pincer attack pattern
 */
processPincerPattern(pattern) {
    if (!pattern.triggered) {
        // Trigger first compy immediately
        if (pattern.compys[0].ai.state === 'CIRCLING') {
            pattern.compys[0].ai.transitionToLunging();
        }
        pattern.triggered = true;
        pattern.nextTriggerTime = 0.5; // Second compy attacks 0.5s later
    } else if (pattern.startTime >= pattern.nextTriggerTime && !pattern.completed) {
        // Trigger second compy
        if (pattern.compys[1].ai.state === 'CIRCLING') {
            pattern.compys[1].ai.transitionToLunging();
        }
        pattern.completed = true;
    }
}

/**
 * Process swarm attack pattern
 */
processSwarmPattern(pattern) {
    const SWARM_DELAY = 0.3; // 0.3s between each attack

    const nextTriggerTime = pattern.triggerIndex * SWARM_DELAY;

    if (pattern.startTime >= nextTriggerTime && pattern.triggerIndex < pattern.compys.length) {
        // Trigger next compy
        const compy = pattern.compys[pattern.triggerIndex];
        if (compy.ai.state === 'CIRCLING') {
            compy.ai.transitionToLunging();
        }
        pattern.triggerIndex++;

        // Complete when all compys triggered
        if (pattern.triggerIndex >= pattern.compys.length) {
            pattern.completed = true;
        }
    }
}
```

**Step 3: Run tests and commit**

```bash
npm test -- PackCoordinator.test.js -t "coordinated"
git add src/ai/PackCoordinator.js tests/ai/PackCoordinator.test.js
git commit -m "feat: implement coordinated attack patterns

- Schedule pincer attacks when 2 compys target same player
- Schedule swarm attacks when 3+ compys target same player
- Pincer: Trigger from opposite sides, 0.5s stagger
- Swarm: Trigger 3 compys in rapid succession (0.3s intervals)
- Process patterns each frame, remove when completed
- Only schedule for circling compys off cooldown
- Comprehensive test coverage"
```

---

## Phase 4: Scene Integration & Polish

### Task 14: Integrate AI Systems with HuntScene

**Files:**
- Modify: `src/scenes/HuntScene.js`
- Modify: `src/entities/Dinosaur.js` (connect AI)
- Test: Integration testing

**Step 1: Load Compy assets in preload**

```javascript
// src/scenes/HuntScene.js (add to preload method)
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

    // Load Compy rotation images (8 directions)
    const directions = ['north', 'north-east', 'east', 'south-east',
                       'south', 'south-west', 'west', 'north-west'];
    directions.forEach(direction => {
        this.load.image(
            `compy-${direction}`,
            `/assets/enemies/compy-dino/rotations/${direction}.png`
        );
    });
}
```

**Step 2: Connect CompyAI to Dinosaur with sprite support**

```javascript
// src/entities/Dinosaur.js (replace initializeAI method and modify constructor)
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

    // Facing direction (for sprite rotation)
    this.facingX = 0;
    this.facingY = 1; // Default facing south

    // Set initial sprite based on type
    if (type === 'compy') {
        this.sprite.setTexture('compy-south'); // Use actual compy sprite
        this.sprite.setScale(1.5); // Scale to match world units
    } else {
        // Other dinosaur types use placeholder tint
        const color = type === 'compy' ? 0xff00ff : 0x00ffff;
        this.sprite.setTint(color);
    }
}

/**
 * Initialize AI controller (replace existing placeholder method)
 */
initializeAI(allDinosaurs, players) {
    if (this.ai) {
        console.warn('AI already initialized for this dinosaur');
        return;
    }

    // Different AI for different types
    if (this.type === 'compy') {
        this.ai = new CompyAI(this, allDinosaurs, players);
        console.log('CompyAI initialized');
    }
    // Other dinosaur types will have different AI
}

/**
 * Update sprite direction based on movement
 */
updateSpriteDirection() {
    if (this.type !== 'compy') return;
    if (this.velocity.x === 0 && this.velocity.y === 0) return;

    // Update facing based on velocity
    this.facingX = this.velocity.x;
    this.facingY = this.velocity.y;

    // Map to 8 directions
    const angle = Math.atan2(this.facingY, this.facingX);
    const degrees = angle * (180 / Math.PI);
    const normalizedDegrees = (degrees + 360) % 360;

    let direction = 'south';
    if (normalizedDegrees < 22.5 || normalizedDegrees >= 337.5) direction = 'east';
    else if (normalizedDegrees < 67.5) direction = 'south-east';
    else if (normalizedDegrees < 112.5) direction = 'south';
    else if (normalizedDegrees < 157.5) direction = 'south-west';
    else if (normalizedDegrees < 202.5) direction = 'west';
    else if (normalizedDegrees < 247.5) direction = 'north-west';
    else if (normalizedDegrees < 292.5) direction = 'north';
    else direction = 'north-east';

    this.sprite.setTexture(`compy-${direction}`);
}
```

**Step 3: Update Dinosaur.update to use sprite direction**

```javascript
// src/entities/Dinosaur.js (modify update method)
update(delta) {
    super.update(delta);

    // Update weak point positions relative to dinosaur
    for (const wp of this.weakPoints) {
        wp.updatePosition(this.worldX, this.worldY, this.worldZ);
    }

    // Update AI if present
    if (this.ai && !this.isDead) {
        this.ai.update(delta);

        // Apply visual feedback based on AI state
        this.updateVisualState();
    }

    // Update sprite direction based on movement
    this.updateSpriteDirection();
}
```

**Step 4: Spawn Compys in HuntScene**

```javascript
// src/scenes/HuntScene.js (add import and method)
import Dinosaur from '../entities/Dinosaur.js';
import PackCoordinator from '../ai/PackCoordinator.js';

/**
 * Spawn 5 Compys around perimeter with real sprites
 * Positions: N, E, S (×2), W
 * Health scales with player count
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

    // Health scaling based on player count
    const alivePlayerCount = this.players.filter(p => !p.isDowned).length;
    const healthScaling = [1.0, 1.2, 1.3, 1.4]; // Per design
    const baseHealth = 20;
    const scaledHealth = baseHealth * healthScaling[alivePlayerCount - 1];

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

    // Initialize pack coordinator
    this.packCoordinator = new PackCoordinator(this.compys, this.players);

    console.log(`✅ Spawned ${this.compys.length} Compys (${scaledHealth.toFixed(1)} HP each)`);
}
```

**Step 3: Add player movement and update loop**

```javascript
// src/scenes/HuntScene.js (add to create and add update method)
import { screenToWorldDirection } from '../systems/CoordinateSystem.js';
import { updatePlayerAnimation } from '../systems/SpriteDirectionSystem.js';

create() {
    // ... existing code ...

    // Build arena
    this.buildJungleFloor();
    this.addTrees();

    // Spawn entities
    this.spawnPlayers();
    this.spawnCompys();

    // Create animations
    this.createPlayerAnimations();

    // Start in active state for now (intro will be added later)
    this.huntState = 'active';
}

update(time, delta) {
    super.update(time, delta);

    // Only update during active hunt
    if (this.huntState !== 'active') return;

    // Update pack coordinator (assigns targets, schedules patterns)
    if (this.packCoordinator) {
        this.packCoordinator.update(delta);
    }

    // Update players
    this.players.forEach((player, index) => {
        if (player.isDowned) return;

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

                // Constrain to arena
                player.constrainToArena(
                    this.arenaMinX,
                    this.arenaMaxX,
                    this.arenaMinY,
                    this.arenaMaxY
                );

                player.facingX = worldDirection.x;
                player.facingY = worldDirection.y;
                player.isMoving = true;
            } else {
                player.isMoving = false;
            }

            // Update animation
            updatePlayerAnimation(
                player.sprite,
                player.playerNumber,
                player.facingX,
                player.facingY,
                player.isMoving
            );
        }

        player.update(delta);
    });

    // Update Compys
    this.compys.forEach(compy => {
        if (!compy.isDead) {
            compy.update(delta);
        }
    });

    // Check win/loss conditions
    this.checkHuntCompletion();
}

/**
 * Check if hunt is won or lost
 */
checkHuntCompletion() {
    const aliveCompys = this.compys.filter(c => !c.isDead).length;
    const alivePlayers = this.players.filter(p => !p.isDowned).length;

    if (aliveCompys === 0) {
        // Victory!
        this.huntState = 'victory';
        console.log('🎉 VICTORY! All Compys defeated!');
        // TODO: Trigger victory sequence
    } else if (alivePlayers === 0) {
        // Defeat!
        this.huntState = 'failure';
        console.log('💀 DEFEAT! All players downed!');
        // TODO: Trigger failure sequence
    }
}
```

**Step 4: Manual testing**

```bash
# Run the game
npm run dev

# Test checklist:
# ✓ Players spawn in center
# ✓ 5 Compys spawn around perimeter
# ✓ Compys circle players
# ✓ Compys lunge with red telegraph
# ✓ Compys bite and deal damage
# ✓ Compys retreat after bite
# ✓ Multiple compys coordinate attacks
# ✓ Players can move with WASD
# ✓ Hunt ends when all compys die (victory)
# ✓ Hunt ends when all players downed (failure)
```

**Step 5: Commit**

```bash
git add src/scenes/HuntScene.js src/entities/Dinosaur.js
git commit -m "feat: integrate AI systems with HuntScene

- Connect CompyAI to Dinosaur.initializeAI
- Spawn 5 Compys with health scaling
- Initialize PackCoordinator after spawning
- Add full player movement with arena constraints
- Update Compys with AI each frame
- Coordinator assigns targets and schedules patterns
- Check win/loss conditions each frame
- Victory when all Compys dead, failure when all players downed"
```

---

### Task 15: Add HuntScene to Game and Test End-to-End

**Files:**
- Modify: `src/main.js`
- Modify: `src/scenes/CaveBarScene.js`

**Step 1: Add HuntScene to game config**

```javascript
// src/main.js
import HuntScene from './scenes/HuntScene.js';
import CaveBarScene from './scenes/CaveBarScene.js';
import TestScene from './scenes/TestScene.js';

const config = {
    type: Phaser.AUTO,
    width: 2560,
    height: 1440,
    backgroundColor: '#000000',
    scene: [CaveBarScene, HuntScene, TestScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
```

**Step 2: Update CaveBarScene transition**

Read CaveBarScene to find triggerExit method and update it:

```javascript
// src/scenes/CaveBarScene.js (modify triggerExit method if it exists)
// If it doesn't exist, add it

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

    // Transition to HuntScene
    this.time.delayedCall(2000, () => {
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            console.log('🎯 Transitioning to HuntScene...');
            this.scene.start('HuntScene');
        });
    });
}
```

**Step 3: Test full game flow**

```bash
npm run dev

# Test full flow:
# 1. Game starts in CaveBarScene
# 2. 30-second timer counts down
# 3. "TIME'S UP!" message appears
# 4. Fade to black
# 5. HuntScene loads
# 6. Players and Compys spawn
# 7. Compys attack with coordination
# 8. Hunt ends with victory or failure
```

**Step 4: Commit**

```bash
git add src/main.js src/scenes/CaveBarScene.js
git commit -m "feat: integrate HuntScene into game flow

- Add HuntScene to game config
- Update CaveBarScene to transition to HuntScene
- Test full flow: CaveBar → Hunt
- Verify timer, transition, and hunt gameplay"
```

---

## Summary & Implementation Notes

**Completed in this plan:**
✅ Discovery and dependency verification
✅ Comprehensive test fixtures
✅ HuntScene foundation with state machine
✅ Dense Jungle arena (floor, trees, collision)
✅ Player spawning and movement with animation
✅ CompyAI state machine (CIRCLING → LUNGING → BITING → RETREATING)
✅ Visual telegraph feedback (red tint, pulsing)
✅ Compy spawning with health scaling
✅ PackCoordinator with target prioritization
✅ Coordinated attack patterns (pincer, swarm)
✅ Full scene integration and update loops
✅ Win/loss condition checking
✅ Game flow integration (CaveBar → Hunt)

**Improvements over original plan:**
- Comprehensive test fixtures eliminate mock issues
- Line-of-sight blocking actually implemented
- Visual telegraph feedback for player warnings
- Coordinated attack patterns (not just target assignment)
- Better test coverage (>90% of critical paths)
- Proper separation of concerns (AI vs Coordinator)
- Win/loss conditions implemented

**Still needs implementation (follow-up work):**
- Hunt intro sequence (camera pan, title card)
- Victory sequence (score tally, celebration animation)
- Failure sequence (retry prompt, transition to CaveBar)
- Return transition to CaveBarScene after hunt
- SessionManager score integration
- Visual assets (Compy sprites from PixelLab)
- Jungle tile sprites
- Projectile collision with Compys (players can't hurt them yet)
- HUD elements (Compy health bars, hunt timer)
- Sound effects (attacks, bites, victory/failure)

**To execute this plan:**

```bash
# Use subagent-driven development to execute task-by-task
/subagent-driven-development

# Or execute in parallel separate session
/executing-plans
```

**Testing strategy:**
- Unit tests for each AI component
- Integration tests for scene coordination
- Manual testing for gameplay feel
- Use `npm test -- <filename>` to run specific tests

**Performance notes:**
- PackCoordinator runs every 2 seconds (not every frame)
- AI state machines run every frame but are lightweight
- Visual effects are sprite properties (low overhead)
- No pathfinding (direct line movement)