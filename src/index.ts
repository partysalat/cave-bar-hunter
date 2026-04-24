import Phaser from 'phaser';

import { BootScene } from './scenes/BootScene.js';
import { CaveBarScene } from './scenes/CaveBarScene.js';
import { HuntScene } from './scenes/HuntScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#050806',
    parent: undefined,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
    },
    audio: {
        noAudio: true,
    },
    scene: [BootScene, PreloadScene, HuntScene, CaveBarScene],
};

new Phaser.Game(config);
