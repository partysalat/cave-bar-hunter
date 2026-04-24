import { describe, expect, it, vi } from 'vitest';
import InputManager from '../../src/input/InputManager.ts';

function createScene() {
    return {
        input: {
            gamepad: {
                on: vi.fn(),
                off: vi.fn(),
            },
            keyboard: {
                addKey: vi.fn(() => ({ isDown: false })),
            },
        },
    };
}

describe('InputManager', () => {
    it('registers connected gamepads in the first available slot', () => {
        const manager = new InputManager(createScene());
        const pad = { left: true };

        manager.onGamepadConnected(pad);

        expect(manager.gamepads[0]).toBe(pad);
    });

    it('provides keyboard fallback for player 0 using logical actions', () => {
        const scene = createScene();
        scene.input.keyboard.addKey = vi
            .fn()
            .mockReturnValueOnce({ isDown: true })
            .mockReturnValueOnce({ isDown: false })
            .mockReturnValueOnce({ isDown: false })
            .mockReturnValueOnce({ isDown: true })
            .mockReturnValueOnce({ isDown: false })
            .mockReturnValueOnce({ isDown: true })
            .mockReturnValueOnce({ isDown: false })
            .mockReturnValueOnce({ isDown: true });

        const manager = new InputManager(scene);
        manager.setupKeyboard();

        const input = manager.getPlayerInputWithKeyboard(0);

        expect(input.left).toBe(true);
        expect(input.right).toBe(false);
        expect(input.up).toBe(false);
        expect(input.down).toBe(false);
        expect(input.jumpPressed).toBe(true);
        expect(input.meleePressed).toBe(true);
        expect(input.throwPressed).toBe(false);
        expect(input.interactPressed).toBe(true);
    });

    it('maps a connected gamepad to logical actions', () => {
        const manager = new InputManager(createScene());
        const pad = {
            left: true,
            right: false,
            up: false,
            down: true,
            A: true,
            B: false,
            R2: true,
            X: true,
        };

        manager.onGamepadConnected(pad);

        const input = manager.getPlayerInput(0);

        expect(input).toEqual({
            left: true,
            right: false,
            up: false,
            down: true,
            jumpPressed: true,
            meleePressed: false,
            throwPressed: true,
            interactPressed: true,
        });
    });
});
