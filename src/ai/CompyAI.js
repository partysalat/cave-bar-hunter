/**
 * CompyAI - AI controller for individual Compy dinosaurs
 *
 * State Machine:
 * - CIRCLING: Orbiting around pack center, looking for opening
 * - LUNGING: Rapid dash towards target player
 * - BITING: Brief pause at target to deal damage
 * - RETREATING: Moving back to pack after attack
 */
export default class CompyAI {
    /**
     * @param {Object} compy - The Compy entity this AI controls
     * @param {Array<Object>} allCompys - All Compys in the pack (for coordination)
     * @param {Array<Object>} players - All player entities in the scene
     */
    constructor(compy, allCompys, players) {
        // Entity references
        this.compy = compy;
        this.allCompys = allCompys;
        this.players = players;

        // State machine
        this.state = 'CIRCLING';
        this.target = null;
        this.stateTimer = 0;

        // Attack timing
        this.attackCooldown = 0;

        // Movement parameters
        this.orbitRadius = 4;
        this.orbitAngle = Math.random() * Math.PI * 2; // Random starting angle

        // Lunge tracking
        this.lungeDirX = 0;
        this.lungeDirY = 0;
    }

    /**
     * Updates AI state and behavior
     * @param {number} delta - Time elapsed in milliseconds
     */
    update(delta) {
        // Convert delta to seconds
        const deltaSeconds = delta / 1000;

        // Decrement attack cooldown (clamp to 0)
        this.attackCooldown = Math.max(0, this.attackCooldown - deltaSeconds);

        // Increment state timer
        this.stateTimer += deltaSeconds;

        // Execute current state behavior
        switch (this.state) {
            case 'CIRCLING':
                this.updateCircling(deltaSeconds);
                break;
            case 'LUNGING':
                this.updateLunging(deltaSeconds);
                break;
            case 'BITING':
                this.updateBiting(deltaSeconds);
                break;
            case 'RETREATING':
                this.updateRetreating(deltaSeconds);
                break;
        }
    }

    /**
     * CIRCLING state: Orbit around pack center, look for attack opening
     * @param {number} dt - Delta time in seconds
     */
    updateCircling(dt) {
        // Placeholder - will be implemented in Task 6
    }

    /**
     * LUNGING state: Rapid dash towards target player
     * @param {number} dt - Delta time in seconds
     */
    updateLunging(dt) {
        // Placeholder - will be implemented in Task 6
    }

    /**
     * BITING state: Brief pause at target to deal damage
     * @param {number} dt - Delta time in seconds
     */
    updateBiting(dt) {
        // Placeholder - will be implemented in Task 6
    }

    /**
     * RETREATING state: Move back to pack after attack
     * @param {number} dt - Delta time in seconds
     */
    updateRetreating(dt) {
        // Placeholder - will be implemented in Task 6
    }
}
