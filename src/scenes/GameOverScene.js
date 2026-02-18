import Phaser from 'phaser';
import { SCREEN_WIDTH, SCREEN_HEIGHT, DEPTH_LAYERS } from '../systems/CoordinateSystem.js';
import { gameSession } from '../systems/SessionManager.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        const cx = SCREEN_WIDTH / 2;
        const cy = SCREEN_HEIGHT / 2;

        // Dark overlay
        this.add.rectangle(cx, cy, SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000, 0.85)
            .setScrollFactor(0).setDepth(DEPTH_LAYERS.UI);

        this.add.text(cx, cy - 200, 'GAME OVER', {
            fontSize: '120px', fontFamily: 'Arial', color: '#ff2222',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 12,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_LAYERS.UI + 1);

        // Show player scores
        const scores = gameSession.playerData.map(
            (pd, i) => `Player ${i + 1}: ${pd.score} pts`
        );
        this.add.text(cx, cy, scores.join('\n'), {
            fontSize: '36px', fontFamily: 'Arial', color: '#ffffff',
            align: 'center', lineSpacing: 16,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_LAYERS.UI + 1);

        this.add.text(cx, cy + 280, 'Restarting in 5 seconds…', {
            fontSize: '28px', fontFamily: 'Arial', color: '#aaaaaa',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_LAYERS.UI + 1);

        this.time.delayedCall(5000, () => {
            gameSession.reset();
            this.cameras.main.fadeOut(600, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('CaveBarScene');
            });
        });
    }
}
