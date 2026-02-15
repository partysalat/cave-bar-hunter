/**
 * 2D collision detection and physics for sidescroller
 * worldX = horizontal, worldY = vertical height (0 = ground)
 */

export const GRAVITY = -40; // world units/second² (downward)

/**
 * Calculates 2D distance between two points
 */
export function distance2D(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Sphere vs sphere collision (2D circles)
 * @param {Object} a - Entity with worldX, worldY, radius
 * @param {Object} b - Entity with worldX, worldY, radius
 * @returns {boolean} True if colliding
 */
export function sphereVsSphere(a, b) {
    const dist = distance2D(a.worldX, a.worldY, b.worldX, b.worldY);
    return dist < a.radius + b.radius;
}

/**
 * Box vs box collision (AABB, 2D)
 * @param {Object} a - Entity with worldX, worldY, width, height
 * @param {Object} b - Entity with worldX, worldY, width, height
 * @returns {boolean} True if colliding
 */
export function boxVsBox(a, b) {
    const xOverlap = Math.abs(a.worldX - b.worldX) < (a.width + b.width) / 2;
    const yOverlap = Math.abs(a.worldY - b.worldY) < (a.height + b.height) / 2;
    return xOverlap && yOverlap;
}

/**
 * Sphere vs box collision (2D)
 * @param {Object} sphere - Entity with worldX, worldY, radius
 * @param {Object} box - Entity with worldX, worldY, width, height
 * @returns {boolean} True if colliding
 */
export function sphereVsBox(sphere, box) {
    const closestX = Math.max(box.worldX - box.width / 2, Math.min(sphere.worldX, box.worldX + box.width / 2));
    const closestY = Math.max(box.worldY, Math.min(sphere.worldY, box.worldY + box.height));
    const dist = distance2D(sphere.worldX, sphere.worldY, closestX, closestY);
    return dist < sphere.radius;
}

/**
 * Applies gravity to an entity and resolves ground collision.
 * Call once per frame for all entities with affectedByGravity = true.
 * @param {Object} entity - Entity with worldY, velocityY, onGround
 * @param {number} delta - Time since last frame in ms
 */
export function applyGravity(entity, delta) {
    if (!entity.affectedByGravity) return;

    const dt = delta / 1000;
    entity.velocityY += GRAVITY * dt;
    entity.worldY += entity.velocityY * dt;

    // Ground collision
    if (entity.worldY <= 0) {
        entity.worldY = 0;
        entity.velocityY = 0;
        entity.onGround = true;
    } else {
        entity.onGround = false;
    }
}

/**
 * Resolves collision between an entity and a platform rectangle.
 * Platforms are one-way: entity can jump through from below, lands on top.
 * @param {Object} entity - Entity with worldX, worldY, velocityY, radius, onGround
 * @param {Object} platform - Platform with x, y, width (world units)
 * @param {number} prevY - Entity's worldY before this frame's movement
 */
export function checkPlatform(entity, platform, prevY) {
    const halfWidth = platform.width / 2;
    const withinX = entity.worldX >= platform.x - halfWidth && entity.worldX <= platform.x + halfWidth;
    if (!withinX) return;

    // Only land when falling onto the platform from above (not jumping through)
    const landingOnTop = prevY >= platform.y && entity.worldY < platform.y && entity.velocityY <= 0;
    if (landingOnTop) {
        entity.worldY = platform.y;
        entity.velocityY = 0;
        entity.onGround = true;
    }
}
