import Phaser from 'phaser';

/**
 * HuntScene - Compy Pack Hunt
 *
 * A hunt scene where 4 players fight 5 Compys in a dense jungle arena.
 * Features pack AI coordination, tree obstacles, and dynamic combat.
 */
export default class HuntScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HuntScene' });
    }

    create() {
        // Hunt state machine: intro → active → victory/failure
        this.huntState = 'intro';

        // Timers
        this.huntTimer = 0;           // Time in current state
        this.totalHuntTime = 0;       // Total time elapsed in hunt

        // Entity arrays
        this.players = [];
        this.compys = [];
        this.projectiles = [];
        this.trees = [];

        // Collision tracking
        this.obstacles = [];

        // Pack coordinator
        this.packCoordinator = null;
    }

    update(time, delta) {
        // Increment timers
        this.huntTimer += delta;
        this.totalHuntTime += delta;
    }
}
