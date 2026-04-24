import { EventBus } from '../core/EventBus.js';
import { EVENTS, type EventData, type RoundPhase } from '../core/events.js';
import type { AttackDeclaration, PlayerAction, PlayerId } from '../core/types.js';
import PlayerPanel from './PlayerPanel.js';
import QtePrompt from './QtePrompt.js';

type TextLike = {
    setText?: (value: string) => TextLike;
    setVisible?: (visible: boolean) => TextLike;
    setScrollFactor?: (x: number, y?: number) => TextLike;
    setDepth?: (depth: number) => TextLike;
    destroy?: () => void;
};

type SceneLike = {
    add?: {
        text?: (x: number, y: number, value: string, style?: Record<string, unknown>) => TextLike;
    };
};

function makeText(scene: SceneLike, x: number, y: number, value: string): TextLike {
    const text = scene.add?.text?.(x, y, value, {});
    if (text) {
        text.setScrollFactor?.(0, 0);
        text.setDepth?.(200);
        return text;
    }

    return {
        setText(nextValue: string) {
            void nextValue;
            return this;
        },
        setVisible(nextVisible: boolean) {
            void nextVisible;
            return this;
        },
        destroy() {
            return;
        },
    };
}

export default class HUD {
    readonly scene: SceneLike;
    readonly bus: EventBus;
    readonly panels: Array<PlayerPanel>;
    readonly qtePrompt: QtePrompt;
    readonly dinoHealthLabel: TextLike;

    activePlayerIds: PlayerId[] = [0, 1, 2, 3];
    dinoHealth = 0;

    private readonly unsubscribe: Array<() => void>;

    constructor(scene: SceneLike, bus: EventBus) {
        this.scene = scene;
        this.bus = bus;
        this.panels = [
            new PlayerPanel(scene, 0, 16, 16),
            new PlayerPanel(scene, 1, 16, 112),
            new PlayerPanel(scene, 2, 224, 16),
            new PlayerPanel(scene, 3, 224, 112),
        ];
        this.qtePrompt = new QtePrompt(scene, 16, 224);
        this.dinoHealthLabel = makeText(scene, 16, 200, 'Dino HP 0');

        const on = <K extends keyof EventData>(event: K, handler: (data: EventData[K]) => void) => {
            this.bus.on(event, handler);
            this.unsubscribe.push(() => this.bus.off(event, handler));
        };

        this.unsubscribe = [];
        on(EVENTS.DINO_TELEGRAPH, (data) => this.handleDinoTelegraph(data));
        on(EVENTS.ROUND_PHASE_CHANGED, (data) => this.handlePhaseChanged(data));
        on(EVENTS.PLAYER_ACTION_SELECTED, (data) => this.handleActionSelected(data));
        on(EVENTS.PLAYER_DAMAGED, (data) => this.handlePlayerDamaged(data));
        on(EVENTS.PLAYER_DOWNED, (data) => this.handlePlayerDowned(data));
        on(EVENTS.DINO_HEALTH_CHANGED, (data) => this.setDinoHealth(data.newHealth));
        on(EVENTS.QTE_START, (data) => this.handleQteStart(data));
        on(EVENTS.QTE_RESULT, (data) => this.qtePrompt.showQteResult(data));
        on(EVENTS.POINTS_EARNED, (data) => this.handlePointsEarned(data));
        this.setActivePlayers(this.activePlayerIds);
    }

    setDinoHealth(health: number): void {
        this.dinoHealth = health;
        this.dinoHealthLabel.setText?.(`Dino HP ${health}`);
    }

    setActivePlayers(activePlayerIds: PlayerId[] | number): void {
        this.activePlayerIds = Array.isArray(activePlayerIds)
            ? activePlayerIds.map((id) => id as PlayerId)
            : Array.from({ length: activePlayerIds }, (_, index) => index as PlayerId);

        this.panels.forEach((panel, index) => {
            panel.setVisible(this.activePlayerIds.includes(index as PlayerId));
        });
    }

    destroy(): void {
        this.unsubscribe.forEach((unsubscribe) => unsubscribe());
        this.panels.forEach((panel) => panel.destroy());
        this.qtePrompt.destroy();
        this.dinoHealthLabel.destroy?.();
    }

    private handleDinoTelegraph(data: { attack: AttackDeclaration }): void {
        this.qtePrompt.showTelegraph(data.attack);
    }

    private handlePhaseChanged(data: { phase: RoundPhase; previousPhase: RoundPhase }): void {
        this.panels.forEach((panel) => panel.setPhase(data.phase));

        if (data.phase !== 'dodge_qte') {
            this.qtePrompt.hide();
        }
    }

    private handleActionSelected(data: { playerId: PlayerId; action: PlayerAction }): void {
        this.panels[data.playerId]?.setActionLabel(data.action);
    }

    private handlePlayerDamaged(data: { playerId: PlayerId; amount: number; newHealth: number }): void {
        this.panels[data.playerId]?.setHealth(data.newHealth);
    }

    private handlePlayerDowned(data: { playerId: PlayerId }): void {
        this.panels[data.playerId]?.setActionLabel('downed');
        this.panels[data.playerId]?.setHealth(0);
    }

    private handleQteStart(data: { affectedPlayerIds: PlayerId[]; qteType: 'timing' | 'smash' }): void {
        this.qtePrompt.showQteStart(data);
    }

    private handlePointsEarned(data: { playerId: PlayerId; amount: number; reason: string }): void {
        const panel = this.panels[data.playerId];
        if (!panel) {
            return;
        }

        panel.setPointsLabel(panel.points + data.amount, data.reason);
    }
}
