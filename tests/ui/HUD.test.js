import { describe, expect, it } from 'vitest';
import { EventBus } from '../../src/core/EventBus.ts';
import { EVENTS } from '../../src/core/events.ts';
import HUD from '../../src/ui/HUD.ts';

function makeText(value = '') {
    return {
        text: value,
        visible: true,
        setText(nextValue) {
            this.text = nextValue;
            return this;
        },
        setVisible(nextVisible) {
            this.visible = nextVisible;
            return this;
        },
        destroy() {
            this.visible = false;
        },
    };
}

function createScene() {
    return {
        add: {
            text: (_x, _y, value) => makeText(value),
        },
    };
}

describe('HUD', () => {
    it('updates player panels and dino health from shared events', () => {
        const bus = new EventBus();
        const hud = new HUD(createScene(), bus);

        bus.emit(EVENTS.ROUND_PHASE_CHANGED, { phase: 'submit', previousPhase: 'plan' });
        bus.emit(EVENTS.PLAYER_ACTION_SELECTED, {
            playerId: 0,
            action: { type: 'reposition', moveTo: { zone: 'mid', flank: 'left' } },
        });
        bus.emit(EVENTS.PLAYER_DAMAGED, { playerId: 0, amount: 2, newHealth: 3 });
        bus.emit(EVENTS.POINTS_EARNED, { playerId: 0, amount: 10, reason: 'attack bonus' });
        bus.emit(EVENTS.DINO_HEALTH_CHANGED, { amount: -5, newHealth: 17 });

        expect(hud.panels[0].phase).toBe('submit');
        expect(hud.panels[0].action).toBe('reposition:mid/left');
        expect(hud.panels[0].health).toBe(3);
        expect(hud.panels[0].points).toBe(10);
        expect(hud.dinoHealth).toBe(17);
        expect(hud.dinoHealthLabel.text).toBe('Dino HP 17');
    });

    it('toggles visible player panels through setActivePlayers', () => {
        const bus = new EventBus();
        const hud = new HUD(createScene(), bus);

        hud.setActivePlayers([0, 2]);

        expect(hud.panels[0].visible).toBe(true);
        expect(hud.panels[1].visible).toBe(false);
        expect(hud.panels[2].visible).toBe(true);
        expect(hud.panels[3].visible).toBe(false);
    });
});
