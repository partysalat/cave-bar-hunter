export default class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.gamepads = [null, null, null, null];
        this.keyboardKeys = null;

        const gamepad = scene.input?.gamepad;
        if (gamepad?.on) {
            gamepad.on('connected', (pad) => this.onGamepadConnected(pad));
            gamepad.on('disconnected', (pad) => this.onGamepadDisconnected(pad));
        }
    }

    setupKeyboard() {
        const keyboard = this.scene.input?.keyboard;
        if (!keyboard?.addKey) return;

        this.keyboardKeys = {
            LEFT: keyboard.addKey('LEFT'),
            RIGHT: keyboard.addKey('RIGHT'),
            UP: keyboard.addKey('UP'),
            SPACE: keyboard.addKey('SPACE'),
            SHIFT: keyboard.addKey('SHIFT'),
            Z: keyboard.addKey('Z'),
            X: keyboard.addKey('X'),
        };
    }

    onGamepadConnected(pad) {
        const freeIndex = this.gamepads.findIndex((entry) => entry === null);
        if (freeIndex !== -1) {
            this.gamepads[freeIndex] = pad;
        }
    }

    onGamepadDisconnected(pad) {
        const index = this.gamepads.indexOf(pad);
        if (index !== -1) {
            this.gamepads[index] = null;
        }
    }

    getPlayerInput(playerIndex) {
        const pad = this.gamepads[playerIndex];
        if (!pad) return null;

        return {
            left: Boolean(pad.left),
            right: Boolean(pad.right),
            jumpPressed: Boolean(pad.up || pad.A || pad.B),
            dodgePressed: Boolean(pad.R2 || pad.L2 || pad.X),
            meleePressed: Boolean(pad.B || pad.Y),
            throwPressed: Boolean(pad.R1 || pad.R2 || pad.A),
        };
    }

    getPlayerInputWithKeyboard(playerIndex) {
        const gamepadInput = this.getPlayerInput(playerIndex);
        if (gamepadInput) return gamepadInput;

        if (playerIndex !== 0 || !this.keyboardKeys) return null;

        return {
            left: Boolean(this.keyboardKeys.LEFT.isDown),
            right: Boolean(this.keyboardKeys.RIGHT.isDown),
            jumpPressed: Boolean(this.keyboardKeys.UP.isDown || this.keyboardKeys.SPACE.isDown),
            dodgePressed: Boolean(this.keyboardKeys.SHIFT.isDown),
            meleePressed: Boolean(this.keyboardKeys.Z.isDown),
            throwPressed: Boolean(this.keyboardKeys.X.isDown),
        };
    }
}
