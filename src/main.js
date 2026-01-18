import Phaser from 'phaser';

const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    backgroundColor: '#2d2d2d',
    parent: 'game-container',
    scene: []
};

const game = new Phaser.Game(config);
