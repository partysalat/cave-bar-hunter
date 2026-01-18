import Phaser from 'phaser';
import TestScene from './scenes/TestScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    backgroundColor: '#2d2d2d',
    parent: 'game-container',
    scene: [TestScene]
};

const game = new Phaser.Game(config);
