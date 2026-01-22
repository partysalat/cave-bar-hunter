/**
 * Timing system for perfect dodges and attack telegraphs
 */
export default class TimingSystem {
    constructor() {
        this.attackWarnings = new Map(); // attackId -> remainingTime
        this.nextAttackId = 1;
    }

    /**
     * Register an incoming attack warning
     * @param {number} timeUntilHit - ms until attack hits
     * @returns {number} Attack ID
     */
    registerAttackWarning(timeUntilHit) {
        const id = this.nextAttackId++;
        this.attackWarnings.set(id, timeUntilHit);
        return id;
    }

    /**
     * Check if dodge timing is perfect (within final 0.5s before hit)
     * @param {number} attackId
     * @param {number} timeRemaining - ms remaining before hit
     * @returns {boolean}
     */
    checkPerfectDodge(attackId, timeRemaining) {
        if (!this.attackWarnings.has(attackId)) return false;

        const perfectWindow = 500; // 0.5 seconds (from design doc)
        return timeRemaining <= perfectWindow;
    }

    /**
     * Create perfect dodge buff data
     * @returns {Object} Buff parameters
     */
    createPerfectDodgeBuff() {
        return {
            damageMultiplier: 1.5, // 1.5× damage (from design doc)
            duration: 3000 // 3 seconds (from design doc)
        };
    }

    /**
     * Clear attack warning
     * @param {number} attackId
     */
    clearAttack(attackId) {
        this.attackWarnings.delete(attackId);
    }
}
