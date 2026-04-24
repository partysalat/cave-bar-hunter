import type { PlayerId } from '../core/types.js';

export interface SessionPlayerState {
    playerId: PlayerId;
    health: number;
    score: number;
}

export class SessionManager {
    private readonly playerState = new Map<PlayerId, Omit<SessionPlayerState, 'playerId'>>();

    savePlayerState(players: SessionPlayerState[]): void {
        for (const player of players) {
            this.playerState.set(player.playerId, {
                health: player.health,
                score: player.score,
            });
        }
    }

    loadPlayerState(): SessionPlayerState[] {
        return [...this.playerState.entries()]
            .sort(([left], [right]) => left - right)
            .map(([playerId, state]) => ({
                playerId,
                health: state.health,
                score: state.score,
            }));
    }
}

export default SessionManager;
