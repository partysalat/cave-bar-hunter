import Phaser from 'phaser';
import TestScene from './scenes/TestScene.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './systems/CoordinateSystem.js';

const config = {
    type: Phaser.AUTO,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#2d2d2d',
    parent: 'game-container',
    scale: {
        // Scale modes available:
        // - FIT: Scales to fit browser, maintains aspect ratio, may show letterboxing
        // - ENVELOP: Scales to fill browser, maintains aspect ratio, may crop edges
        // - RESIZE: Dynamically resizes canvas to match browser (changes game dimensions)
        // - EXPAND: Expands to fill browser, maintains aspect ratio
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [TestScene]
};

const game = new Phaser.Game(config);
