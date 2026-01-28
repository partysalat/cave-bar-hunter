import { describe, it, expect } from 'vitest';
import { getHandPosition } from '../src/systems/SkeletonDataLoader.js';

describe('SkeletonDataLoader', () => {
    it('returns null for invalid skeleton data', () => {
        const result = getHandPosition(null, 'south');
        expect(result).toBeNull();
    });

    it('returns right arm position for south direction', () => {
        const mockSkeleton = {
            skeletons: {
                '3d': {
                    keypoints: {
                        'RIGHT ARM': [0.384, 0.487, 0.399],
                        'LEFT ARM': [0.616, 0.486, 0.400]
                    }
                }
            }
        };

        const result = getHandPosition(mockSkeleton, 'south');
        expect(result).toEqual({ x: 0.384, y: 0.487, z: 0.399, hand: 'right' });
    });

    it('returns left arm position for north direction', () => {
        const mockSkeleton = {
            skeletons: {
                '3d': {
                    keypoints: {
                        'RIGHT ARM': [0.384, 0.487, 0.399],
                        'LEFT ARM': [0.616, 0.486, 0.400]
                    }
                }
            }
        };

        const result = getHandPosition(mockSkeleton, 'north');
        expect(result).toEqual({ x: 0.616, y: 0.486, z: 0.400, hand: 'left' });
    });

    it('handles all 8 directions correctly', () => {
        const mockSkeleton = {
            skeletons: {
                '3d': {
                    keypoints: {
                        'RIGHT ARM': [0.384, 0.487, 0.399],
                        'LEFT ARM': [0.616, 0.486, 0.400]
                    }
                }
            }
        };

        // Right hand directions
        expect(getHandPosition(mockSkeleton, 'south').hand).toBe('right');
        expect(getHandPosition(mockSkeleton, 'south-east').hand).toBe('right');
        expect(getHandPosition(mockSkeleton, 'east').hand).toBe('right');
        expect(getHandPosition(mockSkeleton, 'north-east').hand).toBe('right');

        // Left hand directions
        expect(getHandPosition(mockSkeleton, 'north').hand).toBe('left');
        expect(getHandPosition(mockSkeleton, 'north-west').hand).toBe('left');
        expect(getHandPosition(mockSkeleton, 'west').hand).toBe('left');
        expect(getHandPosition(mockSkeleton, 'south-west').hand).toBe('left');
    });
});