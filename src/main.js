import Phaser from 'phaser';
import AttractScene from './scenes/AttractScene.js';
import CaveBarScene from './scenes/CaveBarScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import HuntScene from './scenes/HuntScene.js';
import PlayerSelectScene from './scenes/PlayerSelectScene.js';
import VictoryScene from './scenes/VictoryScene.js';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './systems/WorldConfig.js';

const config = {
    type: Phaser.AUTO,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#10141f',
    parent: document.body,
    scene: [AttractScene, PlayerSelectScene, HuntScene, CaveBarScene, GameOverScene, VictoryScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

export default new Phaser.Game(config);
