export function loadCoreAssets(scene) {
    const colors = ['red', 'blue', 'yellow', 'green'];
    colors.forEach((color, index) => {
        scene.load.atlas(`player-${index}`, `/assets/generated/spritesheets/${color}-hero.png`, `/assets/generated/spritesheets/${color}-hero.json`);
    });

    scene.load.atlas('compy', '/assets/generated/spritesheets/compy.png', '/assets/generated/spritesheets/compy.json');
    scene.load.atlas('bartender', '/assets/generated/spritesheets/bartender.png', '/assets/generated/spritesheets/bartender.json');

    scene.load.image('tileset-jungle', '/assets/tilesets/sidescroller/jungle.png');
    scene.load.image('tileset-graveyard', '/assets/tilesets/sidescroller/graveyard.png');
    scene.load.image('tileset-savanna', '/assets/tilesets/sidescroller/savanna.png');
    scene.load.image('tileset-tundra', '/assets/tilesets/sidescroller/tundra.png');
    scene.load.image('tileset-volcanic', '/assets/tilesets/sidescroller/volcanic.png');
}

export function textureExists(scene, key) {
    return Boolean(scene.textures?.exists?.(key));
}

export function createAtlasSpriteOrFallback(scene, x, y, atlasKey, frame, fallbackWidth, fallbackHeight, fallbackColor) {
    if (textureExists(scene, atlasKey) && scene.add?.sprite) {
        return scene.add.sprite(x, y, atlasKey, frame);
    }

    return scene.add.rectangle(x, y, fallbackWidth, fallbackHeight, fallbackColor);
}

export function createTileBackdrop(scene, textureKey, x, y, width, height, tint = 0xffffff) {
    if (textureExists(scene, textureKey) && scene.add?.tileSprite) {
        return scene.add.tileSprite(x, y, width, height, textureKey).setTint(tint);
    }

    return scene.add.rectangle(x, y, width, height, 0x2a2f39);
}
