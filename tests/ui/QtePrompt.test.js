import { describe, expect, it } from 'vitest';
import QtePrompt from '../../src/ui/QtePrompt.ts';

function makeText(value = '') {
    return {
        text: value,
        visible: false,
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

describe('QtePrompt', () => {
    it('shows telegraph details before a QTE starts', () => {
        const prompt = new QtePrompt(createScene());

        prompt.showTelegraph({
            type: 'bite',
            affectedZones: [{ zone: 'mid', flank: 'center' }],
            qteType: 'timing',
            damage: 4,
        });

        expect(prompt.visible).toBe(true);
        expect(prompt.mode).toBe('telegraph');
        expect(prompt.titleLabel.text).toBe('Telegraph: bite');
        expect(prompt.detailLabel.text).toBe('QTE timing for 4 damage');
    });

    it('updates the prompt with the active player list and result text', () => {
        const prompt = new QtePrompt(createScene());

        prompt.showQteStart({ affectedPlayerIds: [0, 2], qteType: 'smash' });
        prompt.showQteResult({ playerId: 2, success: true, perfect: false });

        expect(prompt.visible).toBe(true);
        expect(prompt.mode).toBe('result');
        expect(prompt.titleLabel.text).toBe('QTE: smash');
        expect(prompt.detailLabel.text).toBe('Players: P1, P3');
        expect(prompt.resultLabel.text).toBe('P3 success');
    });
});
