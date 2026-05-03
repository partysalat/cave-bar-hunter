import Phaser from 'phaser';

import { EventBus } from '../core/EventBus.js';
import { EVENTS, type RoundPhase } from '../core/events.js';
import type { AttackDeclaration, AttackingPlayer, PlayerAction, PlayerId, Position, WeaponType } from '../core/types.js';
import InputManager, { type LogicalInputState } from '../input/InputManager.js';
import {
    createHuntRoundLoop,
    type HuntLoopPlayerState,
    type HuntPhase as HuntLoopPhase,
    type HuntRoundLoop,
    type HuntUpdate,
} from '../logic/HuntRoundLoop.js';
import PositioningSystem from '../logic/PositioningSystem.js';
import SessionManager, { type SessionPlayerState } from '../logic/SessionManager.js';
import { ArenaRenderer } from '../rendering/ArenaRenderer.js';
import { ARENA_LAYOUT } from '../rendering/arenaLayout.js';
import { positionToScreen } from '../rendering/positionToScreen.js';
import { PositionRingRenderer } from '../rendering/PositionRingRenderer.js';
import {
    getGeneratedSpriteCookAnimation,
    spriteCookAssetKey,
    spriteCookEntityAtlasKey,
} from '../rendering/spritecookAssets.js';
import { TelegraphRenderer } from '../rendering/TelegraphRenderer.js';
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
const ACTION_ORDER = ['attack', 'brace', 'aimed_head', 'aimed_legs', 'reposition', 'revive', 'switch_weapon'] as const;
type ActionChoice = typeof ACTION_ORDER[number];

function createDefaultPlayerState(): Record<PlayerId, PlayerRuntimeState> {
    return {
        0: { playerId: 0, health: DEFAULT_PLAYER_HEALTH, score: 0, downed: false, selectedIndex: 0, activeWeapon: 'club' as WeaponType },
        1: { playerId: 1, health: DEFAULT_PLAYER_HEALTH, score: 0, downed: false, selectedIndex: 0, activeWeapon: 'club' as WeaponType },
        2: { playerId: 2, health: DEFAULT_PLAYER_HEALTH, score: 0, downed: false, selectedIndex: 0, activeWeapon: 'club' as WeaponType },
        3: { playerId: 3, health: DEFAULT_PLAYER_HEALTH, score: 0, downed: false, selectedIndex: 0, activeWeapon: 'club' as WeaponType },
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
        case 'switch_weapon':
            return { type: 'switch_weapon' };
    }
}

function mapLoopPhase(kind: HuntLoopPhase['kind']): RoundPhase {
    switch (kind) {
        case 'plan':
            return 'plan';
        case 'submit':
            return 'submit';
        case 'resolve':
            return 'resolve';
        case 'attack_qte':
        case 'dodge_qte':
            return 'attack_and_dodge_qte';
        case 'stagger_window':
            return 'stagger_window';
        case 'hunt_end':
            return 'resolve';
        case 'idle':
            return 'plan';
    }
}

export class HuntScene extends Phaser.Scene {
    private arena?: ArenaRenderer;
    private bus!: EventBus;
    private hud?: HUD;
    private inputManager?: InputManager;
    private huntLoop?: HuntRoundLoop;
    private positioningSystem?: PositioningSystem;
    private sessionManager!: SessionManager;
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
    private qteAffected: PlayerId[] = [];
    private attackingPlayers: AttackingPlayer[] = [];
    private ringRenderer?: PositionRingRenderer;
    private telegraphRenderer?: TelegraphRenderer;
    private currentPhase: RoundPhase = 'plan';

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
        this.huntLoop = createHuntRoundLoop({
            sessionState: PLAYER_IDS.map((playerId) => ({
                playerId,
                health: this.playerState[playerId].health,
                score: this.playerState[playerId].score,
                activeWeapon: this.playerState[playerId].activeWeapon,
            })),
            dinoHealth: this.dinoHealth,
        });
        this.inputManager = new InputManager(this);
        this.hud = new HUD(this, this.bus);
        this.hud.setActivePlayers(PLAYER_IDS);

        this.arena = new ArenaRenderer(this);
        this.arena.create();
        this.ringRenderer = new PositionRingRenderer(this);
        this.ringRenderer.create(PLAYER_IDS);
        this.telegraphRenderer = new TelegraphRenderer(this);

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

        const dinoX = width * ARENA_LAYOUT.dinoX;
        const dinoY = height * ARENA_LAYOUT.dinoY;
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

        this.bus.on(EVENTS.DINO_TELEGRAPH, ({ attack }) => this.telegraphRenderer?.show(attack));

        const onGoToCaveBar = (): void => {
            this.savePlayerState();
            this.scene.start(SCENE_KEYS.CAVE_BAR, { sessionManager: this.sessionManager });
        };

        this.input.keyboard?.on('keydown-C', onGoToCaveBar);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard?.off('keydown-C', onGoToCaveBar);
            this.inputManager?.destroy();
            this.ringRenderer?.destroy();
            this.telegraphRenderer?.destroy();
            this.hud?.destroy();
        });

        this.bus.emit(EVENTS.DINO_HEALTH_CHANGED, { amount: 0, newHealth: this.dinoHealth });
        this.syncHudFromState();
        this.syncPlayerSprites();
        this.applyHuntLoopUpdate(this.huntLoop.advance({ type: 'begin_hunt' }));
    }

    update(_time: number, delta: number): void {
        if (!this.huntLoop || !this.inputManager || !this.positioningSystem) {
            return;
        }

        const inputs = this.inputManager.update();
        const phase = this.currentPhase;

        for (const playerId of PLAYER_IDS) {
            const input = inputs[playerId];
            const previous = this.previousInputs[playerId];

            if (phase === 'plan') {
                this.handlePlanningInput(playerId, input, previous);
            } else if (phase === 'attack_and_dodge_qte') {
                this.handleQteInput(playerId, input, previous);
                this.handleAttackQteInput(playerId, input, previous);
            }

            this.previousInputs[playerId] = { ...input };
        }

        this.applyHuntLoopUpdate(this.huntLoop.advance({ type: 'tick', deltaMs: delta }));
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

        if (confirm && this.huntLoop) {
            const action = selectedAction(ACTION_ORDER[player.selectedIndex], this.positioningSystem!.getPosition(playerId));
            this.applyHuntLoopUpdate(this.huntLoop.advance({
                type: 'submit_planned_action',
                playerId,
                action,
            }));
        }
    }

    private handleQteInput(playerId: PlayerId, input: LogicalInputState, previous: LogicalInputState): void {
        if (!this.qteAffected.includes(playerId) || !this.huntLoop) {
            return;
        }

        if (input.jumpPressed && !previous.jumpPressed) {
            this.applyHuntLoopUpdate(this.huntLoop.advance({
                type: 'submit_dodge_qte',
                playerId,
            }));
        }
    }

    private handleAttackQteInput(playerId: PlayerId, input: LogicalInputState, previous: LogicalInputState): void {
        if (!this.huntLoop) {
            return;
        }

        const attacker = this.attackingPlayers.find((a) => a.playerId === playerId);
        if (!attacker) {
            return;
        }

        if (attacker.weaponType === 'club') {
            if (input.jumpPressed && !previous.jumpPressed) {
                this.applyHuntLoopUpdate(this.huntLoop.advance({
                    type: 'submit_attack_qte',
                    playerId,
                }));
            }
        } else {
            if (input.jumpPressed && !previous.jumpPressed) {
                const weakPoint = input.up ? 'head' : input.down ? 'legs' : undefined;
                this.applyHuntLoopUpdate(this.huntLoop.advance({
                    type: 'submit_attack_qte',
                    playerId,
                    weakPoint,
                }));
            }
        }
    }

    private resolveCurrentRound(): void {
        if (!this.huntLoop) {
            return;
        }

        const snapshot = this.huntLoop.getSnapshot();
        if (snapshot.phase.kind !== 'resolve') {
            return;
        }
        this.applyHuntLoopUpdate(this.huntLoop.advance({
            type: 'resolve_submitted_actions',
        }));
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
                activeWeapon: player.activeWeapon,
            };
        }
    }

    private savePlayerState(): void {
        this.sessionManager.savePlayerState(
            PLAYER_IDS.map((playerId) => ({
                playerId,
                health: this.playerState[playerId].health,
                score: this.playerState[playerId].score,
                activeWeapon: this.playerState[playerId].activeWeapon,
            })),
        );
    }

    private syncHudFromState(): void {
        if (!this.hud || !this.positioningSystem) {
            return;
        }

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
        const loopAction = this.huntLoop?.getSnapshot().players[playerId].submittedAction;
        panel?.setPositionLabel(positionLabel(position));
        panel?.setActionLabel(loopAction ?? selectedAction(ACTION_ORDER[player.selectedIndex], position));
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
            this.ringRenderer?.update(playerId, target, position.zone === 'close');
        }
    }

    private toScreenPosition(position: Position): { x: number; y: number } {
        const { width, height } = this.scale;
        return positionToScreen(position, width, height);
    }

    private applyHuntLoopUpdate(update: HuntUpdate): void {
        if (!update.ok) {
            return;
        }

        this.syncSceneStateFromLoopSnapshot(update.snapshot);

        for (const emission of update.emissions) {
            if (emission.type === 'telegraph_announced') {
                this.currentTelegraph = emission.telegraph;
                this.bus.emit(EVENTS.DINO_TELEGRAPH, { attack: emission.telegraph });
                continue;
            }

            if (emission.type === 'planned_action_submitted') {
                this.bus.emit(EVENTS.PLAYER_ACTION_SELECTED, {
                    playerId: emission.playerId,
                    action: emission.action,
                });
                continue;
            }

            if (emission.type === 'weapon_switched') {
                this.bus.emit(EVENTS.WEAPON_SWITCHED, {
                    playerId: emission.playerId,
                    newWeapon: emission.newWeapon,
                });
                continue;
            }

            if (emission.type === 'round_resolved') {
                this.attackingPlayers = emission.result.attackingPlayers;
                this.qteAffected = [];
                this.bus.emit(EVENTS.ROUND_RESOLVED, { result: emission.result });
                continue;
            }

            if (emission.type === 'attack_qte_result') {
                this.bus.emit(EVENTS.ATTACK_QTE_RESULT, {
                    playerId: emission.playerId,
                    weaponType: emission.weaponType,
                    critical: emission.critical,
                    weakPoint: emission.weakPoint,
                });
                continue;
            }

            if (emission.type === 'dodge_qte_result') {
                this.bus.emit(EVENTS.QTE_RESULT, {
                    playerId: emission.playerId,
                    success: emission.success,
                    perfect: emission.perfect,
                });
                continue;
            }

            if (emission.type === 'attack_qte_opened') {
                this.attackingPlayers = emission.attackers;
                this.bus.emit(EVENTS.ATTACK_QTE_START, { attackingPlayers: emission.attackers });
                continue;
            }

            if (emission.type === 'dodge_qte_opened') {
                this.qteAffected = emission.affectedPlayers;
                this.bus.emit(EVENTS.QTE_START, {
                    affectedPlayerIds: emission.affectedPlayers,
                    qteType: emission.qteType,
                });
                continue;
            }

            if (emission.type === 'qte_round_finished') {
                continue;
            }

            if (emission.type === 'points_earned') {
                this.bus.emit(EVENTS.POINTS_EARNED, {
                    playerId: emission.playerId,
                    amount: emission.amount,
                    reason: emission.reason,
                });
                continue;
            }

            if (emission.type === 'dino_health_changed') {
                this.dinoHealth = emission.newHealth;
                this.bus.emit(EVENTS.DINO_HEALTH_CHANGED, {
                    amount: emission.amount,
                    newHealth: emission.newHealth,
                });
                continue;
            }

            if (emission.type === 'player_damaged') {
                this.bus.emit(EVENTS.PLAYER_DAMAGED, {
                    playerId: emission.playerId,
                    amount: emission.amount,
                    newHealth: emission.newHealth,
                });
                if (this.qteAffected.includes(emission.playerId)) {
                    this.bus.emit(EVENTS.QTE_RESULT, {
                        playerId: emission.playerId,
                        success: false,
                        perfect: false,
                    });
                }
                continue;
            }

            if (emission.type === 'player_downed') {
                this.bus.emit(EVENTS.PLAYER_DOWNED, { playerId: emission.playerId });
                continue;
            }

            if (emission.type === 'stagger_window_opened') {
                this.bus.emit(EVENTS.STAGGER_TRIGGERED, {});
                continue;
            }

            if (emission.type === 'hunt_ended') {
                this.savePlayerState();
                this.scene.start(SCENE_KEYS.CAVE_BAR, { sessionManager: this.sessionManager });
                return;
            }

            if (emission.type === 'phase_changed') {
                const phase = mapLoopPhase(emission.to);
                const previousPhase =
                    emission.to === 'plan' && this.currentPhase === 'attack_and_dodge_qte'
                        ? 'attack_and_dodge_qte'
                        : mapLoopPhase(emission.from);

                this.currentPhase = phase;
                this.bus.emit(EVENTS.ROUND_PHASE_CHANGED, { phase, previousPhase });

                if (phase !== 'attack_and_dodge_qte') {
                    this.qteAffected = [];
                    this.attackingPlayers = [];
                }

                if (phase === 'resolve' || (phase === 'plan' && previousPhase !== 'plan')) {
                    this.telegraphRenderer?.clear();
                }

                if (phase === 'plan') {
                    this.syncHudFromState();
                }

                if (phase === 'resolve') {
                    this.resolveCurrentRound();
                }
            }
        }
    }

    private syncSceneStateFromLoopSnapshot(snapshot: { players: Record<PlayerId, HuntLoopPlayerState>; dino: { health: number; currentTelegraph: AttackDeclaration | null } }): void {
        for (const playerId of PLAYER_IDS) {
            const next = snapshot.players[playerId];
            this.playerState[playerId].health = next.health;
            this.playerState[playerId].score = next.score;
            this.playerState[playerId].downed = next.downed;
            this.playerState[playerId].activeWeapon = next.activeWeapon;
            if (this.positioningSystem) {
                this.positioningSystem.setPosition(playerId, next.position);
            }
        }

        this.dinoHealth = snapshot.dino.health;
        this.currentTelegraph = snapshot.dino.currentTelegraph ?? this.currentTelegraph;
        this.syncPlayerSprites();
        this.syncHudFromState();
    }
}
