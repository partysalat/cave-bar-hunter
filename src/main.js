import Phaser from 'phaser';
import TestScene from './scenes/TestScene.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './systems/CoordinateSystem.js';

const config = {
    type: Phaser.AUTO,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#2d2d2d',
    parent: 'game-container',
    scene: [TestScene]
};

const game = new Phaser.Game(config);
