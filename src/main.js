import Phaser from 'phaser';
import CaveBarScene from './scenes/CaveBarScene.js';
import HuntScene from './scenes/HuntScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './systems/CoordinateSystem.js';

const config = {
    type: Phaser.AUTO,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#2d2d2d',
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [CaveBarScene, HuntScene, GameOverScene]
};

const game = new Phaser.Game(config);
