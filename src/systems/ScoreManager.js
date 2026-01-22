/**
 * Score tracking system for 1-4 players
 * From design doc: 1 pt per damage, 3 pts per weak point hit, 5 pts perfect dodge, 10 pts teammate save
 */
export default class ScoreManager {
    constructor() {
        // Scores for up to 4 players
        this.scores = [0, 0, 0, 0];

        // Stats tracking
        this.perfectDodges = [0, 0, 0, 0];
        this.weakPointHits = [0, 0, 0, 0];
        this.teammateSaves = [0, 0, 0, 0];
    }

    /**
     * Get current score for player
     * @param {number} playerIndex - 0-3
     * @returns {number}
     */
    getScore(playerIndex) {
        return this.scores[playerIndex] || 0;
    }

    /**
     * Award points for damage dealt (1 point per damage)
     * @param {number} playerIndex
     * @param {number} damage
     */
    awardDamagePoints(playerIndex, damage) {
        const points = Math.floor(damage); // 1:1 ratio
        this.scores[playerIndex] += points;
    }

    /**
     * Award bonus points for weak point hit (3 points per damage)
     * @param {number} playerIndex
     * @param {number} damage
     */
    awardWeakPointHit(playerIndex, damage) {
        const points = Math.floor(damage) * 3; // 3× multiplier
        this.scores[playerIndex] += points;
        this.weakPointHits[playerIndex]++;
    }

    /**
     * Award points for perfect dodge (5 points)
     * @param {number} playerIndex
     */
    awardPerfectDodge(playerIndex) {
        this.scores[playerIndex] += 5;
        this.perfectDodges[playerIndex]++;
    }

    /**
     * Award points for saving teammate (10 points)
     * @param {number} playerIndex
     */
    awardTeammateSave(playerIndex) {
        this.scores[playerIndex] += 10;
        this.teammateSaves[playerIndex]++;
    }

    /**
     * Award first blood bonus (20 points)
     * @param {number} playerIndex
     */
    awardFirstBlood(playerIndex) {
        this.scores[playerIndex] += 20;
    }

    /**
     * Award killing blow bonus (20 points)
     * @param {number} playerIndex
     */
    awardKillingBlow(playerIndex) {
        this.scores[playerIndex] += 20;
    }

    /**
     * Get stats for player
     * @param {number} playerIndex
     * @returns {Object}
     */
    getStats(playerIndex) {
        return {
            score: this.scores[playerIndex],
            perfectDodges: this.perfectDodges[playerIndex],
            weakPointHits: this.weakPointHits[playerIndex],
            teammateSaves: this.teammateSaves[playerIndex]
        };
    }

    /**
     * Reset all scores (for new session)
     */
    reset() {
        this.scores = [0, 0, 0, 0];
        this.perfectDodges = [0, 0, 0, 0];
        this.weakPointHits = [0, 0, 0, 0];
        this.teammateSaves = [0, 0, 0, 0];
    }
}
