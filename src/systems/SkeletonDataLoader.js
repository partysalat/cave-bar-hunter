/**
 * Loads and parses skeleton data from PixelLab character JSON files
 * NOTE: Skeleton data is loaded via Phaser's load.json() in preload().
 * This module provides utility functions to parse the loaded data.
 */

/**
 * Maps direction to which hand is more visible
 * @param {string} direction - One of 8 directions
 * @returns {string} 'left' or 'right'
 */
function getHandForDirection(direction) {
    const rightHandDirections = ['south', 'south-east', 'east', 'north-east'];
    return rightHandDirections.includes(direction) ? 'right' : 'left';
}

/**
 * Gets hand position from skeleton data for a specific direction
 * @param {Object} skeletonData - Parsed skeleton JSON data
 * @param {string} direction - Facing direction (south, north, etc.)
 * @returns {Object|null} {x, y, z, hand} normalized coordinates or null
 */
export function getHandPosition(skeletonData, direction) {
    if (!skeletonData?.skeletons?.['3d']?.keypoints) {
        return null;
    }

    const keypoints = skeletonData.skeletons['3d'].keypoints;
    const hand = getHandForDirection(direction);
    const armKey = hand === 'right' ? 'RIGHT ARM' : 'LEFT ARM';

    const armPosition = keypoints[armKey];
    if (!armPosition || armPosition.length < 3) {
        return null;
    }

    return {
        x: armPosition[0],
        y: armPosition[1],
        z: armPosition[2],
        hand
    };
}
