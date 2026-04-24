type KeyLike = {
    isDown?: boolean;
};

type KeyboardLike = {
    addKey?: (key: string) => KeyLike;
};

type GamepadLike = {
    left?: boolean;
    right?: boolean;
    up?: boolean;
    down?: boolean;
    A?: boolean;
    B?: boolean;
    X?: boolean;
    Y?: boolean;
    R2?: boolean;
    L2?: boolean;
    buttons?: Array<{ pressed?: boolean }>;
    axes?: Array<{ value?: number } | number>;
};

type SceneLike = {
    input?: {
        gamepad?: {
            on?: (event: string, handler: (pad: GamepadLike) => void) => void;
            off?: (event: string, handler: (pad: GamepadLike) => void) => void;
        } | null;
        keyboard?: KeyboardLike | null;
    };
};

export interface LogicalInputState {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    jumpPressed: boolean;
    meleePressed: boolean;
    throwPressed: boolean;
    interactPressed: boolean;
}

interface KeyboardBindings {
    left: KeyLike;
    right: KeyLike;
    throw: KeyLike;
    jump: KeyLike;
    up: KeyLike;
    melee: KeyLike;
    down: KeyLike;
    interact: KeyLike;
}

const KEY_ORDER = [
    'LEFT',
    'RIGHT',
    'R2',
    'SPACE',
    'UP',
    'B',
    'DOWN',
    'E',
];

function keyDown(key: KeyLike | undefined): boolean {
    return Boolean(key?.isDown);
}

function buttonDown(pad: GamepadLike, property: keyof GamepadLike, fallbackIndex?: number): boolean {
    const direct = pad[property];
    if (typeof direct === 'boolean') {
        return direct;
    }

    if (fallbackIndex !== undefined) {
        const button = pad.buttons?.[fallbackIndex];
        if (typeof button?.pressed === 'boolean') {
            return button.pressed;
        }
    }

    return false;
}

function axisValue(axis: unknown): number {
    if (typeof axis === 'number') {
        return axis;
    }

    if (axis && typeof axis === 'object' && 'value' in axis && typeof axis.value === 'number') {
        return axis.value;
    }

    return 0;
}

function neutralInput(): LogicalInputState {
    return {
        left: false,
        right: false,
        up: false,
        down: false,
        jumpPressed: false,
        meleePressed: false,
        throwPressed: false,
        interactPressed: false,
    };
}

export default class InputManager {
    readonly scene: SceneLike;
    readonly gamepads: Array<GamepadLike | null>;
    readonly latestInputs: Array<LogicalInputState>;

    private keyboardBindings: KeyboardBindings | null;
    private readonly onConnected: (pad: GamepadLike) => void;
    private readonly onDisconnected: (pad: GamepadLike) => void;

    constructor(scene: SceneLike, options: { playerCount?: number } = {}) {
        this.scene = scene;
        const playerCount = options.playerCount ?? 4;
        this.gamepads = Array.from({ length: playerCount }, () => null);
        this.latestInputs = Array.from({ length: playerCount }, () => neutralInput());
        this.keyboardBindings = null;

        this.onConnected = (pad) => this.onGamepadConnected(pad);
        this.onDisconnected = (pad) => this.onGamepadDisconnected(pad);

        this.scene.input?.gamepad?.on?.('connected', this.onConnected);
        this.scene.input?.gamepad?.on?.('disconnected', this.onDisconnected);
    }

    setupKeyboard(): KeyboardBindings | null {
        if (this.keyboardBindings) {
            return this.keyboardBindings;
        }

        const keyboard = this.scene.input?.keyboard;
        if (!keyboard?.addKey) {
            return null;
        }

        const [
            left,
            right,
            throwKey,
            jump,
            up,
            melee,
            down,
            interact,
        ] = KEY_ORDER.map((key) => keyboard.addKey!(key));

        this.keyboardBindings = {
            left,
            right,
            throw: throwKey,
            jump,
            up,
            melee,
            down,
            interact,
        };

        return this.keyboardBindings;
    }

    onGamepadConnected(pad: GamepadLike): void {
        const emptySlot = this.gamepads.findIndex((slot) => slot === null);
        if (emptySlot !== -1) {
            this.gamepads[emptySlot] = pad;
        }
    }

    onGamepadDisconnected(pad: GamepadLike): void {
        const slot = this.gamepads.findIndex((existing) => existing === pad);
        if (slot !== -1) {
            this.gamepads[slot] = null;
        }
    }

    update(): Array<LogicalInputState> {
        const nextInputs = this.gamepads.map((_, index) => this.getPlayerInputWithKeyboard(index));
        nextInputs.forEach((input, index) => {
            this.latestInputs[index] = input;
        });
        return nextInputs;
    }

    getPlayerInput(playerIndex: number): LogicalInputState {
        const pad = this.gamepads[playerIndex];
        if (pad) {
            return this.readGamepadInput(pad);
        }

        if (playerIndex === 0) {
            const keyboardInput = this.getPlayerInputWithKeyboard(0);
            return keyboardInput;
        }

        return neutralInput();
    }

    getPlayerInputWithKeyboard(playerIndex: number): LogicalInputState {
        const pad = this.gamepads[playerIndex];
        if (pad) {
            return this.readGamepadInput(pad);
        }

        if (playerIndex !== 0) {
            return neutralInput();
        }

        const bindings = this.setupKeyboard();
        if (!bindings) {
            return neutralInput();
        }

        return {
            left: keyDown(bindings.left),
            right: keyDown(bindings.right),
            up: keyDown(bindings.up),
            down: keyDown(bindings.down),
            jumpPressed: keyDown(bindings.jump),
            meleePressed: keyDown(bindings.melee),
            throwPressed: keyDown(bindings.throw),
            interactPressed: keyDown(bindings.interact),
        };
    }

    destroy(): void {
        this.scene.input?.gamepad?.off?.('connected', this.onConnected);
        this.scene.input?.gamepad?.off?.('disconnected', this.onDisconnected);
        this.keyboardBindings = null;
        this.gamepads.fill(null);
        this.latestInputs.fill(neutralInput());
    }

    private readGamepadInput(pad: GamepadLike): LogicalInputState {
        const left = buttonDown(pad, 'left', 14) || axisValue(pad.axes?.[0]) < -0.5;
        const right = buttonDown(pad, 'right', 15) || axisValue(pad.axes?.[0]) > 0.5;
        const up = buttonDown(pad, 'up', 12) || axisValue(pad.axes?.[1]) < -0.5;
        const down = buttonDown(pad, 'down', 13) || axisValue(pad.axes?.[1]) > 0.5;

        return {
            left,
            right,
            up,
            down,
            jumpPressed: buttonDown(pad, 'A', 0),
            meleePressed: buttonDown(pad, 'B', 1),
            throwPressed: buttonDown(pad, 'R2', 7) || buttonDown(pad, 'Y', 3),
            interactPressed: buttonDown(pad, 'X', 2) || buttonDown(pad, 'L2', 6),
        };
    }
}
