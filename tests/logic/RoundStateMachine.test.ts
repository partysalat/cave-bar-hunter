import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/EventBus.js';
import { EVENTS } from '../../src/core/events.js';
import { RoundStateMachine } from '../../src/logic/RoundStateMachine.js';

describe('RoundStateMachine', () => {
    it('emits player action selection and advances to submit after all players act', () => {
        const bus = new EventBus();
        const phaseEvents = vi.fn();
        const actionEvents = vi.fn();
        const machine = new RoundStateMachine(bus, { planDurationMs: 1000, submitDurationMs: 250 });

        bus.on(EVENTS.ROUND_PHASE_CHANGED, phaseEvents);
        bus.on(EVENTS.PLAYER_ACTION_SELECTED, actionEvents);

        machine.start();
        machine.submitAction(0, { type: 'attack' });
        machine.submitAction(1, { type: 'brace' });
        machine.submitAction(2, { type: 'revive' });
        machine.submitAction(3, { type: 'reposition', moveTo: { zone: 'mid', flank: 'center' } });

        expect(machine.getPhase()).toBe('submit');
        expect(actionEvents).toHaveBeenCalledTimes(4);
        expect(phaseEvents).toHaveBeenCalledWith({ previousPhase: 'plan', phase: 'submit' });
    });

    it('forces submit when the plan timer runs out', () => {
        const bus = new EventBus();
        const machine = new RoundStateMachine(bus, { planDurationMs: 40, submitDurationMs: 250 });
        const phaseEvents = vi.fn();

        bus.on(EVENTS.ROUND_PHASE_CHANGED, phaseEvents);

        machine.start();
        machine.tick(40);

        expect(machine.getPhase()).toBe('submit');
        expect(phaseEvents).toHaveBeenCalledWith({ previousPhase: 'plan', phase: 'submit' });
    });

    it('walks through submit and resolve explicitly', () => {
        const bus = new EventBus();
        const machine = new RoundStateMachine(bus);

        machine.start();
        machine.forceSubmit();
        machine.beginResolve();
        machine.beginDodgeQte();

        expect(machine.getPhase()).toBe('dodge_qte');
    });
});
