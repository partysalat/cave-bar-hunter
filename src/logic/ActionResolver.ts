import type { AttackDeclaration, PlayerAction, PlayerId, RoundResult, WeakPoint } from '../core/types.js';
import PositioningSystem from './PositioningSystem.js';

export interface ResolverPlayerState {
    health: number;
    downed: boolean;
    braced?: boolean;
}

export interface ResolveRoundInput {
    playerActions: Partial<Record<PlayerId, PlayerAction>>;
    positioningSystem: PositioningSystem;
    attackDeclaration: AttackDeclaration;
    playerState: Record<PlayerId, ResolverPlayerState>;
    staggerActive?: boolean;
}

const PLAYER_IDS: PlayerId[] = [0, 1, 2, 3];

function emptyDamageRecord(): Record<PlayerId, number> {
    return {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
    };
}

function zoneDamage(zone: 'close' | 'mid' | 'far'): number {
    if (zone === 'close') {
        return 3;
    }

    if (zone === 'mid') {
        return 2;
    }

    return 1;
}

function orderedActionEntries(playerActions: Partial<Record<PlayerId, PlayerAction>>, type: PlayerAction['type']): Array<[PlayerId, PlayerAction]> {
    return PLAYER_IDS
        .map((playerId) => [playerId, playerActions[playerId]] as const)
        .filter((entry): entry is [PlayerId, PlayerAction] => entry[1] !== undefined && entry[1].type === type);
}

export class ActionResolver {
    resolveRound(input: ResolveRoundInput): RoundResult {
        const { playerActions, positioningSystem, playerState, staggerActive = false } = input;
        const damageDealt = emptyDamageRecord();
        const weakPointHits: RoundResult['weakPointHits'] = [];
        const revivedPlayers = new Set<PlayerId>();
        const braceMap = new Map<PlayerId, boolean>();

        for (const [playerId, action] of orderedActionEntries(playerActions, 'reposition')) {
            if (!playerState[playerId]?.downed) {
                positioningSystem.applyAction(playerId, action);
            }
        }

        for (const [playerId] of orderedActionEntries(playerActions, 'brace')) {
            if (!playerState[playerId]?.downed) {
                braceMap.set(playerId, true);
            }
        }

        for (const [playerId, action] of [
            ...orderedActionEntries(playerActions, 'attack'),
            ...orderedActionEntries(playerActions, 'aimed_strike'),
        ]) {
            if (playerState[playerId]?.downed) {
                continue;
            }

            const position = positioningSystem.getPosition(playerId);
            const multiplier = staggerActive ? 3 : 1;
            const damage = zoneDamage(position.zone) * multiplier;
            damageDealt[playerId] += damage;

            if (action.type === 'aimed_strike') {
                weakPointHits.push({
                    weakPoint: action.target as WeakPoint,
                    playerId,
                    damage,
                });
            }
        }

        for (const [playerId] of orderedActionEntries(playerActions, 'revive')) {
            if (playerState[playerId]?.downed) {
                continue;
            }

            const reviverPosition = positioningSystem.getPosition(playerId);
            const target = PLAYER_IDS.find((candidate) => {
                if (candidate === playerId || revivedPlayers.has(candidate)) {
                    return false;
                }

                const candidateState = playerState[candidate];
                if (!candidateState?.downed) {
                    return false;
                }

                const candidatePosition = positioningSystem.getPosition(candidate);
                return candidatePosition.zone === reviverPosition.zone;
            });

            if (target !== undefined) {
                revivedPlayers.add(target);
            }
        }

        const playersHit = PLAYER_IDS.filter((playerId) => braceMap.has(playerId));

        return {
            damageDealt,
            weakPointHits,
            staggerTriggered: false,
            playersHit,
        };
    }
}

export default ActionResolver;
