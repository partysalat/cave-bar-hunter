import Phaser from 'phaser';
import TestScene from './scenes/TestScene.js';

const config = {
    type: Phaser.AUTO,
    width: 2560,  // 2K resolution
    height: 1440, // 2K resolution
    backgroundColor: '#2d2d2d',
    parent: 'game-container',
    scene: [TestScene]
};

const game = new Phaser.Game(config);
