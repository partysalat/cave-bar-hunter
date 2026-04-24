import Phaser from 'phaser';

import { EventBus } from '../core/EventBus.js';
import { EVENTS, type RoundPhase } from '../core/events.js';
import type { AttackDeclaration, PlayerAction, PlayerId, Position } from '../core/types.js';
import InputManager, { type LogicalInputState } from '../input/InputManager.js';
import ActionResolver from '../logic/ActionResolver.js';
import PositioningSystem from '../logic/PositioningSystem.js';
import RoundStateMachine from '../logic/RoundStateMachine.js';
import ScoringSystem from '../logic/ScoringSystem.js';
import SessionManager, { type SessionPlayerState } from '../logic/SessionManager.js';
import StaggerSystem from '../logic/StaggerSystem.js';
import { AttackZoneResolver } from '../logic/dino/AttackZoneResolver.js';
import { DilophosaurusAI } from '../logic/dino/DilophosaurusAI.js';
import { ArenaRenderer } from '../rendering/ArenaRenderer.js';
import {
    getGeneratedSpriteCookAnimation,
    spriteCookAssetKey,
    spriteCookEntityAtlasKey,
} from '../rendering/spritecookAssets.js';
import HUD from '../ui/HUD.js';
import { SCENE_KEYS } from './sceneKeys.js';

type PlayerRuntimeState = SessionPlayerState & {
    downed: boolean;
    selectedIndex: number;
};

type HuntSceneData = {
    sessionManager?: SessionManager;
};

const PLAYER_IDS: PlayerId[] = [0, 1, 2, 3];
const DEFAULT_PLAYER_HEALTH = 4;
const DEFAULT_DINO_HEALTH = 30;
const ACTION_ORDER = ['attack', 'brace', 'aimed_head', 'aimed_legs', 'reposition', 'revive'] as const;
type ActionChoice = typeof ACTION_ORDER[number];

function createDefaultPlayerState(): Record<PlayerId, PlayerRuntimeState> {
    return {
        0: { playerId: 0, health: DEFAULT_PLAYER_HEALTH, score: 0, downed: false, selectedIndex: 0 },
        1: { playerId: 1, health: DEFAULT_PLAYER_HEALTH, score: 0, downed: false, selectedIndex: 0 },
        2: { playerId: 2, health: DEFAULT_PLAYER_HEALTH, score: 0, downed: false, selectedIndex: 0 },
        3: { playerId: 3, health: DEFAULT_PLAYER_HEALTH, score: 0, downed: false, selectedIndex: 0 },
    };
}

function positionLabel(position: Position): string {
    return `${position.zone}/${position.flank}`;
}

function nextZone(zone: Position['zone']): Position['zone'] {
    if (zone === 'close') {
        return 'mid';
    }

    if (zone === 'mid') {
        return 'far';
    }

    return 'mid';
}

function selectedAction(choice: ActionChoice, position: Position): PlayerAction {
    switch (choice) {
        case 'attack':
            return { type: 'attack' };
        case 'brace':
            return { type: 'brace' };
        case 'aimed_head':
            return { type: 'aimed_strike', target: 'head' };
        case 'aimed_legs':
            return { type: 'aimed_strike', target: 'legs' };
        case 'reposition':
            return {
                type: 'reposition',
                moveTo: {
                    zone: nextZone(position.zone),
                    flank: position.flank,
                },
            };
        case 'revive':
            return { type: 'revive' };
    }
}

export class HuntScene extends Phaser.Scene {
    private arena?: ArenaRenderer;
    private bus!: EventBus;
    private hud?: HUD;
    private inputManager?: InputManager;
    private roundStateMachine?: RoundStateMachine;
    private positioningSystem?: PositioningSystem;
    private actionResolver?: ActionResolver;
    private staggerSystem?: StaggerSystem;
    private scoringSystem?: ScoringSystem;
    private sessionManager!: SessionManager;
    private attackZoneResolver?: AttackZoneResolver;
    private dinosaurAI?: DilophosaurusAI;
    private playerState = createDefaultPlayerState();
    private playerSprites = new Map<PlayerId, Phaser.GameObjects.Sprite>();
    private previousInputs: Array<LogicalInputState> = PLAYER_IDS.map(() => ({
        left: false,
        right: false,
        up: false,
        down: false,
        jumpPressed: false,
        meleePressed: false,
        throwPressed: false,
        interactPressed: false,
    }));
    private currentTelegraph?: AttackDeclaration;
    private dinoHealth = DEFAULT_DINO_HEALTH;
    private qteElapsedMs = 0;
    private qteResponded = new Set<PlayerId>();
    private qteAffected: PlayerId[] = [];
    private bonusDamageRound = false;
    constructor() {
        super({ key: SCENE_KEYS.HUNT });
    }

    init(data: HuntSceneData): void {
        this.sessionManager = data.sessionManager ?? new SessionManager();
    }

    create(): void {
        const { width, height } = this.scale;

        this.cameras.main.setBackgroundColor('#06110a');

        this.bus = new EventBus();
        this.loadPlayerState();
        this.positioningSystem = new PositioningSystem();
        this.actionResolver = new ActionResolver();
        this.staggerSystem = new StaggerSystem(this.bus);
        this.scoringSystem = new ScoringSystem(this.bus, {
            initialTotals: {
                0: this.playerState[0].score,
                1: this.playerState[1].score,
                2: this.playerState[2].score,
                3: this.playerState[3].score,
            },
        });
        this.attackZoneResolver = new AttackZoneResolver();
        this.dinosaurAI = new DilophosaurusAI();
        this.roundStateMachine = new RoundStateMachine(this.bus, {
            planDurationMs: 6000,
            submitDurationMs: 500,
            dodgeQteDurationMs: 2200,
        });
        this.inputManager = new InputManager(this);
        this.hud = new HUD(this, this.bus);
        this.hud.setActivePlayers(PLAYER_IDS);

        this.arena = new ArenaRenderer(this);
        this.arena.create();

        const playerSprites = [
            { entity: 'red', playerId: 0 },
            { entity: 'blue', playerId: 1 },
            { entity: 'yellow', playerId: 2 },
            { entity: 'green', playerId: 3 },
        ] as const;

        for (const player of playerSprites) {
            const position = this.positioningSystem.getPosition(player.playerId);
            const point = this.toScreenPosition(position);
            const animation = getGeneratedSpriteCookAnimation(player.entity, 'idle');
            const initialFrame = animation?.data.frames[0];
            const sprite = this.add
                .sprite(
                    point.x,
                    point.y,
                    animation?.entity.atlasKey ?? spriteCookEntityAtlasKey(player.entity),
                    initialFrame,
                )
                .setScale(0.42)
                .setDepth(40 + player.playerId);

            if (animation) {
                sprite.play(animation.key);
            }

            this.playerSprites.set(player.playerId, sprite);
        }

        const dinoX = width * 0.76;
        const dinoY = height * 0.62;
        const dinoAnimation = getGeneratedSpriteCookAnimation('dilophosaurus', 'idle');
        const dinoSprite = this.add
            .sprite(
                dinoX,
                dinoY,
                dinoAnimation?.entity.atlasKey ?? spriteCookAssetKey(['players', 'enemies', 'dilophosaurus', 'still']),
                dinoAnimation?.data.frames[0],
            )
            .setScale(0.48)
            .setDepth(55);
        if (dinoAnimation) {
            dinoSprite.play(dinoAnimation.key);
        }

        this.add
            .text(dinoX, dinoY - 72, 'Dilophosaurus', {
                color: '#ffe39b',
                fontFamily: 'monospace',
                fontSize: '18px',
                stroke: '#1d1206',
                strokeThickness: 4,
            })
            .setOrigin(0.5, 0.5)
            .setDepth(105);

        this.add
            .text(width / 2, height - 42, 'P1: Left/Right choose action, Space lock in, tap Space in QTEs', {
                color: '#f2ffd8',
                fontFamily: 'monospace',
                fontSize: '18px',
                stroke: '#10210f',
                strokeThickness: 4,
            })
            .setOrigin(0.5, 0.5)
            .setDepth(110)
            .setScrollFactor(0);

        this.add
            .text(width / 2, height - 18, 'P2-P4 auto-act in this spike, C opens the cave bar', {
                color: '#c7f0b5',
                fontFamily: 'monospace',
                fontSize: '15px',
                stroke: '#10210f',
                strokeThickness: 4,
            })
            .setOrigin(0.5, 0.5)
            .setDepth(110)
            .setScrollFactor(0);

        this.add
            .text(width / 2, 28, 'Dense Jungle Hunt', {
                color: '#efffe7',
                fontFamily: 'monospace',
                fontSize: '24px',
                stroke: '#10210f',
                strokeThickness: 4,
            })
            .setOrigin(0.5, 0.5)
            .setDepth(110)
            .setScrollFactor(0);

        this.bus.on(EVENTS.ROUND_PHASE_CHANGED, (data) => this.handlePhaseChanged(data.phase, data.previousPhase));

        const onGoToCaveBar = (): void => {
            this.savePlayerState();
            this.scene.start(SCENE_KEYS.CAVE_BAR, { sessionManager: this.sessionManager });
        };

        this.input.keyboard?.on('keydown-C', onGoToCaveBar);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard?.off('keydown-C', onGoToCaveBar);
            this.inputManager?.destroy();
            this.hud?.destroy();
        });

        this.syncHudFromState();
        this.currentTelegraph = this.dinosaurAI.selectTelegraph(this.getCurrentPositions());
        this.bus.emit(EVENTS.DINO_HEALTH_CHANGED, { amount: 0, newHealth: this.dinoHealth });
        this.bus.emit(EVENTS.DINO_TELEGRAPH, { attack: this.currentTelegraph });
        this.roundStateMachine.start();
    }

    update(_time: number, delta: number): void {
        if (!this.roundStateMachine || !this.inputManager || !this.positioningSystem) {
            return;
        }

        const inputs = this.inputManager.update();
        const phase = this.roundStateMachine.getPhase();

        if (phase === 'dodge_qte') {
            this.qteElapsedMs += delta;
        }

        for (const playerId of PLAYER_IDS) {
            const input = inputs[playerId];
            const previous = this.previousInputs[playerId];

            if (phase === 'plan') {
                this.handlePlanningInput(playerId, input, previous);
            } else if (phase === 'dodge_qte') {
                this.handleQteInput(playerId, input, previous);
            }

            this.previousInputs[playerId] = { ...input };
        }

        this.roundStateMachine.tick(delta);
    }

    private handlePlanningInput(playerId: PlayerId, input: LogicalInputState, previous: LogicalInputState): void {
        const player = this.playerState[playerId];
        if (player.downed) {
            return;
        }

        const movedLeft = input.left && !previous.left;
        const movedRight = input.right && !previous.right;
        const confirm = input.jumpPressed && !previous.jumpPressed;

        if (movedLeft) {
            player.selectedIndex = (player.selectedIndex + ACTION_ORDER.length - 1) % ACTION_ORDER.length;
            this.syncPlayerPanel(playerId);
        }

        if (movedRight) {
            player.selectedIndex = (player.selectedIndex + 1) % ACTION_ORDER.length;
            this.syncPlayerPanel(playerId);
        }

        if (confirm && this.roundStateMachine) {
            const action = selectedAction(ACTION_ORDER[player.selectedIndex], this.positioningSystem!.getPosition(playerId));
            this.roundStateMachine.submitAction(playerId, action);
        }
    }

    private handleQteInput(playerId: PlayerId, input: LogicalInputState, previous: LogicalInputState): void {
        if (!this.qteAffected.includes(playerId) || this.qteResponded.has(playerId)) {
            return;
        }

        if (input.jumpPressed && !previous.jumpPressed) {
            this.qteResponded.add(playerId);
            const perfect = this.qteElapsedMs <= 700;
            this.bus.emit(EVENTS.QTE_RESULT, { playerId, success: true, perfect });
            if (perfect) {
                this.scoringSystem?.awardPerfectDodge(playerId);
            }
        }
    }

    private handlePhaseChanged(phase: RoundPhase, previousPhase: RoundPhase): void {
        if (previousPhase === 'dodge_qte' && phase === 'plan') {
            this.finalizeQteRound();
        }

        if (phase === 'resolve') {
            this.resolveCurrentRound();
            return;
        }

        if (phase === 'plan') {
            if (!this.bonusDamageRound) {
                this.currentTelegraph = this.dinosaurAI?.selectTelegraph(this.getCurrentPositions());
                if (this.currentTelegraph) {
                    this.bus.emit(EVENTS.DINO_TELEGRAPH, { attack: this.currentTelegraph });
                }
            } else {
                this.hud?.qtePrompt.hide();
            }

            this.syncHudFromState();
        }
    }

    private resolveCurrentRound(): void {
        if (!this.roundStateMachine || !this.positioningSystem || !this.actionResolver || !this.currentTelegraph) {
            return;
        }

        const playerActions: Partial<Record<PlayerId, PlayerAction>> = {};
        for (const playerId of PLAYER_IDS) {
            const player = this.playerState[playerId];
            if (player.downed) {
                continue;
            }

            playerActions[playerId] = selectedAction(
                ACTION_ORDER[player.selectedIndex],
                this.positioningSystem.getPosition(playerId),
            );
        }

        const result = this.actionResolver.resolveRound({
            playerActions,
            positioningSystem: this.positioningSystem,
            attackDeclaration: this.currentTelegraph,
            playerState: this.toResolverState(),
            staggerActive: this.bonusDamageRound,
        });

        this.bus.emit(EVENTS.ROUND_RESOLVED, { result });

        let totalDamage = 0;
        for (const playerId of PLAYER_IDS) {
            const damage = result.damageDealt[playerId];
            if (damage > 0) {
                totalDamage += damage;
                this.scoringSystem?.awardDamage(playerId, damage);
            }
        }

        for (const weakPointHit of result.weakPointHits) {
            this.scoringSystem?.awardWeakPointHit(weakPointHit.playerId);
            const triggered = this.staggerSystem?.applyWeakPointDamage(weakPointHit.weakPoint, weakPointHit.damage) ?? false;
            if (triggered) {
                this.bonusDamageRound = true;
                this.scoringSystem?.awardStaggerContribution(weakPointHit.playerId);
            }
        }

        this.dinoHealth = Math.max(0, this.dinoHealth - totalDamage);
        this.bus.emit(EVENTS.DINO_HEALTH_CHANGED, { amount: -totalDamage, newHealth: this.dinoHealth });
        this.syncHudFromState();
        this.syncPlayerSprites();

        if (this.dinoHealth <= 0) {
            this.savePlayerState();
            this.scene.start(SCENE_KEYS.CAVE_BAR, { sessionManager: this.sessionManager });
            return;
        }

        if (this.bonusDamageRound) {
            this.bonusDamageRound = false;
            this.staggerSystem?.consumeStaggerWindow();
            this.roundStateMachine.beginPlan();
            return;
        }

        this.qteAffected = this.attackZoneResolver?.getAffectedPlayers(this.currentTelegraph, this.getCurrentPositions()) ?? [];
        this.qteResponded.clear();
        this.qteElapsedMs = 0;

        if (this.qteAffected.length === 0) {
            this.roundStateMachine.beginPlan();
            return;
        }

        this.bus.emit(EVENTS.QTE_START, {
            affectedPlayerIds: this.qteAffected,
            qteType: this.currentTelegraph.qteType,
        });
        this.roundStateMachine.beginDodgeQte();
    }

    private finalizeQteRound(): void {
        if (!this.currentTelegraph) {
            return;
        }

        for (const playerId of this.qteAffected) {
            if (this.qteResponded.has(playerId)) {
                continue;
            }

            this.bus.emit(EVENTS.QTE_RESULT, { playerId, success: false, perfect: false });
            this.applyPlayerDamage(playerId, this.currentTelegraph.damage);
        }

        this.qteAffected = [];
        this.qteResponded.clear();
        this.qteElapsedMs = 0;
    }

    private applyPlayerDamage(playerId: PlayerId, amount: number): void {
        const player = this.playerState[playerId];
        player.health = Math.max(0, player.health - amount);
        player.downed = player.health <= 0;
        this.bus.emit(EVENTS.PLAYER_DAMAGED, { playerId, amount, newHealth: player.health });
        if (player.downed) {
            this.bus.emit(EVENTS.PLAYER_DOWNED, { playerId });
        }

        this.syncScoresFromSystem();
    }

    private loadPlayerState(): void {
        const saved = this.sessionManager.loadPlayerState();
        this.playerState = createDefaultPlayerState();

        for (const player of saved) {
            this.playerState[player.playerId] = {
                ...this.playerState[player.playerId],
                health: player.health,
                score: player.score,
                downed: player.health <= 0,
            };
        }
    }

    private savePlayerState(): void {
        this.sessionManager.savePlayerState(
            PLAYER_IDS.map((playerId) => ({
                playerId,
                health: this.playerState[playerId].health,
                score: this.playerState[playerId].score,
            })),
        );
    }

    private toResolverState() {
        return {
            0: { health: this.playerState[0].health, downed: this.playerState[0].downed },
            1: { health: this.playerState[1].health, downed: this.playerState[1].downed },
            2: { health: this.playerState[2].health, downed: this.playerState[2].downed },
            3: { health: this.playerState[3].health, downed: this.playerState[3].downed },
        };
    }

    private getCurrentPositions(): Partial<Record<PlayerId, Position>> {
        if (!this.positioningSystem) {
            return {};
        }

        return {
            0: this.positioningSystem.getPosition(0),
            1: this.positioningSystem.getPosition(1),
            2: this.positioningSystem.getPosition(2),
            3: this.positioningSystem.getPosition(3),
        };
    }

    private syncHudFromState(): void {
        if (!this.hud || !this.positioningSystem) {
            return;
        }

        this.syncScoresFromSystem();

        for (const playerId of PLAYER_IDS) {
            this.syncPlayerPanel(playerId);
            this.hud.panels[playerId]?.setHealth(this.playerState[playerId].health);
            this.hud.panels[playerId]?.setPointsLabel(this.playerState[playerId].score);
        }
    }

    private syncPlayerPanel(playerId: PlayerId): void {
        if (!this.hud || !this.positioningSystem) {
            return;
        }

        const panel = this.hud.panels[playerId];
        const player = this.playerState[playerId];
        const position = this.positioningSystem.getPosition(playerId);
        panel?.setPositionLabel(positionLabel(position));
        panel?.setActionLabel(selectedAction(ACTION_ORDER[player.selectedIndex], position));
        panel?.setHealth(player.health);
        panel?.setPointsLabel(player.score);
    }

    private syncPlayerSprites(): void {
        if (!this.positioningSystem) {
            return;
        }

        for (const playerId of PLAYER_IDS) {
            const sprite = this.playerSprites.get(playerId);
            if (!sprite) {
                continue;
            }
            const position = this.positioningSystem.getPosition(playerId);
            const target = this.toScreenPosition(position);
            this.tweens.add({
                targets: sprite,
                x: target.x,
                y: target.y,
                duration: 180,
                ease: 'sine.out',
            });
        }
    }

    private toScreenPosition(position: Position): { x: number; y: number } {
        const { width, height } = this.scale;
        const flankX = {
            left: width * 0.22,
            center: width * 0.38,
            right: width * 0.54,
        }[position.flank];
        const zoneY = {
            close: height * 0.72,
            mid: height * 0.62,
            far: height * 0.52,
        }[position.zone];

        return { x: flankX, y: zoneY };
    }

    private syncScoresFromSystem(): void {
        const totals = this.scoringSystem?.getTotals();
        if (!totals) {
            return;
        }

        for (const playerId of PLAYER_IDS) {
            this.playerState[playerId].score = totals[playerId];
        }
    }
}
