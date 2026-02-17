import Phaser from 'phaser';
import {
    worldToScreen, SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_FLOOR_Y, DEPTH_LAYERS,
} from '../systems/CoordinateSystem.js';
import Player from '../entities/Player.js';
import InputManager from '../systems/InputManager.js';
import WeaponShopMenu from '../ui/WeaponShopMenu.js';
import AbilityPaintingUI from '../ui/AbilityPaintingUI.js';
import CocktailMenu from '../ui/CocktailMenu.js';
import { passiveAbilities } from '../data/passiveAbilities.js';
import { gameSession } from '../systems/SessionManager.js';

/**
 * Cave Bar Scene - sidescroller hub between hunts.
 *
 * Players walk left/right to browse shops. 30-second countdown,
 * then auto-transitions to HuntScene.
 *
 * Layout (world units, width = 40 = one screen at 64px/unit):
 *   x=4   Weapon Rack
 *   x=11..23  Cave Paintings (5, spaced 3 units apart)
 *   x=34  Bartender / bar counter
 */

const CAVE_BAR = {
    width: 40,
    weaponRack: { x: 4,  interactionRadius: 2.5 },
    paintings:  passiveAbilities.map((ability, i) => ({
        x: 11 + i * 3,
        interactionRadius: 2.0,
        ability,
    })),
    bartender:  { x: 34, interactionRadius: 3.5 },
    spawnXs:    [24, 26, 28, 30],
};

const COUNTDOWN_SECONDS = 30;

// Screen-space Y constants (camera-fixed)
const GROUND_Y = SCREEN_FLOOR_Y;        // 1100 - ground line
const PROP_Y   = GROUND_Y - 100;        // 1000 - prop sprite center
const LABEL_Y  = GROUND_Y - 230;        //  870 - text label above prop
const PROMPT_Y = GROUND_Y - 180;        //  920 - interaction prompt

const PAINTING_COLORS = [0x8B0000, 0x006400, 0x00008B, 0x8B6914, 0x5b0d91];

export default class CaveBarScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CaveBarScene' });
    }

    preload() {
        const colors = ['red', 'blue', 'yellow', 'green'];
        colors.forEach((color, i) => {
            this.load.atlas(
                `player-${i}`,
                `/assets/generated/spritesheets/${color}-hero.png`,
                `/assets/generated/spritesheets/${color}-hero.json`
            );
        });
    }

    create() {
        this.inputManager = new InputManager(this);
        this.inputManager.setupKeyboard();

        this.buildBackground();
        this.buildGround();
        this.buildInteractables();
        this.spawnPlayers();
        this.createPlayerAnimations();

        gameSession.loadPlayerState(this.players);

        this.weaponShopMenus = this.players.map(p => new WeaponShopMenu(this, p));
        this.cocktailMenus   = this.players.map(p => new CocktailMenu(this, p, this.bartenderStub));
        this.buildAbilityUIs();
        this.buildTimerDisplay();

        // Cave bar always shows from world x=0 (exactly one screen wide)
        this.cameras.main.setScroll(0, 0);

        this.countdown = COUNTDOWN_SECONDS;
        this.exiting   = false;
    }

    // ─── Visuals ─────────────────────────────────────────────────────────────

    buildBackground() {
        const cx = SCREEN_WIDTH / 2;

        // Dark stone cave
        this.add.rectangle(cx, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT, 0x1a1410)
            .setScrollFactor(0).setDepth(DEPTH_LAYERS.BACKGROUND);

        // Slightly lighter upper wall band
        this.add.rectangle(cx, 250, SCREEN_WIDTH, 500, 0x261b12)
            .setScrollFactor(0).setDepth(DEPTH_LAYERS.BACKGROUND);

        // Atmospheric torch glow spots
        [300, 800, 1280, 1760, 2260].forEach(x => {
            const glow = this.add.circle(x, 560, 140, 0xff8833, 0.10)
                .setScrollFactor(0).setDepth(DEPTH_LAYERS.BACKGROUND + 1);
            this.tweens.add({
                targets: glow, alpha: 0.18,
                duration: 1500 + Math.random() * 600,
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            });
        });
    }

    buildGround() {
        const cx = SCREEN_WIDTH / 2;
        // Ground fill
        this.add.rectangle(cx, GROUND_Y + 200, SCREEN_WIDTH, 400, 0x3d2b1a)
            .setScrollFactor(0).setDepth(DEPTH_LAYERS.PLATFORMS);
        // Ground top edge
        this.add.rectangle(cx, GROUND_Y + 8, SCREEN_WIDTH, 16, 0x5a3d22)
            .setScrollFactor(0).setDepth(DEPTH_LAYERS.PLATFORMS);
    }

    buildInteractables() {
        this.buildWeaponRack();
        this.buildPaintings();
        this.buildBarCounter();
    }

    buildWeaponRack() {
        const sx = worldToScreen(CAVE_BAR.weaponRack.x, 0).x;

        this.add.rectangle(sx, PROP_Y, 56, 110, 0x8B4513)
            .setScrollFactor(0).setDepth(DEPTH_LAYERS.ENTITIES);
        this.add.text(sx, LABEL_Y, 'WEAPONS', {
            fontSize: '20px', fontFamily: 'Arial', color: '#ffcc88',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_LAYERS.UI);

        this.weaponRackPrompt = this._makePrompt(sx, PROMPT_Y, 'X: Browse Weapons');
    }

    buildPaintings() {
        this.paintingObjects = CAVE_BAR.paintings.map((pd, i) => {
            const sx = worldToScreen(pd.x, 0).x;
            const baseColor = PAINTING_COLORS[i];

            const rect = this.add.rectangle(sx, PROP_Y, 46, 76, baseColor)
                .setScrollFactor(0).setDepth(DEPTH_LAYERS.ENTITIES);
            this.add.text(sx, LABEL_Y, pd.ability.name, {
                fontSize: '15px', fontFamily: 'Arial', color: '#ffcc88',
            }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_LAYERS.UI);

            // AbilityPaintingUI calls sprite.getCenter() and sprite.setTint().
            // Rectangle doesn't support setTint, so provide a thin adapter.
            const sprite = {
                getCenter: () => ({ x: rect.x, y: rect.y }),
                setTint: (color) => rect.setFillStyle(color === 0xffffff ? baseColor : color),
            };

            return {
                sprite,
                worldX: pd.x,
                worldY: 0,
                interactionRadius: pd.interactionRadius,
                ability: pd.ability,
                prompt: this._makePrompt(sx, PROMPT_Y, 'X: View Ability'),
            };
        });
    }

    buildBarCounter() {
        const sx = worldToScreen(CAVE_BAR.bartender.x, 0).x;

        // Counter surface
        this.add.rectangle(sx, GROUND_Y - 30, 220, 60, 0x5a3010)
            .setScrollFactor(0).setDepth(DEPTH_LAYERS.ENTITIES);
        // Bartender figure (placeholder until side-view asset exists)
        this.add.rectangle(sx, PROP_Y, 40, 80, 0xcc8844)
            .setScrollFactor(0).setDepth(DEPTH_LAYERS.ENTITIES + 1);
        this.add.text(sx, LABEL_Y, 'BARTENDER', {
            fontSize: '20px', fontFamily: 'Arial', color: '#ffcc88',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_LAYERS.UI);

        this.bartenderPrompt = this._makePrompt(sx, PROMPT_Y, 'X: Order Drink');

        // Minimal stub so CocktailMenu can call serveDrink() etc.
        this.bartenderStub = {
            worldX: CAVE_BAR.bartender.x,
            worldY: 0,
            serveDrink:  () => {},
            celebrate:   () => {},
            disapprove:  () => {},
        };
    }

    _makePrompt(screenX, screenY, text) {
        return this.add.text(screenX, screenY, text, {
            fontSize: '15px', fontFamily: 'Arial', color: '#ffffff',
            backgroundColor: '#000000cc', padding: { x: 8, y: 4 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_LAYERS.UI).setVisible(false);
    }

    // ─── Players ─────────────────────────────────────────────────────────────

    spawnPlayers() {
        this.players = CAVE_BAR.spawnXs.map((x, i) => {
            const p = new Player(this, i, x, 0);
            p.moveSpeed = 6;
            p.velocityX = 0;
            p.velocityY = 0;
            p.onGround = true;
            p.affectedByGravity = false; // no gravity in cave bar
            return p;
        });
    }

    createPlayerAnimations() {
        for (let i = 0; i < 4; i++) {
            [
                { key: `player-${i}-idle`, prefix: `player-${i}-idle-`, end: 3, fps: 6  },
                { key: `player-${i}-run`,  prefix: `player-${i}-run-`,  end: 7, fps: 12 },
            ].forEach(({ key, prefix, end, fps }) => {
                if (!this.anims.exists(key)) {
                    this.anims.create({
                        key,
                        frames: this.anims.generateFrameNames(`player-${i}`, { prefix, start: 0, end }),
                        frameRate: fps,
                        repeat: -1,
                    });
                }
            });
        }
    }

    // ─── UI ──────────────────────────────────────────────────────────────────

    buildAbilityUIs() {
        // [playerIndex][paintingIndex] → AbilityPaintingUI
        this.abilityUIs = this.players.map(player =>
            this.paintingObjects.map(painting => new AbilityPaintingUI(this, painting, player))
        );
    }

    buildTimerDisplay() {
        const cx = SCREEN_WIDTH / 2;

        this.timerText = this.add.text(cx, 50, this.formatTimer(COUNTDOWN_SECONDS), {
            fontSize: '56px', fontFamily: 'Arial', color: '#ffffff',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 6,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_LAYERS.UI);

        this.add.text(cx, 112, 'NEXT HUNT IN', {
            fontSize: '18px', fontFamily: 'Arial', color: '#aaaaaa',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_LAYERS.UI);
    }

    // ─── Update ──────────────────────────────────────────────────────────────

    update(_time, delta) {
        if (this.exiting) return;
        this.updateCountdown(delta);
        this.updatePlayers(delta);
        this.updatePrompts();
        this.updateMenuInput();
    }

    updateCountdown(delta) {
        this.countdown -= delta / 1000;
        const remaining = Math.max(0, this.countdown);
        this.timerText.setText(this.formatTimer(remaining));
        if      (remaining <= 5)  this.timerText.setColor('#ff0000');
        else if (remaining <= 10) this.timerText.setColor('#ff6600');

        if (this.countdown <= 0) this.exitToHunt();
    }

    updatePlayers(delta) {
        this.players.forEach((player, i) => {
            const menuOpen = this.weaponShopMenus[i].isOpen || this.cocktailMenus[i].isOpen;

            if (!menuOpen) {
                const input = this.inputManager.getPlayerInputWithKeyboard(i);
                if (input) {
                    const h = (input.dpad.right ? 1 : 0) - (input.dpad.left ? 1 : 0);
                    if (h !== 0) player.move(h);
                    else         player.stop();

                    const xDown = input.buttons.x;
                    if (xDown && !player._lastX) this.tryInteract(player, i);
                    player._lastX = xDown;
                }
            }

            player.update(delta);

            // No gravity here - hold players at ground level
            player.worldY = 0;
            player.worldX = Math.max(0, Math.min(CAVE_BAR.width, player.worldX));
            player.updateScreenPosition();
        });
    }

    tryInteract(player, playerIndex) {
        const px = player.worldX;

        if (Math.abs(px - CAVE_BAR.weaponRack.x) <= CAVE_BAR.weaponRack.interactionRadius) {
            if (this.cocktailMenus[playerIndex].isOpen) this.cocktailMenus[playerIndex].close();
            this.weaponShopMenus[playerIndex].open();
            return;
        }

        for (let pi = 0; pi < this.paintingObjects.length; pi++) {
            const pd = CAVE_BAR.paintings[pi];
            if (Math.abs(px - pd.x) <= pd.interactionRadius) {
                const ui = this.abilityUIs[playerIndex][pi];
                if (ui.isVisible) ui.tryPurchase();
                return;
            }
        }

        if (Math.abs(px - CAVE_BAR.bartender.x) <= CAVE_BAR.bartender.interactionRadius) {
            if (this.weaponShopMenus[playerIndex].isOpen) this.weaponShopMenus[playerIndex].close();
            this.cocktailMenus[playerIndex].open();
        }
    }

    updatePrompts() {
        this.weaponRackPrompt.setVisible(
            this.players.some(p => Math.abs(p.worldX - CAVE_BAR.weaponRack.x) <= CAVE_BAR.weaponRack.interactionRadius)
        );

        this.paintingObjects.forEach((painting, pi) => {
            const pd = CAVE_BAR.paintings[pi];
            painting.prompt.setVisible(
                this.players.some(p => Math.abs(p.worldX - pd.x) <= pd.interactionRadius)
            );

            this.players.forEach((player, playerIndex) => {
                const near = Math.abs(player.worldX - pd.x) <= pd.interactionRadius;
                const ui   = this.abilityUIs[playerIndex][pi];
                if (near && !ui.isVisible) {
                    ui.show();
                    ui.updatePaintingState?.();
                } else if (!near && ui.isVisible) {
                    ui.hide();
                }
            });
        });

        this.bartenderPrompt.setVisible(
            this.players.some(p => Math.abs(p.worldX - CAVE_BAR.bartender.x) <= CAVE_BAR.bartender.interactionRadius)
        );
    }

    updateMenuInput() {
        this.players.forEach((player, i) => {
            const input = this.inputManager.getPlayerInputWithKeyboard(i);
            if (!input) return;
            if (this.weaponShopMenus[i].isOpen) this.weaponShopMenus[i].update(input);
            if (this.cocktailMenus[i].isOpen)   this.cocktailMenus[i].update(input);
        });
    }

    // ─── Exit ────────────────────────────────────────────────────────────────

    exitToHunt() {
        if (this.exiting) return;
        this.exiting = true;

        gameSession.savePlayerState(this.players);

        this.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 'TIME\'S UP!\nTO THE HUNT!', {
            fontSize: '56px', fontFamily: 'Arial', color: '#ff9900',
            fontStyle: 'bold', align: 'center', stroke: '#000000', strokeThickness: 8,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_LAYERS.UI + 100);

        this.time.delayedCall(2000, () => {
            this.cameras.main.fadeOut(800, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('HuntScene');
            });
        });
    }

    formatTimer(seconds) {
        const s = Math.ceil(seconds);
        return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    }
}
