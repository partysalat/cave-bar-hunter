import Phaser from 'phaser';
import Player from '../entities/Player.js';
import InputManager from '../systems/InputManager.js';
import HUD from '../ui/HUD.js';
import { ARENA, FLOOR_Y, PIXELS_PER_UNIT, SCREEN_HEIGHT } from '../systems/WorldConfig.js';
import { gameSession } from '../systems/SessionManager.js';
import { createAtlasSpriteOrFallback, createTileBackdrop, loadCoreAssets } from '../systems/AssetLoader.js';

const CAVE_BAR_TIME = 15;
const STATIONS = [
    { key: 'weapon', x: 9, label: 'WEAPON RACK', cost: 10, description: '+1 melee, +1 throw' },
    { key: 'painting', x: 22, label: 'CAVE PAINTING', cost: 15, description: '+1 max health' },
    { key: 'drink', x: 35, label: 'BARTENDER', cost: 10, description: '+move, faster dodge' },
];

export default class CaveBarScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CaveBarScene' });
    }

    preload() {
        loadCoreAssets(this);
    }

    create() {
        this.inputManager = new InputManager(this);
        this.inputManager.setupKeyboard();
        this.hud = new HUD(this);

        this.drawBackdrop();
        this.drawStations();

        this.players = [new Player(this, 0, 4, 0)];
        gameSession.loadPlayerState(this.players);
        this.player = this.players[0];
        this.player.health = this.player.maxHealth;
        this.timer = CAVE_BAR_TIME;
        this.transitioning = false;
        this.interactHeld = false;

        this.header = this.add.text(24, 24, '', {
            color: '#ffd58f',
            fontSize: '26px',
            fontFamily: 'monospace',
        }).setScrollFactor(0);

        this.prompt = this.add.text(640, 160, '', {
            color: '#ffffff',
            fontSize: '28px',
            fontFamily: 'monospace',
            align: 'center',
            backgroundColor: '#000000aa',
            padding: { x: 14, y: 10 },
        }).setOrigin(0.5, 0.5).setScrollFactor(0);

        this.resultOverlay = this.add.text(640, 240, '', {
            color: '#ffffff',
            fontSize: '36px',
            fontFamily: 'monospace',
            align: 'center',
            backgroundColor: '#000000aa',
            padding: { x: 18, y: 12 },
        }).setOrigin(0.5, 0.5).setScrollFactor(0).setVisible(false);
    }

    drawBackdrop() {
        createTileBackdrop(this, 'tileset-graveyard', (ARENA.width * PIXELS_PER_UNIT) / 2, SCREEN_HEIGHT / 2, ARENA.width * PIXELS_PER_UNIT, SCREEN_HEIGHT, 0x9c7c64)
            .setOrigin?.(0.5, 0.5)
            .setAlpha?.(0.26);
        createTileBackdrop(this, 'tileset-volcanic', (ARENA.width * PIXELS_PER_UNIT) / 2, FLOOR_Y + 48, ARENA.width * PIXELS_PER_UNIT, 96, 0xffffff)
            .setOrigin?.(0.5, 0.5)
            .setAlpha?.(0.45);
    }

    drawStations() {
        STATIONS.forEach((station) => {
            this.add.rectangle(station.x * PIXELS_PER_UNIT, FLOOR_Y - 20, 120, 120, 0x6e5237).setOrigin(0.5, 1);
            this.add.text(station.x * PIXELS_PER_UNIT, FLOOR_Y - 160, station.label, {
                color: '#f6e2b6',
                fontSize: '18px',
                fontFamily: 'monospace',
                align: 'center',
            }).setOrigin(0.5, 0.5);
        });

        this.bartenderSprite = createAtlasSpriteOrFallback(
            this,
            STATIONS[2].x * PIXELS_PER_UNIT,
            FLOOR_Y - 20,
            'bartender',
            'bartender-idle-west-0',
            56,
            96,
            0xb77d43
        );
        this.bartenderSprite.setOrigin?.(0.5, 1);
        this.bartenderSprite.setScale?.(1.3);
    }

    update(_time, delta) {
        const deltaSeconds = delta / 1000;
        if (this.transitioning) return;

        this.timer = Math.max(0, this.timer - deltaSeconds);
        const input = this.inputManager.getPlayerInputWithKeyboard(0);
        if (input) {
            const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
            if (direction === 0) this.player.stop();
            else this.player.move(direction);

            if (input.interactPressed && !this.interactHeld) {
                this.tryInteract();
            }
            this.interactHeld = input.interactPressed;
        }

        this.player.worldX += this.player.velocityX * deltaSeconds;
        this.player.worldX = Math.max(0, Math.min(ARENA.width, this.player.worldX));
        this.player.update(deltaSeconds);
        this.player.worldY = 0;
        this.player.updateScreenPosition();

        this.updateUi();

        if (this.timer === 0) {
            this.leaveForNextHunt();
        }
    }

    getNearbyStation() {
        return STATIONS.find((station) => Math.abs(this.player.worldX - station.x) <= 2.2) ?? null;
    }

    tryInteract() {
        const station = this.getNearbyStation();
        if (!station) return;

        const data = gameSession.getPlayerData(0);
        if (data.upgrades[station.key]) {
            this.flashResult(`${station.label}\nALREADY PURCHASED`);
            return;
        }

        if (!this.player.spendScore(station.cost)) {
            this.flashResult(`${station.label}\nNEED ${station.cost} POINTS`);
            return;
        }

        if (station.key === 'weapon') {
            this.player.meleeDamage += 1;
            this.player.throwDamage += 1;
        } else if (station.key === 'painting') {
            this.player.maxHealth += 1;
            this.player.health = this.player.maxHealth;
        } else if (station.key === 'drink') {
            this.player.moveSpeedMultiplier = 1.2;
            this.player.dodgeCooldownMultiplier = 0.8;
        }

        data.upgrades[station.key] = true;
        gameSession.savePlayerState([this.player]);
        this.flashResult(`${station.label}\nPURCHASED`);
    }

    flashResult(message) {
        this.resultOverlay.setText(message);
        this.resultOverlay.setVisible(true);
        this.time.delayedCall(800, () => {
            this.resultOverlay.setVisible(false);
        });
    }

    updateUi() {
        const nearby = this.getNearbyStation();
        this.header.setText(`Cave Bar   Hunt ${gameSession.currentHunt}/${gameSession.totalHunts}`);
        this.prompt.setText(
            nearby
                ? `${nearby.label}\nPress C to buy (${nearby.cost})\n${nearby.description}`
                : 'Move between stations\nPress C to interact'
        );

        this.hud.update([
            `POINTS ${this.player.score}   HP ${this.player.health}/${this.player.maxHealth}`,
            `MELEE ${this.player.meleeDamage}   THROW ${this.player.throwDamage}   TIMER ${this.timer.toFixed(1)}`,
            `MOVE x${this.player.moveSpeedMultiplier.toFixed(1)}   DODGE x${this.player.dodgeCooldownMultiplier.toFixed(1)}`,
        ]);
    }

    leaveForNextHunt() {
        this.transitioning = true;
        gameSession.savePlayerState([this.player]);
        this.resultOverlay.setText('TO THE HUNT!');
        this.resultOverlay.setVisible(true);
        this.time.delayedCall(1200, () => {
            this.scene.start('HuntScene');
        });
    }
}
