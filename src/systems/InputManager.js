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
}
