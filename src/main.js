import Phaser from 'phaser';
import TestScene from './scenes/TestScene.js';
import CaveBarScene from './scenes/CaveBarScene.js';
import HuntScene from './scenes/HuntScene.js';
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
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    // Active scene: CaveBarScene starts, transitions to HuntScene after timer
    // Switch to TestScene for combat testing
    scene: [CaveBarScene, HuntScene, TestScene]
};

const game = new Phaser.Game(config);
