import { describe, expect, it, vi } from 'vitest';
import InputManager from '../src/systems/InputManager.js';

function createScene() {
    return {
        input: {
            gamepad: {
                on: vi.fn(),
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

    it('provides keyboard fallback for player 0', () => {
        const scene = createScene();
        scene.input.keyboard.addKey = vi
            .fn()
            .mockReturnValueOnce({ isDown: true })
            .mockReturnValueOnce({ isDown: false })
            .mockReturnValueOnce({ isDown: false })
            .mockReturnValueOnce({ isDown: true })
            .mockReturnValueOnce({ isDown: false })
            .mockReturnValueOnce({ isDown: true })
            .mockReturnValueOnce({ isDown: false });

        const manager = new InputManager(scene);
        manager.setupKeyboard();

        const input = manager.getPlayerInputWithKeyboard(0);

        expect(input.left).toBe(true);
        expect(input.right).toBe(false);
        expect(input.jumpPressed).toBe(true);
        expect(input.meleePressed).toBe(true);
        expect(input.throwPressed).toBe(false);
    });
});
