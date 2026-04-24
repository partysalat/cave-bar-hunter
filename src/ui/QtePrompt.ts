import type { AttackDeclaration, PlayerId, QteType } from '../core/types.js';

type TextLike = {
    setText?: (value: string) => TextLike;
    setVisible?: (visible: boolean) => TextLike;
    setScrollFactor?: (x: number, y?: number) => TextLike;
    setDepth?: (depth: number) => TextLike;
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
        text.setScrollFactor?.(0, 0);
        text.setDepth?.(220);
        return text;
    }

    return {
        text: value,
        visible: false,
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

function formatPlayerIds(playerIds: PlayerId[]): string {
    return playerIds.map((id) => `P${id + 1}`).join(', ');
}

export default class QtePrompt {
    readonly titleLabel: TextLike;
    readonly detailLabel: TextLike;
    readonly resultLabel: TextLike;

    visible = false;
    mode: 'idle' | 'telegraph' | 'qte' | 'result' = 'idle';
    qteType: QteType | null = null;
    affectedPlayerIds: PlayerId[] = [];

    constructor(scene: SceneLike, x = 0, y = 0) {
        this.titleLabel = makeText(scene, x, y, '');
        this.detailLabel = makeText(scene, x, y + 16, '');
        this.resultLabel = makeText(scene, x, y + 32, '');
    }

    showTelegraph(attack: AttackDeclaration): void {
        this.visible = true;
        this.mode = 'telegraph';
        this.qteType = attack.qteType;
        this.titleLabel.setVisible?.(true);
        this.detailLabel.setVisible?.(true);
        this.resultLabel.setVisible?.(false);
        this.titleLabel.setText?.(`Telegraph: ${attack.type}`);
        this.detailLabel.setText?.(`QTE ${attack.qteType} for ${attack.damage} damage`);
    }

    showQteStart(payload: { affectedPlayerIds: PlayerId[]; qteType: QteType }): void {
        this.visible = true;
        this.mode = 'qte';
        this.qteType = payload.qteType;
        this.affectedPlayerIds = payload.affectedPlayerIds;
        this.titleLabel.setVisible?.(true);
        this.detailLabel.setVisible?.(true);
        this.resultLabel.setVisible?.(false);
        this.titleLabel.setText?.(`QTE: ${payload.qteType}`);
        this.detailLabel.setText?.(`Players: ${formatPlayerIds(payload.affectedPlayerIds)}`);
    }

    showQteResult(payload: { playerId: PlayerId; success: boolean; perfect: boolean }): void {
        this.visible = true;
        this.mode = 'result';
        const result = payload.success ? 'success' : 'fail';
        const suffix = payload.perfect ? ' perfect' : '';
        this.resultLabel.setVisible?.(true);
        this.resultLabel.setText?.(`P${payload.playerId + 1} ${result}${suffix}`);
        this.detailLabel.setVisible?.(true);
    }

    hide(): void {
        this.visible = false;
        this.mode = 'idle';
        this.titleLabel.setVisible?.(false);
        this.detailLabel.setVisible?.(false);
        this.resultLabel.setVisible?.(false);
    }

    destroy(): void {
        this.titleLabel.destroy?.();
        this.detailLabel.destroy?.();
        this.resultLabel.destroy?.();
    }
}
