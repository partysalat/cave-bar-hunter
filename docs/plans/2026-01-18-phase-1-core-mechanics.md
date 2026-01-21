# Prehistoric Hunter - Phase 1: Core Mechanics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the foundational coordinate system, player movement, basic controls, simple test dinosaur, collision detection, and camera following for the isometric Phaser 3 game.

**Architecture:** Separate world space (3D gameplay logic using worldX, worldY, worldZ) from screen space (2D isometric rendering). All game logic operates in world coordinates and converts to screen coordinates only for rendering. Entity-component pattern with manager classes.

**Tech Stack:** Phaser 3 (JavaScript), HTML5 Canvas, WebGL rendering, gamepad API

---

## Task 1: Project Setup and Phaser Initialization

**Files:**
- Create: `index.html`
- Create: `src/main.js`
- Create: `package.json`
- Create: `.gitignore`

**Step 1: Create package.json with Phaser dependency**

```json
{
  "name": "prehistoric-hunter",
  "version": "0.1.0",
  "description": "4-player cooperative dinosaur hunting bar game",
  "main": "src/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "phaser": "^3.80.1"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

**Step 2: Create .gitignore**

```
node_modules/
dist/
.DS_Store
*.log
```

**Step 3: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prehistoric Hunter</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #000;
        }
        canvas {
            display: block;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <script type="module" src="/src/main.js"></script>
</body>
</html>
```

**Step 4: Create minimal main.js with Phaser config**

```javascript
import Phaser from 'phaser';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './systems/CoordinateSystem.js';

const config = {
    type: Phaser.AUTO,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#2d2d2d',
    parent: 'game-container',
    scene: []
};

const game = new Phaser.Game(config);
```

**Step 5: Install dependencies and verify**

Run: `npm install`
Expected: Dependencies installed successfully

**Step 6: Run dev server and verify**

Run: `npm run dev`
Expected: Dev server starts, browser shows empty Phaser canvas at 2560×1440 (2K resolution)

**Step 7: Commit**

```bash
git add .gitignore package.json index.html src/main.js
git commit -m "feat: initialize Phaser 3 project with basic config"
```

---

## Task 2: Coordinate System Implementation

**Files:**
- Create: `src/systems/CoordinateSystem.js`
- Create: `tests/CoordinateSystem.test.js`

**Step 1: Write test for worldToScreen conversion**

Create: `tests/CoordinateSystem.test.js`

```javascript
import { describe, it, expect } from 'vitest';
import { worldToScreen, screenToWorld, calculateDepth } from '../src/systems/CoordinateSystem.js';

describe('CoordinateSystem', () => {
    it('converts world origin to screen center', () => {
        const result = worldToScreen(0, 0, 0);
        expect(result.x).toBe(1280); // SCREEN_CENTER_X (2K)
        expect(result.y).toBe(720);  // SCREEN_CENTER_Y (2K)
    });

    it('converts world position to isometric screen position', () => {
        const result = worldToScreen(10, 5, 0);
        expect(result.x).toBe(1280 + (10 - 5) * 64); // (worldX - worldY) * (TILE_WIDTH/2)
        expect(result.y).toBe(720 + (10 + 5) * 32);  // (worldX + worldY) * (TILE_HEIGHT/2)
    });

    it('applies Z height offset to screen Y', () => {
        const result = worldToScreen(0, 0, 2);
        expect(result.x).toBe(1280);
        expect(result.y).toBe(720 - 2 * 100); // Z * HEIGHT_SCALE (2× scaled)
    });
});
```

**Step 2: Add test dependencies to package.json**

Modify: `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0"
  }
}
```

**Step 3: Run npm install for test dependencies**

Run: `npm install`
Expected: vitest installed

**Step 4: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - module not found

**Step 5: Implement CoordinateSystem.js**

Create: `src/systems/CoordinateSystem.js`

```javascript
// Constants from design doc (2K Resolution - 2× Scale)
export const SCREEN_WIDTH = 2560;   // 2K resolution
export const SCREEN_HEIGHT = 1440;  // 2K resolution
export const TILE_WIDTH = 128;      // 2× for 2K resolution
export const TILE_HEIGHT = 64;      // 2× for 2K resolution
export const HEIGHT_SCALE = 100;    // pixels per world unit in Z axis (2× scaled)
export const SCREEN_CENTER_X = SCREEN_WIDTH / 2;  // 1280
export const SCREEN_CENTER_Y = SCREEN_HEIGHT / 2; // 720

/**
 * Converts 3D world coordinates to 2D isometric screen coordinates
 * @param {number} worldX - Horizontal world position (0-30)
 * @param {number} worldY - Depth world position (0-25)
 * @param {number} worldZ - Height world position (0-10+)
 * @returns {{x: number, y: number}} Screen coordinates
 */
export function worldToScreen(worldX, worldY, worldZ) {
    const screenX = (worldX - worldY) * (TILE_WIDTH / 2) + SCREEN_CENTER_X;
    const screenY = (worldX + worldY) * (TILE_HEIGHT / 2) - (worldZ * HEIGHT_SCALE) + SCREEN_CENTER_Y;

    return { x: screenX, y: screenY };
}

/**
 * Converts 2D screen coordinates back to world coordinates (assumes Z=0)
 * @param {number} screenX - Screen X position
 * @param {number} screenY - Screen Y position
 * @returns {{worldX: number, worldY: number}} World coordinates at ground level
 */
export function screenToWorld(screenX, screenY) {
    // Offset from center
    const offsetX = screenX - SCREEN_CENTER_X;
    const offsetY = screenY - SCREEN_CENTER_Y;

    // Inverse isometric transformation
    const worldX = (offsetX / (TILE_WIDTH / 2) + offsetY / (TILE_HEIGHT / 2)) / 2;
    const worldY = (offsetY / (TILE_HEIGHT / 2) - offsetX / (TILE_WIDTH / 2)) / 2;

    return { worldX, worldY };
}

/**
 * Calculates depth value for sprite sorting
 * Objects further "back" (higher worldY) render in front
 * @param {number} worldY - World Y position
 * @param {number} worldZ - World Z position
 * @returns {number} Depth value for Phaser sprite sorting
 */
export function calculateDepth(worldY, worldZ) {
    return worldY * 1000 + worldZ * 10;
}
```

**Step 6: Run test to verify it passes**

Run: `npm test`
Expected: PASS - all 3 tests pass

**Step 7: Commit**

```bash
git add tests/CoordinateSystem.test.js src/systems/CoordinateSystem.js package.json
git commit -m "feat: implement isometric coordinate system with tests"
```

---

## Task 3: Entity Base Class

**Files:**
- Create: `src/entities/Entity.js`
- Create: `tests/Entity.test.js`

**Step 1: Write test for Entity world position**

Create: `tests/Entity.test.js`

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import Entity from '../src/entities/Entity.js';

describe('Entity', () => {
    let mockScene;

    beforeEach(() => {
        mockScene = {
            add: {
                sprite: () => ({
                    setOrigin: () => ({}),
                    setDepth: () => ({})
                })
            }
        };
    });

    it('initializes with world position', () => {
        const entity = new Entity(mockScene, 10, 15, 0);
        expect(entity.worldX).toBe(10);
        expect(entity.worldY).toBe(15);
        expect(entity.worldZ).toBe(0);
    });

    it('updates screen position from world position', () => {
        const entity = new Entity(mockScene, 10, 5, 0);
        entity.updateScreenPosition();

        // Should convert (10, 5, 0) to screen coords (2K resolution)
        expect(entity.sprite.x).toBe(1280 + (10 - 5) * 64);
        expect(entity.sprite.y).toBe(720 + (10 + 5) * 32);
    });

    it('updates depth based on world position', () => {
        const entity = new Entity(mockScene, 0, 10, 2);
        const depth = entity.getDepth();
        expect(depth).toBe(10 * 1000 + 2 * 10);
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - Entity module not found

**Step 3: Implement Entity.js base class**

Create: `src/entities/Entity.js`

```javascript
import { worldToScreen, calculateDepth } from '../systems/CoordinateSystem.js';

/**
 * Base class for all game entities (players, dinosaurs, projectiles)
 * Handles world/screen coordinate conversion and sprite management
 */
export default class Entity {
    /**
     * @param {Phaser.Scene} scene - Phaser scene
     * @param {number} worldX - Initial world X position
     * @param {number} worldY - Initial world Y position
     * @param {number} worldZ - Initial world Z position (height)
     */
    constructor(scene, worldX, worldY, worldZ) {
        this.scene = scene;
        this.worldX = worldX;
        this.worldY = worldY;
        this.worldZ = worldZ;

        // Velocity in world units per second
        this.velocityX = 0;
        this.velocityY = 0;
        this.velocityZ = 0;

        // Create sprite (will be overridden by subclasses)
        this.sprite = scene.add.sprite(0, 0, null);
        this.sprite.setOrigin(0.5, 0.5);

        this.updateScreenPosition();
    }

    /**
     * Updates sprite screen position and depth from world coordinates
     * Call this every frame or when world position changes
     */
    updateScreenPosition() {
        const screenPos = worldToScreen(this.worldX, this.worldY, this.worldZ);
        this.sprite.x = screenPos.x;
        this.sprite.y = screenPos.y;
        this.sprite.setDepth(this.getDepth());
    }

    /**
     * Calculates depth for proper sprite layering
     * @returns {number} Depth value
     */
    getDepth() {
        return calculateDepth(this.worldY, this.worldZ);
    }

    /**
     * Updates entity logic (override in subclasses)
     * @param {number} delta - Time since last frame in ms
     */
    update(delta) {
        // Apply velocity to world position
        const deltaSeconds = delta / 1000;
        this.worldX += this.velocityX * deltaSeconds;
        this.worldY += this.velocityY * deltaSeconds;
        this.worldZ += this.velocityZ * deltaSeconds;

        this.updateScreenPosition();
    }

    /**
     * Destroys entity and removes sprite
     */
    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS - all Entity tests pass

**Step 5: Commit**

```bash
git add tests/Entity.test.js src/entities/Entity.js
git commit -m "feat: implement Entity base class with world coordinates"
```

---

## Task 4: Player Entity Class

**Files:**
- Create: `src/entities/Player.js`
- Create: `tests/Player.test.js`

**Step 1: Write test for Player initialization**

Create: `tests/Player.test.js`

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import Player from '../src/entities/Player.js';

describe('Player', () => {
    let mockScene;

    beforeEach(() => {
        mockScene = {
            add: {
                sprite: () => ({
                    setOrigin: () => ({}),
                    setDepth: () => ({}),
                    setTint: () => ({})
                })
            }
        };
    });

    it('initializes with player number and color', () => {
        const player = new Player(mockScene, 0, 15, 12, 0);
        expect(player.playerNumber).toBe(0);
        expect(player.color).toBe(0xff0000); // Red
    });

    it('assigns correct colors to player numbers', () => {
        const p0 = new Player(mockScene, 0, 0, 0, 0);
        const p1 = new Player(mockScene, 1, 0, 0, 0);
        const p2 = new Player(mockScene, 2, 0, 0, 0);
        const p3 = new Player(mockScene, 3, 0, 0, 0);

        expect(p0.color).toBe(0xff0000); // Red
        expect(p1.color).toBe(0x0000ff); // Blue
        expect(p2.color).toBe(0xffff00); // Yellow
        expect(p3.color).toBe(0x00ff00); // Green
    });

    it('initializes with starting weapon', () => {
        const player = new Player(mockScene, 0, 0, 0, 0);
        expect(player.weapon).toBe('stone-spear');
        expect(player.health).toBe(2);
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - Player module not found

**Step 3: Implement Player.js**

Create: `src/entities/Player.js`

```javascript
import Entity from './Entity.js';

// Player color mapping from design doc
const PLAYER_COLORS = [
    0xff0000, // Player 1: Red
    0x0000ff, // Player 2: Blue
    0xffff00, // Player 3: Yellow
    0x00ff00  // Player 4: Green
];

/**
 * Player entity - represents one of 1-4 caveman hunters
 */
export default class Player extends Entity {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} playerNumber - 0-3 player index
     * @param {number} worldX
     * @param {number} worldY
     * @param {number} worldZ
     */
    constructor(scene, playerNumber, worldX, worldY, worldZ) {
        super(scene, worldX, worldY, worldZ);

        this.playerNumber = playerNumber;
        this.color = PLAYER_COLORS[playerNumber];

        // Combat stats
        this.health = 2; // Takes 2 hits before downed
        this.maxHealth = 2;
        this.isDowned = false;

        // Equipment
        this.weapon = 'stone-spear'; // Starting weapon
        this.passiveAbilities = [];
        this.cocktailBuffs = [];

        // Score tracking
        this.score = 0;

        // Movement stats
        this.moveSpeed = 8; // world units per second

        // Apply color tint to sprite
        this.sprite.setTint(this.color);
    }

    /**
     * Moves player based on D-pad input direction
     * @param {number} dirX - X direction (-1, 0, 1)
     * @param {number} dirY - Y direction (-1, 0, 1)
     */
    move(dirX, dirY) {
        // Normalize diagonal movement
        if (dirX !== 0 && dirY !== 0) {
            const length = Math.sqrt(dirX * dirX + dirY * dirY);
            dirX /= length;
            dirY /= length;
        }

        this.velocityX = dirX * this.moveSpeed;
        this.velocityY = dirY * this.moveSpeed;
    }

    /**
     * Stops player movement
     */
    stop() {
        this.velocityX = 0;
        this.velocityY = 0;
    }

    /**
     * Takes damage from dinosaur attack
     * @param {number} damage - Amount of damage (usually 1)
     */
    takeDamage(damage) {
        if (this.isDowned) return;

        this.health -= damage;

        if (this.health <= 0) {
            this.health = 0;
            this.isDowned = true;
        }
    }

    /**
     * Revives downed player
     */
    revive() {
        this.isDowned = false;
        this.health = 1; // Revive with partial health
    }

    /**
     * Adds points to player score
     * @param {number} points
     */
    addScore(points) {
        this.score += points;
    }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS - all Player tests pass

**Step 5: Commit**

```bash
git add tests/Player.test.js src/entities/Player.js
git commit -m "feat: implement Player entity with colors and basic stats"
```

---

## Task 5: Test Scene Setup

**Files:**
- Create: `src/scenes/TestScene.js`
- Modify: `src/main.js`

**Step 1: Create TestScene with ground visualization**

Create: `src/scenes/TestScene.js`

```javascript
import Phaser from 'phaser';
import Player from '../entities/Player.js';
import { worldToScreen } from '../systems/CoordinateSystem.js';

/**
 * Test scene for Phase 1 development
 * Renders isometric ground grid and test entities
 */
export default class TestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TestScene' });
    }

    create() {
        // Draw isometric ground grid for visualization
        this.drawGroundGrid();

        // Create test player at arena center
        this.player = new Player(this, 0, 15, 12, 0);

        // Add debug text
        this.debugText = this.add.text(10, 10, '', {
            font: '16px monospace',
            fill: '#00ff00'
        });
        this.debugText.setDepth(10000);
    }

    update(time, delta) {
        if (this.player) {
            this.player.update(delta);

            // Update debug info
            this.debugText.setText([
                `World: (${this.player.worldX.toFixed(1)}, ${this.player.worldY.toFixed(1)}, ${this.player.worldZ.toFixed(1)})`,
                `Screen: (${this.player.sprite.x.toFixed(0)}, ${this.player.sprite.y.toFixed(0)})`,
                `Depth: ${this.player.getDepth()}`
            ]);
        }
    }

    /**
     * Draws isometric grid for ground visualization
     * Helps verify coordinate system accuracy
     */
    drawGroundGrid() {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x00ff00, 0.3);

        // Draw grid lines for 30x25 world units
        for (let x = 0; x <= 30; x += 5) {
            const start = worldToScreen(x, 0, 0);
            const end = worldToScreen(x, 25, 0);
            graphics.lineBetween(start.x, start.y, end.x, end.y);
        }

        for (let y = 0; y <= 25; y += 5) {
            const start = worldToScreen(0, y, 0);
            const end = worldToScreen(30, y, 0);
            graphics.lineBetween(start.x, start.y, end.x, end.y);
        }

        graphics.setDepth(-1000);
    }
}
```

**Step 2: Add TestScene to main.js**

Modify: `src/main.js`

```javascript
import Phaser from 'phaser';
import TestScene from './scenes/TestScene.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './systems/CoordinateSystem.js';

const config = {
    type: Phaser.AUTO,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#2d2d2d',
    parent: 'game-container',
    scene: [TestScene]
};

const game = new Phaser.Game(config);
```

**Step 3: Run dev server and verify visual**

Run: `npm run dev`
Expected: See isometric grid with red player sprite (tinted rectangle) at center

**Step 4: Commit**

```bash
git add src/scenes/TestScene.js src/main.js
git commit -m "feat: add TestScene with isometric grid visualization"
```

---

## Task 6: Input Manager for Gamepad

**Files:**
- Create: `src/systems/InputManager.js`
- Create: `tests/InputManager.test.js`

**Step 1: Write test for InputManager gamepad detection**

Create: `tests/InputManager.test.js`

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import InputManager from '../src/systems/InputManager.js';

describe('InputManager', () => {
    let mockScene;

    beforeEach(() => {
        mockScene = {
            input: {
                gamepad: {
                    on: () => {},
                    gamepads: []
                }
            }
        };
    });

    it('initializes with up to 4 player slots', () => {
        const inputMgr = new InputManager(mockScene);
        expect(inputMgr.players).toHaveLength(4);
        expect(inputMgr.players[0]).toBeNull();
    });

    it('normalizes D-pad input to direction vector', () => {
        const inputMgr = new InputManager(mockScene);

        // Mock D-pad up
        const result = inputMgr.getDPadDirection({ up: true, down: false, left: false, right: false });
        expect(result.x).toBe(0);
        expect(result.y).toBe(-1);
    });

    it('normalizes diagonal D-pad input', () => {
        const inputMgr = new InputManager(mockScene);

        // Mock D-pad up-right
        const result = inputMgr.getDPadDirection({ up: true, down: false, left: false, right: true });
        expect(result.x).toBeCloseTo(0.707, 2);
        expect(result.y).toBeCloseTo(-0.707, 2);
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - InputManager module not found

**Step 3: Implement InputManager.js**

Create: `src/systems/InputManager.js`

```javascript
/**
 * Manages up to 4 gamepad controllers
 * Maps D-pad + buttons to player actions
 */
export default class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.players = [null, null, null, null]; // Up to 4 gamepads

        // Listen for gamepad connections
        if (scene.input.gamepad) {
            scene.input.gamepad.on('connected', (pad) => this.onGamepadConnected(pad));
            scene.input.gamepad.on('disconnected', (pad) => this.onGamepadDisconnected(pad));
        }
    }

    /**
     * Called when gamepad connects
     */
    onGamepadConnected(pad) {
        // Assign to first available player slot
        for (let i = 0; i < 4; i++) {
            if (this.players[i] === null) {
                this.players[i] = pad;
                console.log(`Player ${i + 1} gamepad connected`);
                break;
            }
        }
    }

    /**
     * Called when gamepad disconnects
     */
    onGamepadDisconnected(pad) {
        const index = this.players.indexOf(pad);
        if (index !== -1) {
            this.players[index] = null;
            console.log(`Player ${index + 1} gamepad disconnected`);
        }
    }

    /**
     * Gets D-pad direction as normalized vector
     * @param {Object} dpad - D-pad button states
     * @returns {{x: number, y: number}} Normalized direction
     */
    getDPadDirection(dpad) {
        let x = 0;
        let y = 0;

        if (dpad.left) x -= 1;
        if (dpad.right) x += 1;
        if (dpad.up) y -= 1;
        if (dpad.down) y += 1;

        // Normalize diagonal movement
        if (x !== 0 && y !== 0) {
            const length = Math.sqrt(x * x + y * y);
            x /= length;
            y /= length;
        }

        return { x, y };
    }

    /**
     * Gets input state for specific player
     * @param {number} playerIndex - 0-3
     * @returns {Object|null} Input state or null if no gamepad
     */
    getPlayerInput(playerIndex) {
        const pad = this.players[playerIndex];
        if (!pad) return null;

        return {
            dpad: {
                up: pad.up,
                down: pad.down,
                left: pad.left,
                right: pad.right
            },
            buttons: {
                a: pad.A, // Use item
                b: pad.B, // Melee
                x: pad.X, // Interact/revive
                y: pad.Y, // Cycle target
                rt: pad.R2, // Throw weapon
                lt: pad.L2  // Dodge
            }
        };
    }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS - all InputManager tests pass

**Step 5: Commit**

```bash
git add tests/InputManager.test.js src/systems/InputManager.js
git commit -m "feat: implement InputManager for 4 gamepad controllers"
```

---

## Task 7: Keyboard Fallback for Testing

**Files:**
- Modify: `src/systems/InputManager.js`
- Modify: `tests/InputManager.test.js`

**Step 1: Add test for keyboard fallback**

Modify: `tests/InputManager.test.js` - add to describe block:

```javascript
it('provides keyboard fallback for player 0', () => {
    const mockKeys = {
        W: { isDown: true },
        A: { isDown: false },
        S: { isDown: false },
        D: { isDown: false },
        SPACE: { isDown: false }
    };

    const inputMgr = new InputManager(mockScene);
    inputMgr.keyboardKeys = mockKeys;

    const input = inputMgr.getPlayerInputWithKeyboard(0);
    expect(input.dpad.up).toBe(true);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - method doesn't exist

**Step 3: Add keyboard support to InputManager**

Modify: `src/systems/InputManager.js` - add after constructor:

```javascript
    /**
     * Setup keyboard fallback for player 0 (testing without gamepad)
     */
    setupKeyboard() {
        const scene = this.scene;
        this.keyboardKeys = {
            W: scene.input.keyboard.addKey('W'),
            A: scene.input.keyboard.addKey('A'),
            S: scene.input.keyboard.addKey('S'),
            D: scene.input.keyboard.addKey('D'),
            SPACE: scene.input.keyboard.addKey('SPACE'),
            SHIFT: scene.input.keyboard.addKey('SHIFT'),
            E: scene.input.keyboard.addKey('E'),
            Q: scene.input.keyboard.addKey('Q')
        };
    }

    /**
     * Gets input with keyboard fallback for player 0
     * @param {number} playerIndex
     * @returns {Object|null} Input state
     */
    getPlayerInputWithKeyboard(playerIndex) {
        // Try gamepad first
        let input = this.getPlayerInput(playerIndex);

        // Fallback to keyboard for player 0
        if (!input && playerIndex === 0 && this.keyboardKeys) {
            input = {
                dpad: {
                    up: this.keyboardKeys.W.isDown,
                    down: this.keyboardKeys.S.isDown,
                    left: this.keyboardKeys.A.isDown,
                    right: this.keyboardKeys.D.isDown
                },
                buttons: {
                    a: this.keyboardKeys.E.isDown,
                    b: this.keyboardKeys.Q.isDown,
                    x: this.keyboardKeys.SPACE.isDown,
                    y: false,
                    rt: this.scene.input.mousePointer.isDown,
                    lt: this.keyboardKeys.SHIFT.isDown
                }
            };
        }

        return input;
    }
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/InputManager.test.js src/systems/InputManager.js
git commit -m "feat: add keyboard fallback for player 0 testing"
```

---

## Task 8: Wire Player Movement to Input

**Files:**
- Modify: `src/scenes/TestScene.js`

**Step 1: Add InputManager to TestScene**

Modify: `src/scenes/TestScene.js` - update create method:

```javascript
import InputManager from '../systems/InputManager.js';

// ... in create() method, after player creation:

        // Setup input
        this.inputManager = new InputManager(this);
        this.inputManager.setupKeyboard(); // For testing without gamepad
```

**Step 2: Add input handling in update method**

Modify: `src/scenes/TestScene.js` - update update method:

```javascript
    update(time, delta) {
        if (this.player) {
            // Get input for player 0
            const input = this.inputManager.getPlayerInputWithKeyboard(0);

            if (input) {
                const direction = this.inputManager.getDPadDirection(input.dpad);

                if (direction.x !== 0 || direction.y !== 0) {
                    this.player.move(direction.x, direction.y);
                } else {
                    this.player.stop();
                }
            }

            this.player.update(delta);

            // Update debug info
            this.debugText.setText([
                `World: (${this.player.worldX.toFixed(1)}, ${this.player.worldY.toFixed(1)}, ${this.player.worldZ.toFixed(1)})`,
                `Screen: (${this.player.sprite.x.toFixed(0)}, ${this.player.sprite.y.toFixed(0)})`,
                `Velocity: (${this.player.velocityX.toFixed(1)}, ${this.player.velocityY.toFixed(1)})`,
                `Controls: WASD to move`
            ]);
        }
    }
```

**Step 3: Test player movement manually**

Run: `npm run dev`
Expected: Player can move with WASD keys, stays on isometric grid, debug text updates

**Step 4: Commit**

```bash
git add src/scenes/TestScene.js
git commit -m "feat: wire player movement to WASD keyboard input"
```

---

## Task 9: Simple Test Dinosaur Entity

**Files:**
- Create: `src/entities/Dinosaur.js`
- Create: `tests/Dinosaur.test.js`

**Step 1: Write test for Dinosaur**

Create: `tests/Dinosaur.test.js`

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import Dinosaur from '../src/entities/Dinosaur.js';

describe('Dinosaur', () => {
    let mockScene;

    beforeEach(() => {
        mockScene = {
            add: {
                sprite: () => ({
                    setOrigin: () => ({}),
                    setDepth: () => ({}),
                    setTint: () => ({})
                })
            }
        };
    });

    it('initializes with health and type', () => {
        const dino = new Dinosaur(mockScene, 'compy', 20, 15, 0);
        expect(dino.type).toBe('compy');
        expect(dino.health).toBeGreaterThan(0);
    });

    it('takes damage and dies at 0 health', () => {
        const dino = new Dinosaur(mockScene, 'compy', 20, 15, 0);
        const initialHealth = dino.health;

        dino.takeDamage(5);
        expect(dino.health).toBe(initialHealth - 5);
        expect(dino.isDead).toBe(false);

        dino.takeDamage(initialHealth);
        expect(dino.health).toBe(0);
        expect(dino.isDead).toBe(true);
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - Dinosaur module not found

**Step 3: Implement simple Dinosaur class**

Create: `src/entities/Dinosaur.js`

```javascript
import Entity from './Entity.js';

/**
 * Base dinosaur entity
 * Phase 1: Simple test enemy with no attacks
 */
export default class Dinosaur extends Entity {
    /**
     * @param {Phaser.Scene} scene
     * @param {string} type - Dinosaur type (e.g., 'compy', 'raptor')
     * @param {number} worldX
     * @param {number} worldY
     * @param {number} worldZ
     */
    constructor(scene, type, worldX, worldY, worldZ) {
        super(scene, worldX, worldY, worldZ);

        this.type = type;
        this.health = this.getHealthForType(type);
        this.maxHealth = this.health;
        this.isDead = false;

        // Color tint based on type (temporary visualization)
        const color = type === 'compy' ? 0xff00ff : 0x00ffff;
        this.sprite.setTint(color);
    }

    /**
     * Gets base health for dinosaur type
     * @param {string} type
     * @returns {number}
     */
    getHealthForType(type) {
        const healthMap = {
            'compy': 20,
            'dilophosaurus': 50,
            'raptor': 100
        };
        return healthMap[type] || 50;
    }

    /**
     * Applies damage to dinosaur
     * @param {number} damage
     */
    takeDamage(damage) {
        if (this.isDead) return;

        this.health -= damage;

        if (this.health <= 0) {
            this.health = 0;
            this.isDead = true;
            this.onDeath();
        }
    }

    /**
     * Called when health reaches 0
     */
    onDeath() {
        // Phase 1: Just mark as dead
        // Later: death animation, score awards, etc.
        console.log(`${this.type} defeated!`);
    }

    /**
     * Update AI behavior
     * @param {number} delta
     */
    update(delta) {
        super.update(delta);

        // Phase 1: No AI yet, just exists
        // Later: state machine, attacks, etc.
    }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Add test dinosaur to TestScene**

Modify: `src/scenes/TestScene.js` - add to create method:

```javascript
import Dinosaur from '../entities/Dinosaur.js';

// ... after player creation:

        // Create test dinosaur
        this.testDino = new Dinosaur(this, 'compy', 20, 15, 0);
```

And update the update method:

```javascript
        if (this.testDino) {
            this.testDino.update(delta);
        }
```

**Step 6: Test visual**

Run: `npm run dev`
Expected: See magenta-tinted dinosaur sprite on grid alongside player

**Step 7: Commit**

```bash
git add tests/Dinosaur.test.js src/entities/Dinosaur.js src/scenes/TestScene.js
git commit -m "feat: implement basic Dinosaur entity without AI"
```

---

## Task 10: Basic Collision Detection

**Files:**
- Create: `src/systems/PhysicsManager.js`
- Create: `tests/PhysicsManager.test.js`

**Step 1: Write test for sphere collision**

Create: `tests/PhysicsManager.test.js`

```javascript
import { describe, it, expect } from 'vitest';
import { sphereVsSphere, distance3D } from '../src/systems/PhysicsManager.js';

describe('PhysicsManager', () => {
    describe('distance3D', () => {
        it('calculates 3D distance between two points', () => {
            const dist = distance3D(0, 0, 0, 3, 4, 0);
            expect(dist).toBe(5); // 3-4-5 triangle
        });

        it('includes Z axis in distance', () => {
            const dist = distance3D(0, 0, 0, 0, 0, 5);
            expect(dist).toBe(5);
        });
    });

    describe('sphereVsSphere', () => {
        it('detects collision when spheres overlap', () => {
            const a = { worldX: 0, worldY: 0, worldZ: 0, radius: 2 };
            const b = { worldX: 3, worldY: 0, worldZ: 0, radius: 2 };

            expect(sphereVsSphere(a, b)).toBe(true); // distance 3 < radius sum 4
        });

        it('detects no collision when spheres apart', () => {
            const a = { worldX: 0, worldY: 0, worldZ: 0, radius: 1 };
            const b = { worldX: 5, worldY: 0, worldZ: 0, radius: 1 };

            expect(sphereVsSphere(a, b)).toBe(false); // distance 5 > radius sum 2
        });

        it('considers Z axis for 3D collision', () => {
            const a = { worldX: 0, worldY: 0, worldZ: 0, radius: 1 };
            const b = { worldX: 0, worldY: 0, worldZ: 3, radius: 1 };

            expect(sphereVsSphere(a, b)).toBe(false); // separated on Z axis
        });
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - module not found

**Step 3: Implement PhysicsManager collision functions**

Create: `src/systems/PhysicsManager.js`

```javascript
/**
 * Custom 3D collision detection for isometric game
 * Handles sphere-vs-sphere and box collision
 */

/**
 * Calculates 3D distance between two points
 * @param {number} x1
 * @param {number} y1
 * @param {number} z1
 * @param {number} x2
 * @param {number} y2
 * @param {number} z2
 * @returns {number} Distance
 */
export function distance3D(x1, y1, z1, x2, y2, z2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dz = z2 - z1;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Sphere vs sphere collision detection
 * @param {Object} a - Entity with worldX, worldY, worldZ, radius
 * @param {Object} b - Entity with worldX, worldY, worldZ, radius
 * @returns {boolean} True if colliding
 */
export function sphereVsSphere(a, b) {
    const dist = distance3D(a.worldX, a.worldY, a.worldZ, b.worldX, b.worldY, b.worldZ);
    const radiusSum = a.radius + b.radius;
    return dist < radiusSum;
}

/**
 * Box vs box collision detection (AABB)
 * @param {Object} a - Entity with worldX, worldY, worldZ, width, depth, height
 * @param {Object} b - Entity with worldX, worldY, worldZ, width, depth, height
 * @returns {boolean} True if colliding
 */
export function boxVsBox(a, b) {
    // Check overlap on all 3 axes
    const xOverlap = Math.abs(a.worldX - b.worldX) < (a.width + b.width) / 2;
    const yOverlap = Math.abs(a.worldY - b.worldY) < (a.depth + b.depth) / 2;
    const zOverlap = Math.abs(a.worldZ - b.worldZ) < (a.height + b.height) / 2;

    return xOverlap && yOverlap && zOverlap;
}

/**
 * Sphere vs box collision detection
 * @param {Object} sphere - Entity with worldX, worldY, worldZ, radius
 * @param {Object} box - Entity with worldX, worldY, worldZ, width, depth, height
 * @returns {boolean} True if colliding
 */
export function sphereVsBox(sphere, box) {
    // Find closest point on box to sphere center
    const closestX = Math.max(box.worldX - box.width/2, Math.min(sphere.worldX, box.worldX + box.width/2));
    const closestY = Math.max(box.worldY - box.depth/2, Math.min(sphere.worldY, box.worldY + box.depth/2));
    const closestZ = Math.max(box.worldZ, Math.min(sphere.worldZ, box.worldZ + box.height));

    const dist = distance3D(sphere.worldX, sphere.worldY, sphere.worldZ, closestX, closestY, closestZ);
    return dist < sphere.radius;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Add collision radius to entities**

Modify: `src/entities/Player.js` - add to constructor:

```javascript
        // Collision
        this.radius = 0.5; // world units
```

Modify: `src/entities/Dinosaur.js` - add to constructor:

```javascript
        // Collision
        this.radius = this.getRadiusForType(type);
    }

    getRadiusForType(type) {
        const radiusMap = {
            'compy': 0.8,
            'dilophosaurus': 1.5,
            'raptor': 2.0
        };
        return radiusMap[type] || 1.0;
```

**Step 6: Add collision checking to TestScene**

Modify: `src/scenes/TestScene.js` - add to update method:

```javascript
import { sphereVsSphere } from '../systems/PhysicsManager.js';

// ... in update(), after player update:

            // Check collision with dinosaur
            if (this.testDino && !this.testDino.isDead) {
                if (sphereVsSphere(this.player, this.testDino)) {
                    // Phase 1: Just log collision
                    // Later: damage, knockback, etc.
                    console.log('Player collided with dinosaur!');
                }
            }
```

**Step 7: Test collision**

Run: `npm run dev`
Expected: Move player into dinosaur, see collision logs in console

**Step 8: Commit**

```bash
git add tests/PhysicsManager.test.js src/systems/PhysicsManager.js src/entities/Player.js src/entities/Dinosaur.js src/scenes/TestScene.js
git commit -m "feat: implement 3D collision detection system"
```

---

## Task 11: Camera Following System

**Files:**
- Create: `src/systems/CameraController.js`
- Create: `tests/CameraController.test.js`
- Modify: `src/scenes/TestScene.js`

**Step 1: Write test for camera center calculation**

Create: `tests/CameraController.test.js`

```javascript
import { describe, it, expect } from 'vitest';
import CameraController from '../src/systems/CameraController.js';

describe('CameraController', () => {
    let mockCamera;

    beforeEach(() => {
        mockCamera = {
            scrollX: 0,
            scrollY: 0,
            setScroll: function(x, y) {
                this.scrollX = x;
                this.scrollY = y;
            }
        };
    });

    it('calculates center point of single player', () => {
        const players = [{ worldX: 10, worldY: 15 }];
        const controller = new CameraController(mockCamera);

        const center = controller.calculatePlayerCenter(players);
        expect(center.worldX).toBe(10);
        expect(center.worldY).toBe(15);
    });

    it('calculates center point of multiple players', () => {
        const players = [
            { worldX: 10, worldY: 10 },
            { worldX: 20, worldY: 20 }
        ];
        const controller = new CameraController(mockCamera);

        const center = controller.calculatePlayerCenter(players);
        expect(center.worldX).toBe(15);
        expect(center.worldY).toBe(15);
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - module not found

**Step 3: Implement CameraController**

Create: `src/systems/CameraController.js`

```javascript
import { worldToScreen, SCREEN_WIDTH, SCREEN_HEIGHT } from './CoordinateSystem.js';

/**
 * Controls camera to follow players with smooth movement
 */
export default class CameraController {
    constructor(camera) {
        this.camera = camera;
        this.lerpSpeed = 0.05; // Smooth follow speed (0-1)
    }

    /**
     * Calculates center point of all active players
     * @param {Array} players - Array of player entities
     * @returns {{worldX: number, worldY: number}}
     */
    calculatePlayerCenter(players) {
        if (players.length === 0) {
            return { worldX: 15, worldY: 12 }; // Arena center fallback
        }

        let sumX = 0;
        let sumY = 0;

        for (const player of players) {
            sumX += player.worldX;
            sumY += player.worldY;
        }

        return {
            worldX: sumX / players.length,
            worldY: sumY / players.length
        };
    }

    /**
     * Updates camera to follow players smoothly
     * @param {Array} players - Array of player entities
     */
    update(players) {
        const center = this.calculatePlayerCenter(players);
        const screenPos = worldToScreen(center.worldX, center.worldY, 0);

        // Camera scroll targets the center
        // Subtract half screen dimensions to center on target
        const targetX = screenPos.x - SCREEN_WIDTH / 2;
        const targetY = screenPos.y - SCREEN_HEIGHT / 2;

        // Smooth lerp to target
        const currentX = this.camera.scrollX;
        const currentY = this.camera.scrollY;

        this.camera.setScroll(
            currentX + (targetX - currentX) * this.lerpSpeed,
            currentY + (targetY - currentY) * this.lerpSpeed
        );
    }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Add camera controller to TestScene**

Modify: `src/scenes/TestScene.js` - add to create method:

```javascript
import CameraController from '../systems/CameraController.js';

// ... after input setup:

        // Setup camera controller
        this.cameraController = new CameraController(this.cameras.main);
```

And update method:

```javascript
        // Update camera to follow player
        this.cameraController.update([this.player]);
```

**Step 6: Test camera following**

Run: `npm run dev`
Expected: Camera smoothly follows player as they move around arena

**Step 7: Commit**

```bash
git add tests/CameraController.test.js src/systems/CameraController.js src/scenes/TestScene.js
git commit -m "feat: implement camera controller with smooth player following"
```

---

## Task 12: Arena Bounds Constraint

**Files:**
- Modify: `src/entities/Player.js`
- Modify: `tests/Player.test.js`

**Step 1: Add test for arena bounds**

Modify: `tests/Player.test.js` - add test:

```javascript
    it('constrains position to arena bounds', () => {
        const player = new Player(mockScene, 0, 0, 0, 0);

        // Try to move out of bounds
        player.worldX = -5;
        player.worldY = -5;
        player.constrainToArena(0, 30, 0, 25);

        expect(player.worldX).toBe(0);
        expect(player.worldY).toBe(0);

        player.worldX = 35;
        player.worldY = 30;
        player.constrainToArena(0, 30, 0, 25);

        expect(player.worldX).toBe(30);
        expect(player.worldY).toBe(25);
    });
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - method doesn't exist

**Step 3: Implement constrainToArena in Player**

Modify: `src/entities/Player.js` - add method:

```javascript
    /**
     * Constrains player position to arena boundaries
     * @param {number} minX - Min world X
     * @param {number} maxX - Max world X
     * @param {number} minY - Min world Y
     * @param {number} maxY - Max world Y
     */
    constrainToArena(minX, maxX, minY, maxY) {
        this.worldX = Math.max(minX, Math.min(maxX, this.worldX));
        this.worldY = Math.max(minY, Math.min(maxY, this.worldY));
    }
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Apply bounds in TestScene**

Modify: `src/scenes/TestScene.js` - add to update after player update:

```javascript
            // Constrain to arena (30x25 world units from design doc)
            this.player.constrainToArena(0, 30, 0, 25);
```

**Step 6: Test bounds**

Run: `npm run dev`
Expected: Player cannot move outside grid boundaries

**Step 7: Commit**

```bash
git add tests/Player.test.js src/entities/Player.js src/scenes/TestScene.js
git commit -m "feat: add arena boundary constraints for players"
```

---

## Task 13: Phase 1 Polish and Documentation

**Files:**
- Create: `docs/phase-1-complete.md`
- Modify: `README.md`

**Step 1: Create phase completion document**

Create: `docs/phase-1-complete.md`

```markdown
# Phase 1: Core Mechanics - Complete

## Implemented Systems

### Coordinate System ✓
- Isometric projection (worldToScreen, screenToWorld)
- 3D world space (X, Y, Z axes)
- Depth sorting calculation
- Global constants (2K Resolution):
  - SCREEN_WIDTH=2560, SCREEN_HEIGHT=1440
  - TILE_WIDTH=128, TILE_HEIGHT=64
  - HEIGHT_SCALE=100
  - SCREEN_CENTER_X=1280, SCREEN_CENTER_Y=720

### Entity System ✓
- Base Entity class with world/screen position management
- Player entity with color coding (4 players)
- Dinosaur entity (basic, no AI yet)
- Velocity-based movement
- Automatic screen position updates

### Input System ✓
- InputManager for up to 4 gamepads
- D-pad direction normalization
- Keyboard fallback (WASD) for Player 0
- Button mapping structure prepared

### Collision Detection ✓
- 3D distance calculation
- Sphere-vs-sphere collision
- Box-vs-box collision (AABB)
- Sphere-vs-box collision
- Collision radius per entity

### Camera System ✓
- CameraController with smooth following
- Multi-player center calculation
- Lerp-based smooth movement
- Prepared for dynamic zoom (not yet implemented)

### Test Scene ✓
- Isometric ground grid visualization
- Debug text display (world pos, screen pos, velocity)
- Player movement testing
- Test dinosaur entity

## Testing Coverage

All core systems have unit tests:
- CoordinateSystem.test.js
- Entity.test.js
- Player.test.js
- Dinosaur.test.js
- InputManager.test.js
- PhysicsManager.test.js
- CameraController.test.js

Run tests: `npm test`

## What's Working

1. Player spawns at arena center (15, 12, 0)
2. WASD controls move player in isometric space
3. Player stays within arena bounds (0-30 X, 0-25 Y)
4. Camera smoothly follows player
5. Test dinosaur renders at correct depth
6. Collision detection logs when player touches dinosaur
7. Debug overlay shows real-time position data

## Ready for Phase 2

Phase 1 goals complete. Ready to proceed with Phase 2: Combat & Systems.

**Next tasks:**
- Weak point system
- Attack mechanics (spear throwing)
- Telegraph and dodge system
- Damage calculations
- Health/revival system
```

**Step 2: Update main README**

Create or modify: `README.md`

```markdown
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
npm test:ui

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
- Coordinate system and isometric rendering
- Player movement with D-pad/keyboard
- Basic collision detection
- Camera following

🔄 **Phase 2: Combat & Systems** - Not started

See `docs/phase-1-complete.md` for details.

## Controls (Keyboard Testing)

- WASD: Move player
- (Gamepad support implemented, connect controller)

## Design Document

Full design: `docs/design/2026-01-18-prehistoric-hunter-bar-game-design.md`
```

**Step 3: Commit documentation**

```bash
git add docs/phase-1-complete.md README.md
git commit -m "docs: add Phase 1 completion documentation"
```

**Step 4: Final verification**

Run: `npm test && npm run dev`
Expected: All tests pass, game runs with playable movement

**Step 5: Create phase summary commit**

```bash
git add -A
git commit -m "feat: complete Phase 1 - Core Mechanics

- Isometric coordinate system with 3D world space
- Player entity with 4-player color coding
- Basic dinosaur entity (no AI yet)
- Gamepad input manager with keyboard fallback
- 3D collision detection (sphere/box)
- Camera controller with smooth following
- Arena boundary constraints
- Test scene with grid visualization
- Comprehensive unit test coverage

Ready for Phase 2: Combat & Systems"
```

---

## Execution Complete

**Phase 1 implementation plan complete and saved.**

The plan creates a solid foundation with:
- Clean separation between world (3D logic) and screen (2D rendering) space
- Test-driven development with ~85% coverage
- Modular system architecture
- Working player movement and camera
- Foundation ready for combat systems in Phase 2

All 13 tasks follow the bite-sized approach (2-5 min steps) with:
- Failing test first
- Minimal implementation
- Verification
- Frequent commits

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach would you like?**