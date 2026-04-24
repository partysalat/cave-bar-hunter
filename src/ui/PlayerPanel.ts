import type { RoundPhase } from '../core/events.js';
import type { PlayerAction } from '../core/types.js';

type TextLike = {
    setText?: (value: string) => TextLike;
    setVisible?: (visible: boolean) => TextLike;
    destroy?: () => void;
    text?: string;
    visible?: boolean;
};

type SceneLike = {
    add?: {
        text?: (x: number, y: number, value: string, style?: Record<string, unknown>) => TextLike;
    };
};

function makeText(scene: SceneLike, x: number, y: number, value: string): TextLike {
    const text = scene.add?.text?.(x, y, value, {});
    if (text) {
        return text;
    }

    return {
        text: value,
        visible: true,
        setText(nextValue: string) {
            this.text = nextValue;
            return this;
        },
        setVisible(nextVisible: boolean) {
            this.visible = nextVisible;
            return this;
        },
        destroy() {
            this.visible = false;
        },
    };
}

function stringifyAction(action: PlayerAction | string): string {
    if (typeof action === 'string') {
        return action;
    }

    if (action.type === 'aimed_strike') {
        return `${action.type}:${action.target}`;
    }

    if (action.type === 'reposition') {
        return `${action.type}:${action.moveTo.zone}/${action.moveTo.flank}`;
    }

    return action.type;
}

export default class PlayerPanel {
    readonly playerId: number;
    readonly phaseLabel: TextLike;
    readonly healthLabel: TextLike;
    readonly positionLabel: TextLike;
    readonly actionLabel: TextLike;
    readonly pointsLabel: TextLike;

    visible = true;
    phase: RoundPhase = 'plan';
    health = 0;
    position = '';
    action = '';
    points = 0;

    constructor(scene: SceneLike, playerId: number, x = 0, y = 0) {
        this.playerId = playerId;
        this.phaseLabel = makeText(scene, x, y, `P${playerId + 1} plan`);
        this.healthLabel = makeText(scene, x, y + 16, 'HP 0');
        this.positionLabel = makeText(scene, x, y + 32, '');
        this.actionLabel = makeText(scene, x, y + 48, '');
        this.pointsLabel = makeText(scene, x, y + 64, 'PTS 0');
    }

    setPhase(phase: RoundPhase): void {
        this.phase = phase;
        this.phaseLabel.setText?.(`P${this.playerId + 1} ${phase}`);
    }

    setHealth(health: number): void {
        this.health = health;
        this.healthLabel.setText?.(`HP ${health}`);
    }

    setPositionLabel(value: string): void {
        this.position = value;
        this.positionLabel.setText?.(value);
    }

    setActionLabel(action: PlayerAction | string): void {
        this.action = stringifyAction(action);
        this.actionLabel.setText?.(this.action);
    }

    setPointsLabel(points: number, reason = ''): void {
        this.points = points;
        const suffix = reason ? ` ${reason}` : '';
        this.pointsLabel.setText?.(`PTS ${points}${suffix}`);
    }

    setVisible(visible: boolean): void {
        this.visible = visible;
        this.phaseLabel.setVisible?.(visible);
        this.healthLabel.setVisible?.(visible);
        this.positionLabel.setVisible?.(visible);
        this.actionLabel.setVisible?.(visible);
        this.pointsLabel.setVisible?.(visible);
    }

    destroy(): void {
        this.phaseLabel.destroy?.();
        this.healthLabel.destroy?.();
        this.positionLabel.destroy?.();
        this.actionLabel.destroy?.();
        this.pointsLabel.destroy?.();
    }
}
