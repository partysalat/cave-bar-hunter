const GRAVITY = 40;

function isWithinPlatformBounds(player, platform) {
    const halfWidth = player.width / 2;
    return player.worldX + halfWidth >= platform.x && player.worldX - halfWidth <= platform.x + platform.width;
}

export function applyPlayerPhysics(player, deltaSeconds, platforms, arenaWidth) {
    const previousY = player.worldY;
    const previousVelocityY = player.velocityY;

    player.worldX += player.velocityX * deltaSeconds;
    player.worldX = Math.max(0, Math.min(arenaWidth, player.worldX));

    player.velocityY -= GRAVITY * deltaSeconds;
    player.worldY += player.velocityY * deltaSeconds;
    player.onGround = false;

    const sortedPlatforms = [...platforms].sort((a, b) => a.y - b.y);

    for (const platform of sortedPlatforms) {
        const fallingPastPlatform =
            previousY >= platform.y &&
            player.worldY <= platform.y &&
            previousVelocityY <= 0 &&
            isWithinPlatformBounds(player, platform);

        if (fallingPastPlatform) {
            player.worldY = platform.y;
            player.velocityY = 0;
            player.onGround = true;
            return;
        }
    }

    if (player.worldY <= 0) {
        player.worldY = 0;
        player.velocityY = 0;
        player.onGround = true;
    }
}

export function getGravity() {
    return GRAVITY;
}
