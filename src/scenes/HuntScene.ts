import Phaser from 'phaser';

import { EventBus } from '../core/EventBus.js';
import { EVENTS, type RoundPhase } from '../core/events.js';
import type { AttackDeclaration, AttackingPlayer, PlayerAction, PlayerId, Position, RoundResult, WeakPoint, WeaponType } from '../core/types.js';
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
    private pendingRoundResult?: RoundResult;
    private attackQteElapsedMs = 0;
    private attackingPlayers: AttackingPlayer[] = [];
    private attackQteResponded = new Set<PlayerId>();
    private attackQteResults = new Map<PlayerId, { critical: boolean; weakPoint: WeakPoint | null }>();
    private bowTargets = new Map<PlayerId, WeakPoint | null>();
    private ringRenderer?: PositionRingRenderer;
    private telegraphRenderer?: TelegraphRenderer;

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
            attackAndDodgeQteDurationMs: 2200,
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

        this.bus.on(EVENTS.ROUND_PHASE_CHANGED, (data) => this.handlePhaseChanged(data.phase, data.previousPhase));
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

        this.syncHudFromState();
        this.syncPlayerSprites();
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

        if (phase === 'attack_and_dodge_qte') {
            this.qteElapsedMs += delta;
            this.attackQteElapsedMs += delta;
        }

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

    private handleAttackQteInput(playerId: PlayerId, input: LogicalInputState, previous: LogicalInputState): void {
        const attacker = this.attackingPlayers.find((a) => a.playerId === playerId);
        if (!attacker || this.attackQteResponded.has(playerId)) {
            return;
        }

        if (attacker.weaponType === 'club') {
            if (input.jumpPressed && !previous.jumpPressed) {
                this.attackQteResponded.add(playerId);
                const elapsed = this.attackQteElapsedMs;
                const critical = elapsed >= 562 && elapsed <= 937;
                this.attackQteResults.set(playerId, { critical, weakPoint: null });
                this.bus.emit(EVENTS.ATTACK_QTE_RESULT, {
                    playerId,
                    weaponType: 'club' as const,
                    critical,
                    weakPoint: null,
                });
            }
        } else {
            if (input.up && !previous.up) {
                this.bowTargets.set(playerId, 'head');
            }
            if (input.down && !previous.down) {
                this.bowTargets.set(playerId, 'legs');
            }
            if (input.jumpPressed && !previous.jumpPressed) {
                this.attackQteResponded.add(playerId);
                const weakPoint = this.bowTargets.get(playerId) ?? null;
                this.attackQteResults.set(playerId, { critical: weakPoint !== null, weakPoint });
                this.bus.emit(EVENTS.ATTACK_QTE_RESULT, {
                    playerId,
                    weaponType: 'bow' as const,
                    critical: weakPoint !== null,
                    weakPoint,
                });
            }
        }
    }

    private handlePhaseChanged(phase: RoundPhase, previousPhase: RoundPhase): void {
        if (previousPhase === 'attack_and_dodge_qte' && phase === 'plan') {
            this.finalizeQteRound();
        }

        if (phase === 'resolve' || (phase === 'plan' && previousPhase !== 'plan')) {
            this.telegraphRenderer?.clear();
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

        // Apply weapon switches before resolve so activeWeapon is current
        for (const playerId of PLAYER_IDS) {
            if (playerActions[playerId]?.type === 'switch_weapon') {
                const current = this.playerState[playerId].activeWeapon;
                this.playerState[playerId].activeWeapon = current === 'club' ? 'bow' : 'club';
                this.bus.emit(EVENTS.WEAPON_SWITCHED, {
                    playerId,
                    newWeapon: this.playerState[playerId].activeWeapon,
                });
            }
        }

        const result = this.actionResolver.resolveRound({
            playerActions,
            positioningSystem: this.positioningSystem,
            attackDeclaration: this.currentTelegraph,
            playerState: this.toResolverState(),
            staggerActive: this.bonusDamageRound,
        });

        this.bus.emit(EVENTS.ROUND_RESOLVED, { result });

        // Stagger window: apply damage immediately (no QTE this round)
        if (this.bonusDamageRound) {
            const killed = this.applyRoundResult(result);
            if (killed) {
                this.savePlayerState();
                this.scene.start(SCENE_KEYS.CAVE_BAR, { sessionManager: this.sessionManager });
                return;
            }
            this.bonusDamageRound = false;
            this.staggerSystem?.consumeStaggerWindow();
            this.roundStateMachine.beginPlan();
            return;
        }

        // Store result for deferred application after QTE
        this.pendingRoundResult = result;
        this.attackingPlayers = result.attackingPlayers;
        this.attackQteResponded.clear();
        this.attackQteResults.clear();
        this.bowTargets.clear();
        this.attackQteElapsedMs = 0;

        this.qteAffected = this.attackZoneResolver?.getAffectedPlayers(this.currentTelegraph, this.getCurrentPositions()) ?? [];
        this.qteResponded.clear();
        this.qteElapsedMs = 0;

        if (this.attackingPlayers.length > 0) {
            this.bus.emit(EVENTS.ATTACK_QTE_START, { attackingPlayers: this.attackingPlayers });
        }

        if (this.qteAffected.length > 0) {
            this.bus.emit(EVENTS.QTE_START, {
                affectedPlayerIds: this.qteAffected,
                qteType: this.currentTelegraph.qteType,
            });
        }

        if (this.attackingPlayers.length === 0 && this.qteAffected.length === 0) {
            this.finalizeQteRound();
            this.roundStateMachine.beginPlan();
            return;
        }

        this.roundStateMachine.beginAttackAndDodgeQte();
    }

    private applyRoundResult(result: RoundResult, damageMultipliers?: Map<PlayerId, number>): boolean {
        const multipliers = damageMultipliers ?? new Map();
        const finalWeakPointHits = [...result.weakPointHits];

        let totalDamage = 0;
        for (const playerId of PLAYER_IDS) {
            const base = result.damageDealt[playerId];
            if (base > 0) {
                const multiplier = multipliers.get(playerId) ?? 1;
                const damage = base * multiplier;
                totalDamage += damage;
                this.scoringSystem?.awardDamage(playerId, damage);
                if (multiplier !== 1) {
                    const hit = finalWeakPointHits.find((h) => h.playerId === playerId);
                    if (hit) {
                        hit.damage = damage;
                    }
                }
            }
        }

        for (const weakPointHit of finalWeakPointHits) {
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

        return this.dinoHealth <= 0;
    }

    private finalizeQteRound(): void {
        if (!this.currentTelegraph) {
            return;
        }

        if (this.pendingRoundResult) {
            const result = this.pendingRoundResult;
            const damageMultipliers = new Map<PlayerId, number>();

            const finalWeakPointHits = result.weakPointHits.filter((hit) => {
                const attacker = this.attackingPlayers.find((a) => a.playerId === hit.playerId);
                if (!attacker) return true;

                const qteResult = this.attackQteResults.get(hit.playerId);
                if (attacker.weaponType === 'club') {
                    return qteResult?.critical === true;
                }
                return qteResult?.weakPoint === hit.weakPoint;
            });

            // Bow attack landing on a zone adds a bonus weak point hit
            for (const attacker of this.attackingPlayers) {
                if (attacker.weaponType !== 'bow' || attacker.action !== 'attack') continue;
                const qteResult = this.attackQteResults.get(attacker.playerId);
                if (qteResult?.weakPoint) {
                    finalWeakPointHits.push({
                        playerId: attacker.playerId,
                        weakPoint: qteResult.weakPoint,
                        damage: result.damageDealt[attacker.playerId],
                    });
                }
            }

            // Club crit doubles damage
            for (const attacker of this.attackingPlayers) {
                if (attacker.weaponType !== 'club') continue;
                const qteResult = this.attackQteResults.get(attacker.playerId);
                if (qteResult?.critical) {
                    damageMultipliers.set(attacker.playerId, 2);
                }
            }

            const modifiedResult: RoundResult = { ...result, weakPointHits: finalWeakPointHits };
            const killed = this.applyRoundResult(modifiedResult, damageMultipliers);
            this.pendingRoundResult = undefined;

            if (killed) {
                this.savePlayerState();
                this.scene.start(SCENE_KEYS.CAVE_BAR, { sessionManager: this.sessionManager });
                return;
            }

            // Stagger triggered during finalize: skip dodge damage
            if (this.bonusDamageRound) {
                this.qteAffected = [];
                this.qteResponded.clear();
                this.qteElapsedMs = 0;
                this.attackingPlayers = [];
                this.attackQteResponded.clear();
                this.attackQteResults.clear();
                this.bowTargets.clear();
                this.attackQteElapsedMs = 0;
                return;
            }
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
        this.attackingPlayers = [];
        this.attackQteResponded.clear();
        this.attackQteResults.clear();
        this.bowTargets.clear();
        this.attackQteElapsedMs = 0;
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

    private toResolverState() {
        return {
            0: { health: this.playerState[0].health, downed: this.playerState[0].downed, activeWeapon: this.playerState[0].activeWeapon },
            1: { health: this.playerState[1].health, downed: this.playerState[1].downed, activeWeapon: this.playerState[1].activeWeapon },
            2: { health: this.playerState[2].health, downed: this.playerState[2].downed, activeWeapon: this.playerState[2].activeWeapon },
            3: { health: this.playerState[3].health, downed: this.playerState[3].downed, activeWeapon: this.playerState[3].activeWeapon },
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
            this.ringRenderer?.update(playerId, target, position.zone === 'close');
        }
    }

    private toScreenPosition(position: Position): { x: number; y: number } {
        const { width, height } = this.scale;
        return positionToScreen(position, width, height);
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
