import Phaser from 'phaser';
import MovementSandboxScene from './scenes/MovementSandboxScene.js';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './systems/WorldConfig.js';

const config = {
    type: Phaser.AUTO,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#10141f',
    parent: document.body,
    scene: [MovementSandboxScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

export default new Phaser.Game(config);
