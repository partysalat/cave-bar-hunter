import Phaser from 'phaser';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../systems/WorldConfig.js';
import { gameSession } from '../systems/SessionManager.js';

export default class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    create() {
        const player = gameSession.getPlayerData(0);
        const completionBonus = 500;
        const finalScore = player.score + completionBonus;

        this.add.rectangle(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT, 0x101a12);
        this.add.text(SCREEN_WIDTH / 2, 120, 'VICTORY', {
            color: '#b8ff9c',
            fontSize: '58px',
            fontFamily: 'monospace',
        }).setOrigin(0.5, 0.5);

        this.add.text(
            SCREEN_WIDTH / 2,
            300,
            `SESSION CLEARED\nHUNTS COMPLETED ${gameSession.huntsCompleted}\nBASE SCORE ${player.score}\nCOMPLETION BONUS ${completionBonus}\nFINAL SCORE ${finalScore}`,
            {
                color: '#ffffff',
                fontSize: '28px',
                fontFamily: 'monospace',
                align: 'center',
            }
        ).setOrigin(0.5, 0.5);

        this.add.text(SCREEN_WIDTH / 2, 560, 'PRESS C OR SPACE TO RETURN TO ATTRACT', {
            color: '#ffd27a',
            fontSize: '26px',
            fontFamily: 'monospace',
        }).setOrigin(0.5, 0.5);

        this.startKeys = this.input.keyboard.addKeys({
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            c: Phaser.Input.Keyboard.KeyCodes.C,
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.startKeys.space) || Phaser.Input.Keyboard.JustDown(this.startKeys.c)) {
            gameSession.reset();
            this.scene.start('AttractScene');
        }
    }
}
