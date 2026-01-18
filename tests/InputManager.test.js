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

    it('provides keyboard fallback for player 0', () => {
        const mockKeys = {
            W: { isDown: true },
            A: { isDown: false },
            S: { isDown: false },
            D: { isDown: false },
            SPACE: { isDown: false },
            SHIFT: { isDown: false },
            E: { isDown: false },
            Q: { isDown: false }
        };

        mockScene.input.mousePointer = { isDown: false };

        const inputMgr = new InputManager(mockScene);
        inputMgr.keyboardKeys = mockKeys;

        const input = inputMgr.getPlayerInputWithKeyboard(0);
        expect(input.dpad.up).toBe(true);
    });
});
