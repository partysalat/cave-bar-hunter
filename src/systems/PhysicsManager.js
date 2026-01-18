/**
 * Custom 3D collision detection for isometric game
 * Handles sphere-vs-sphere and box collision
 */

/**
 * Calculates 3D distance between two points
 * @param {number} x1
 * @param {number} y1
 * @param {number} z1
 * @param {number} x2
 * @param {number} y2
 * @param {number} z2
 * @returns {number} Distance
 */
export function distance3D(x1, y1, z1, x2, y2, z2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dz = z2 - z1;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Sphere vs sphere collision detection
 * @param {Object} a - Entity with worldX, worldY, worldZ, radius
 * @param {Object} b - Entity with worldX, worldY, worldZ, radius
 * @returns {boolean} True if colliding
 */
export function sphereVsSphere(a, b) {
    const dist = distance3D(a.worldX, a.worldY, a.worldZ, b.worldX, b.worldY, b.worldZ);
    const radiusSum = a.radius + b.radius;
    return dist < radiusSum;
}

/**
 * Box vs box collision detection (AABB)
 * @param {Object} a - Entity with worldX, worldY, worldZ, width, depth, height
 * @param {Object} b - Entity with worldX, worldY, worldZ, width, depth, height
 * @returns {boolean} True if colliding
 */
export function boxVsBox(a, b) {
    // Check overlap on all 3 axes
    const xOverlap = Math.abs(a.worldX - b.worldX) < (a.width + b.width) / 2;
    const yOverlap = Math.abs(a.worldY - b.worldY) < (a.depth + b.depth) / 2;
    const zOverlap = Math.abs(a.worldZ - b.worldZ) < (a.height + b.height) / 2;

    return xOverlap && yOverlap && zOverlap;
}

/**
 * Sphere vs box collision detection
 * @param {Object} sphere - Entity with worldX, worldY, worldZ, radius
 * @param {Object} box - Entity with worldX, worldY, worldZ, width, depth, height
 * @returns {boolean} True if colliding
 */
export function sphereVsBox(sphere, box) {
    // Find closest point on box to sphere center
    const closestX = Math.max(box.worldX - box.width/2, Math.min(sphere.worldX, box.worldX + box.width/2));
    const closestY = Math.max(box.worldY - box.depth/2, Math.min(sphere.worldY, box.worldY + box.depth/2));
    const closestZ = Math.max(box.worldZ, Math.min(sphere.worldZ, box.worldZ + box.height));

    const dist = distance3D(sphere.worldX, sphere.worldY, sphere.worldZ, closestX, closestY, closestZ);
    return dist < sphere.radius;
}
