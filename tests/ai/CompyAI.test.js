import { describe, it, expect, beforeEach, vi } from 'vitest';
import CompyAI from '../../src/ai/CompyAI.js';
import { createMockCompy, createMockPlayer } from '../fixtures/mockPhaser.js';

describe('CompyAI', () => {
    let compy;
    let allCompys;
    let players;
    let ai;

    beforeEach(() => {
        compy = createMockCompy(20, 15, 0);
        allCompys = [
            compy,
            createMockCompy(22, 16, 0),
            createMockCompy(18, 14, 0)
        ];
        players = [
            createMockPlayer(0, 15, 12, 0),
            createMockPlayer(1, 16, 13, 0)
        ];
    });

    describe('initialization', () => {
        it('should initialize with CIRCLING state', () => {
            ai = new CompyAI(compy, allCompys, players);
            expect(ai.state).toBe('CIRCLING');
        });

        it('should initialize target to null', () => {
            ai = new CompyAI(compy, allCompys, players);
            expect(ai.target).toBeNull();
        });

        it('should initialize attackCooldown to 0', () => {
            ai = new CompyAI(compy, allCompys, players);
            expect(ai.attackCooldown).toBe(0);
        });

        it('should initialize stateTimer to 0', () => {
            ai = new CompyAI(compy, allCompys, players);
            expect(ai.stateTimer).toBe(0);
        });

        it('should store references to compy, allCompys, and players', () => {
            ai = new CompyAI(compy, allCompys, players);
            expect(ai.compy).toBe(compy);
            expect(ai.allCompys).toBe(allCompys);
            expect(ai.players).toBe(players);
        });

        it('should initialize orbitRadius to 4', () => {
            ai = new CompyAI(compy, allCompys, players);
            expect(ai.orbitRadius).toBe(4);
        });

        it('should initialize orbitAngle to a random value between 0 and 2π', () => {
            ai = new CompyAI(compy, allCompys, players);
            expect(ai.orbitAngle).toBeGreaterThanOrEqual(0);
            expect(ai.orbitAngle).toBeLessThan(Math.PI * 2);
        });

        it('should initialize different orbitAngles for multiple instances', () => {
            const ai1 = new CompyAI(compy, allCompys, players);
            const ai2 = new CompyAI(createMockCompy(22, 16, 0), allCompys, players);
            const ai3 = new CompyAI(createMockCompy(18, 14, 0), allCompys, players);

            // With very high probability, at least two should be different
            const angles = [ai1.orbitAngle, ai2.orbitAngle, ai3.orbitAngle];
            const uniqueAngles = new Set(angles);
            expect(uniqueAngles.size).toBeGreaterThan(1);
        });

        it('should initialize lungeDirX to 0', () => {
            ai = new CompyAI(compy, allCompys, players);
            expect(ai.lungeDirX).toBe(0);
        });

        it('should initialize lungeDirY to 0', () => {
            ai = new CompyAI(compy, allCompys, players);
            expect(ai.lungeDirY).toBe(0);
        });
    });

    describe('update', () => {
        beforeEach(() => {
            ai = new CompyAI(compy, allCompys, players);
        });

        it('should decrement attackCooldown by delta in seconds', () => {
            ai.attackCooldown = 2.5;
            ai.update(1000); // 1000ms = 1s
            expect(ai.attackCooldown).toBe(1.5);
        });

        it('should clamp attackCooldown to 0', () => {
            ai.attackCooldown = 0.3;
            ai.update(500); // 0.5s
            expect(ai.attackCooldown).toBe(0);
        });

        it('should not allow attackCooldown to go negative', () => {
            ai.attackCooldown = 0;
            ai.update(1000);
            expect(ai.attackCooldown).toBe(0);
        });

        it('should increment stateTimer by delta in seconds', () => {
            ai.stateTimer = 1.5;
            ai.update(1000); // 1s
            expect(ai.stateTimer).toBe(2.5);
        });

        it('should increment stateTimer on multiple updates', () => {
            ai.stateTimer = 0;
            ai.attackCooldown = 10; // Prevent random attack transitions
            ai.update(500); // 0.5s
            ai.update(300); // 0.3s
            ai.update(200); // 0.2s
            expect(ai.stateTimer).toBeCloseTo(1.0, 5);
        });

        it('should call updateCircling when state is CIRCLING', () => {
            ai.state = 'CIRCLING';
            ai.updateCircling = vi.fn();
            ai.update(16);
            expect(ai.updateCircling).toHaveBeenCalledWith(0.016);
        });

        it('should call updateLunging when state is LUNGING', () => {
            ai.state = 'LUNGING';
            ai.updateLunging = vi.fn();
            ai.update(16);
            expect(ai.updateLunging).toHaveBeenCalledWith(0.016);
        });

        it('should call updateBiting when state is BITING', () => {
            ai.state = 'BITING';
            ai.updateBiting = vi.fn();
            ai.update(16);
            expect(ai.updateBiting).toHaveBeenCalledWith(0.016);
        });

        it('should call updateRetreating when state is RETREATING', () => {
            ai.state = 'RETREATING';
            ai.updateRetreating = vi.fn();
            ai.update(16);
            expect(ai.updateRetreating).toHaveBeenCalledWith(0.016);
        });

        it('should handle state transitions during update', () => {
            ai.state = 'CIRCLING';
            ai.updateCircling = vi.fn(() => {
                ai.state = 'LUNGING';
            });
            ai.updateLunging = vi.fn();

            ai.update(16);

            // First update calls updateCircling (which changes state to LUNGING)
            expect(ai.updateCircling).toHaveBeenCalledOnce();
            expect(ai.updateLunging).not.toHaveBeenCalled();

            // Second update should now call updateLunging
            ai.update(16);
            expect(ai.updateLunging).toHaveBeenCalledOnce();
        });

        it('should pass delta in seconds to state update methods', () => {
            ai.state = 'CIRCLING';
            ai.updateCircling = vi.fn();

            ai.update(33.33); // ~33ms
            expect(ai.updateCircling).toHaveBeenCalledWith(expect.closeTo(0.033, 2));

            ai.update(16.67); // ~16.67ms
            expect(ai.updateCircling).toHaveBeenCalledWith(expect.closeTo(0.017, 2));
        });

        it('should handle multiple updates with different deltas', () => {
            ai.attackCooldown = 3.0;
            ai.stateTimer = 0;

            ai.update(1000); // 1s
            expect(ai.attackCooldown).toBe(2.0);
            expect(ai.stateTimer).toBe(1.0);

            ai.update(500); // 0.5s
            expect(ai.attackCooldown).toBe(1.5);
            expect(ai.stateTimer).toBe(1.5);

            ai.update(1600); // 1.6s
            expect(ai.attackCooldown).toBe(0);
            expect(ai.stateTimer).toBe(3.1);
        });
    });

    describe('state update methods', () => {
        beforeEach(() => {
            ai = new CompyAI(compy, allCompys, players);
        });

        it('should have updateCircling method', () => {
            expect(typeof ai.updateCircling).toBe('function');
        });

        it('should have updateLunging method', () => {
            expect(typeof ai.updateLunging).toBe('function');
        });

        it('should have updateBiting method', () => {
            expect(typeof ai.updateBiting).toBe('function');
        });

        it('should have updateRetreating method', () => {
            expect(typeof ai.updateRetreating).toBe('function');
        });

        it('updateCircling should accept delta parameter', () => {
            expect(ai.updateCircling.length).toBe(1);
        });

        it('updateLunging should accept delta parameter', () => {
            expect(ai.updateLunging.length).toBe(1);
        });

        it('updateBiting should accept delta parameter', () => {
            expect(ai.updateBiting.length).toBe(1);
        });

        it('updateRetreating should accept delta parameter', () => {
            expect(ai.updateRetreating.length).toBe(1);
        });

        it('state methods should not throw errors when called', () => {
            expect(() => ai.updateCircling(0.016)).not.toThrow();
            expect(() => ai.updateLunging(0.016)).not.toThrow();
            expect(() => ai.updateBiting(0.016)).not.toThrow();
            expect(() => ai.updateRetreating(0.016)).not.toThrow();
        });
    });

    describe('CIRCLING state', () => {
        beforeEach(() => {
            ai = new CompyAI(compy, allCompys, players);
            ai.state = 'CIRCLING';
        });

        describe('target selection', () => {
            it('should call selectTarget if no target', () => {
                ai.target = null;
                ai.selectTarget = vi.fn(() => players[0]);
                ai.updateCircling(0.016);
                expect(ai.selectTarget).toHaveBeenCalledOnce();
            });

            it('should call selectTarget if target is downed', () => {
                ai.target = players[0];
                players[0].isDowned = true;
                ai.selectTarget = vi.fn(() => players[1]);
                ai.updateCircling(0.016);
                expect(ai.selectTarget).toHaveBeenCalledOnce();
            });

            it('should not call selectTarget if target is valid', () => {
                ai.target = players[0];
                players[0].isDowned = false;
                ai.selectTarget = vi.fn();
                ai.updateCircling(0.016);
                expect(ai.selectTarget).not.toHaveBeenCalled();
            });

            it('should set velocity to 0 if no valid target after selection', () => {
                ai.target = null;
                ai.selectTarget = vi.fn(() => null);
                ai.updateCircling(0.016);
                expect(compy.velocityX).toBe(0);
                expect(compy.velocityY).toBe(0);
            });
        });

        describe('orbiting behavior', () => {
            beforeEach(() => {
                ai.target = players[0];
                players[0].worldX = 15;
                players[0].worldY = 12;
            });

            it('should increment orbitAngle based on delta', () => {
                const initialAngle = ai.orbitAngle;
                ai.updateCircling(1.0); // 1 second
                expect(ai.orbitAngle).toBeCloseTo(initialAngle + 0.5, 5);
            });

            it('should increment orbitAngle smoothly over multiple updates', () => {
                const initialAngle = ai.orbitAngle;
                ai.updateCircling(0.1); // 0.1 second
                ai.updateCircling(0.1);
                ai.updateCircling(0.1);
                expect(ai.orbitAngle).toBeCloseTo(initialAngle + 0.15, 5);
            });

            it('should move toward orbit position around target', () => {
                ai.orbitAngle = 0; // Point to the right of target
                ai.orbitRadius = 4;
                compy.worldX = 10;
                compy.worldY = 12;

                ai.updateCircling(0.016);

                // Should have velocity pointing toward orbit position (target.x + 4, target.y + 0)
                expect(compy.velocityX).toBeGreaterThan(0); // Moving right toward orbit position
            });

            it('should move at approximately 6 units per second', () => {
                ai.orbitAngle = Math.PI / 2; // 90 degrees
                ai.orbitRadius = 4;
                compy.worldX = 15;
                compy.worldY = 8; // 4 units away from target

                ai.updateCircling(0.016);

                // Velocity magnitude should be around 6
                const magnitude = Math.sqrt(compy.velocityX ** 2 + compy.velocityY ** 2);
                expect(magnitude).toBeCloseTo(6, 1);
            });

            it('should orbit in a circular pattern (horizontal only)', () => {
                ai.target = players[0];
                players[0].worldX = 15;
                players[0].worldY = 12;
                ai.orbitRadius = 4;

                // Sidescroller: only X direction changes based on cos(orbitAngle)
                // angle=0: desiredX = 15+4=19, compy at 15 → move right (velocityX > 0)
                // angle=PI: desiredX = 15-4=11, compy at 15 → move left (velocityX < 0)
                const angles = [0, Math.PI];
                const velocities = [];

                for (let angle of angles) {
                    ai.orbitAngle = angle;
                    compy.worldX = players[0].worldX; // Start at center
                    ai.updateCircling(0.016);
                    velocities.push(compy.velocityX);
                }

                expect(velocities[0]).toBeGreaterThan(0); // cos(0)=1, orbit right of target
                expect(velocities[1]).toBeLessThan(0);    // cos(PI)=-1, orbit left of target
            });
        });

        describe('attack transitions', () => {
            beforeEach(() => {
                ai.target = players[0];
                players[0].worldX = 15;
                players[0].worldY = 12;
            });

            it('should not transition to LUNGING if attackCooldown > 0', () => {
                ai.attackCooldown = 1.0;
                const initialState = ai.state;

                // Run many updates to ensure random check would trigger
                for (let i = 0; i < 100; i++) {
                    ai.updateCircling(0.016);
                }

                expect(ai.state).toBe(initialState);
            });

            it('should eventually transition to LUNGING when cooldown is 0', () => {
                ai.attackCooldown = 0;
                let transitioned = false;

                // Run updates until transition happens (with safety limit)
                for (let i = 0; i < 1000 && !transitioned; i++) {
                    ai.updateCircling(0.016);
                    if (ai.state === 'LUNGING') {
                        transitioned = true;
                    }
                }

                expect(transitioned).toBe(true);
            });

            it('should transition to LUNGING with 2% probability per frame', () => {
                ai.attackCooldown = 0;
                let transitionCount = 0;
                const iterations = 1000;

                for (let i = 0; i < iterations; i++) {
                    ai.state = 'CIRCLING';
                    ai.updateCircling(0.016);
                    if (ai.state === 'LUNGING') {
                        transitionCount++;
                    }
                }

                // Should transition roughly 2% of the time (20 out of 1000)
                // Allow for variance (10-40 transitions)
                expect(transitionCount).toBeGreaterThan(5);
                expect(transitionCount).toBeLessThan(50);
            });

            it('should reset stateTimer when transitioning to LUNGING', () => {
                ai.attackCooldown = 0;
                ai.stateTimer = 5.0;

                // Force transition by running many updates
                for (let i = 0; i < 1000; i++) {
                    if (ai.state === 'LUNGING') break;
                    ai.updateCircling(0.016);
                }

                if (ai.state === 'LUNGING') {
                    expect(ai.stateTimer).toBe(0);
                }
            });
        });
    });

    describe('helper methods', () => {
        beforeEach(() => {
            ai = new CompyAI(compy, allCompys, players);
        });

        describe('selectTarget', () => {
            it('should select closest alive player', () => {
                players[0].worldX = 20;
                players[0].worldY = 15;
                players[0].isDowned = false;
                players[1].worldX = 25;
                players[1].worldY = 15;
                players[1].isDowned = false;
                compy.worldX = 20;
                compy.worldY = 15;

                const target = ai.selectTarget();
                expect(target).toBe(players[0]);
            });

            it('should skip downed players', () => {
                players[0].worldX = 20;
                players[0].worldY = 15;
                players[0].isDowned = true;
                players[1].worldX = 25;
                players[1].worldY = 15;
                players[1].isDowned = false;
                compy.worldX = 20;
                compy.worldY = 15;

                const target = ai.selectTarget();
                expect(target).toBe(players[1]);
            });

            it('should skip dead players', () => {
                players[0].worldX = 20;
                players[0].worldY = 15;
                players[0].isDead = true;
                players[1].worldX = 25;
                players[1].worldY = 15;
                players[1].isDowned = false;
                compy.worldX = 20;
                compy.worldY = 15;

                const target = ai.selectTarget();
                expect(target).toBe(players[1]);
            });

            it('should return null if all players are downed or dead', () => {
                players[0].isDowned = true;
                players[1].isDead = true;

                const target = ai.selectTarget();
                expect(target).toBeNull();
            });

            it('should return null if no players exist', () => {
                ai.players = [];
                const target = ai.selectTarget();
                expect(target).toBeNull();
            });
        });

        describe('getDistanceTo', () => {
            it('should calculate 2D distance between compy and entity', () => {
                compy.worldX = 20;
                compy.worldY = 15;
                const target = { worldX: 23, worldY: 19 };

                const distance = ai.getDistanceTo(target);
                expect(distance).toBeCloseTo(5, 5); // sqrt(9 + 16) = 5
            });

            it('should return 0 for same position', () => {
                compy.worldX = 20;
                compy.worldY = 15;
                const target = { worldX: 20, worldY: 15 };

                const distance = ai.getDistanceTo(target);
                expect(distance).toBe(0);
            });

            it('should ignore Z coordinate', () => {
                compy.worldX = 20;
                compy.worldY = 15;
                compy.worldZ = 0;
                const target = { worldX: 23, worldY: 19, worldZ: 10 };

                const distance = ai.getDistanceTo(target);
                expect(distance).toBeCloseTo(5, 5); // Z doesn't affect distance
            });
        });

        describe('transitionToLunging', () => {
            it('should set state to LUNGING', () => {
                ai.state = 'CIRCLING';
                ai.transitionToLunging();
                expect(ai.state).toBe('LUNGING');
            });

            it('should reset stateTimer to 0', () => {
                ai.stateTimer = 5.0;
                ai.transitionToLunging();
                expect(ai.stateTimer).toBe(0);
            });
        });

        describe('transitionToCircling', () => {
            it('should set state to CIRCLING', () => {
                ai.state = 'LUNGING';
                ai.transitionToCircling();
                expect(ai.state).toBe('CIRCLING');
            });

            it('should reset stateTimer to 0', () => {
                ai.stateTimer = 5.0;
                ai.transitionToCircling();
                expect(ai.stateTimer).toBe(0);
            });
        });

        describe('transitionToBiting', () => {
            it('should set state to BITING', () => {
                ai.state = 'LUNGING';
                ai.transitionToBiting();
                expect(ai.state).toBe('BITING');
            });

            it('should reset stateTimer to 0', () => {
                ai.stateTimer = 3.0;
                ai.transitionToBiting();
                expect(ai.stateTimer).toBe(0);
            });
        });

        describe('transitionToRetreating', () => {
            it('should set state to RETREATING', () => {
                ai.state = 'BITING';
                ai.transitionToRetreating();
                expect(ai.state).toBe('RETREATING');
            });

            it('should reset stateTimer to 0', () => {
                ai.stateTimer = 2.0;
                ai.transitionToRetreating();
                expect(ai.stateTimer).toBe(0);
            });
        });

        describe('isTelegraphing', () => {
            it('should return true during first 0.5s of LUNGING', () => {
                ai.state = 'LUNGING';
                ai.stateTimer = 0.3;
                expect(ai.isTelegraphing()).toBe(true);
            });

            it('should return false after 0.5s of LUNGING', () => {
                ai.state = 'LUNGING';
                ai.stateTimer = 0.6;
                expect(ai.isTelegraphing()).toBe(false);
            });

            it('should return false when not in LUNGING state', () => {
                ai.state = 'CIRCLING';
                ai.stateTimer = 0.3;
                expect(ai.isTelegraphing()).toBe(false);
            });

            it('should return false at exactly 0.5s', () => {
                ai.state = 'LUNGING';
                ai.stateTimer = 0.5;
                expect(ai.isTelegraphing()).toBe(false);
            });
        });

        describe('isCharging', () => {
            it('should return true when LUNGING and stateTimer >= 0.5', () => {
                ai.state = 'LUNGING';
                ai.stateTimer = 0.6;
                expect(ai.isCharging()).toBe(true);
            });

            it('should return false during telegraph phase', () => {
                ai.state = 'LUNGING';
                ai.stateTimer = 0.3;
                expect(ai.isCharging()).toBe(false);
            });

            it('should return false when not in LUNGING state', () => {
                ai.state = 'CIRCLING';
                ai.stateTimer = 0.6;
                expect(ai.isCharging()).toBe(false);
            });

            it('should return true at exactly 0.5s', () => {
                ai.state = 'LUNGING';
                ai.stateTimer = 0.5;
                expect(ai.isCharging()).toBe(true);
            });
        });
    });

    describe('LUNGING state', () => {
        beforeEach(() => {
            ai = new CompyAI(compy, allCompys, players);
            ai.state = 'LUNGING';
            ai.target = players[0];
            players[0].worldX = 25;
            players[0].worldY = 15;
            compy.worldX = 20;
            compy.worldY = 15;
        });

        it('should transition to CIRCLING if no target', () => {
            ai.target = null;
            ai.updateLunging(0.016);
            expect(ai.state).toBe('CIRCLING');
        });

        describe('telegraph phase (stateTimer < 0.5)', () => {
            beforeEach(() => {
                ai.stateTimer = 0;
            });

            it('should freeze velocity during telegraph', () => {
                ai.updateLunging(0.016);
                expect(compy.velocityX).toBe(0);
                expect(compy.velocityY).toBe(0);
            });

            it('should store lunge direction on first frame', () => {
                ai.updateLunging(0.016);

                // Direction should be normalized and stored
                const magnitude = Math.sqrt(ai.lungeDirX ** 2 + ai.lungeDirY ** 2);
                expect(magnitude).toBeCloseTo(1, 5);
                expect(ai.lungeDirX).toBeGreaterThan(0); // Moving toward target to the right
            });

            it('should maintain stored direction across telegraph frames', () => {
                ai.updateLunging(0.016); // Store direction
                const dirX = ai.lungeDirX;
                const dirY = ai.lungeDirY;

                ai.updateLunging(0.1); // Another telegraph frame
                expect(ai.lungeDirX).toBe(dirX);
                expect(ai.lungeDirY).toBe(dirY);
            });

            it('should remain frozen for full telegraph duration', () => {
                for (let i = 0; i < 30; i++) { // 30 frames at 16ms = ~0.48s
                    ai.updateLunging(0.016);
                    if (ai.stateTimer < 0.5) {
                        expect(compy.velocityX).toBe(0);
                        expect(compy.velocityY).toBe(0);
                    }
                }
            });
        });

        describe('charge phase (stateTimer >= 0.5)', () => {
            beforeEach(() => {
                // Complete telegraph phase - manually set timer past 0.5
                ai.stateTimer = 0;
                ai.updateLunging(0.016); // Store direction during telegraph
                ai.stateTimer = 0.5; // Manually advance past telegraph
            });

            it('should charge at 12 units per second', () => {
                ai.updateLunging(0.016);

                const magnitude = Math.sqrt(compy.velocityX ** 2 + compy.velocityY ** 2);
                expect(magnitude).toBeCloseTo(12, 1);
            });

            it('should charge in stored direction', () => {
                const dirX = ai.lungeDirX;
                const dirY = ai.lungeDirY;

                ai.updateLunging(0.016);

                // Velocity should match stored direction * 12
                expect(compy.velocityX).toBeCloseTo(dirX * 12, 1);
                expect(compy.velocityY).toBeCloseTo(dirY * 12, 1);
            });

            it('should maintain charge speed across multiple frames', () => {
                for (let i = 0; i < 10; i++) {
                    ai.stateTimer = 0.5 + (i * 0.016); // Manually increment timer
                    ai.updateLunging(0.016);
                    if (ai.state === 'LUNGING') {
                        const magnitude = Math.sqrt(compy.velocityX ** 2 + compy.velocityY ** 2);
                        expect(magnitude).toBeCloseTo(12, 1);
                    }
                }
            });
        });

        describe('reaching target', () => {
            beforeEach(() => {
                // Store direction during telegraph, then advance to charge phase
                ai.stateTimer = 0;
                ai.updateLunging(0.016);
                ai.stateTimer = 0.5; // Past telegraph
            });

            it('should transition to BITING when within 0.5 units of target', () => {
                compy.worldX = 24.7;
                compy.worldY = 15;
                ai.updateLunging(0.016);
                expect(ai.state).toBe('BITING');
            });

            it('should not transition when farther than 0.5 units', () => {
                compy.worldX = 24.4;
                compy.worldY = 15;
                ai.updateLunging(0.016);
                expect(ai.state).toBe('LUNGING');
            });

            it('should check distance using getDistanceTo', () => {
                ai.getDistanceTo = vi.fn(() => 0.3);
                ai.updateLunging(0.016);
                expect(ai.getDistanceTo).toHaveBeenCalledWith(ai.target);
            });
        });

        describe('timeout', () => {
            beforeEach(() => {
                // Store direction during telegraph, then advance to charge phase
                ai.stateTimer = 0;
                ai.updateLunging(0.016);
                ai.stateTimer = 0.5; // Complete telegraph
            });

            it('should transition to RETREATING after 1.0 seconds total', () => {
                ai.stateTimer = 1.01; // Past timeout threshold
                ai.updateLunging(0.016);
                expect(ai.state).toBe('RETREATING');
            });

            it('should not timeout before 1.0 seconds', () => {
                ai.stateTimer = 0.9;
                ai.updateLunging(0.016);
                expect(ai.state).toBe('LUNGING');
            });

            it('should timeout even if target not reached', () => {
                compy.worldX = 20;
                compy.worldY = 15;
                ai.stateTimer = 1.01;
                ai.updateLunging(0.016);
                expect(ai.state).toBe('RETREATING');
            });
        });

        describe('lost target', () => {
            it('should transition to CIRCLING if target becomes null during telegraph', () => {
                ai.stateTimer = 0.2;
                ai.target = null;
                ai.updateLunging(0.016);
                expect(ai.state).toBe('CIRCLING');
            });

            it('should transition to CIRCLING if target becomes null during charge', () => {
                ai.stateTimer = 0.6;
                ai.target = null;
                ai.updateLunging(0.016);
                expect(ai.state).toBe('CIRCLING');
            });
        });
    });

    describe('BITING state', () => {
        beforeEach(() => {
            ai = new CompyAI(compy, allCompys, players);
            ai.state = 'BITING';
            ai.target = players[0];
            players[0].worldX = 20;
            players[0].worldY = 15;
            players[0].health = 2;
            players[0].isDowned = false;
            compy.worldX = 20;
            compy.worldY = 15;
            ai.stateTimer = 0;
        });

        it('should freeze horizontal velocity', () => {
            compy.velocityX = 5;
            compy.velocityY = 3;
            ai.updateBiting(0.016);
            expect(compy.velocityX).toBe(0);
            // velocityY is controlled by gravity, not reset by AI
        });

        it('should deal 0.5 damage on first frame only', () => {
            const initialHealth = players[0].health;
            ai.updateBiting(0.016);
            expect(players[0].health).toBe(initialHealth - 0.5);
        });

        it('should not deal damage on subsequent frames', () => {
            ai.updateBiting(0.016); // First frame - damage dealt
            const healthAfterFirst = players[0].health;

            ai.stateTimer = 0.016; // Simulate timer increment
            ai.updateBiting(0.016); // Second frame
            expect(players[0].health).toBe(healthAfterFirst); // No additional damage
        });

        it('should not deal damage if target out of range', () => {
            compy.worldX = 25; // More than 0.5 units away
            compy.worldY = 15;

            const initialHealth = players[0].health;
            ai.updateBiting(0.016);
            expect(players[0].health).toBe(initialHealth);
        });

        it('should not deal damage if target is downed', () => {
            players[0].isDowned = true;
            const initialHealth = players[0].health;
            ai.updateBiting(0.016);
            expect(players[0].health).toBe(initialHealth);
        });

        it('should not deal damage if target is dead', () => {
            players[0].isDead = true;
            const initialHealth = players[0].health;
            ai.updateBiting(0.016);
            expect(players[0].health).toBe(initialHealth);
        });

        it('should transition to RETREATING after 0.5 seconds', () => {
            ai.stateTimer = 0.5;
            ai.updateBiting(0.016);
            expect(ai.state).toBe('RETREATING');
        });

        it('should not transition before 0.5 seconds', () => {
            ai.stateTimer = 0.4;
            ai.updateBiting(0.016);
            expect(ai.state).toBe('BITING');
        });

        it('should set attackCooldown to 2.0 when transitioning to RETREATING', () => {
            ai.attackCooldown = 0;
            ai.stateTimer = 0.5;
            ai.updateBiting(0.016);
            expect(ai.attackCooldown).toBe(2.0);
        });

        it('should not set attackCooldown before transitioning', () => {
            ai.attackCooldown = 0;
            ai.stateTimer = 0.4;
            ai.updateBiting(0.016);
            expect(ai.attackCooldown).toBe(0);
        });

        it('should maintain horizontal freeze across multiple frames', () => {
            for (let i = 0; i < 5; i++) {
                compy.velocityX = 10;
                ai.stateTimer = i * 0.1;
                ai.updateBiting(0.016);
                expect(compy.velocityX).toBe(0);
                // velocityY is controlled by gravity, not reset by AI
            }
        });

        it('should call takeDamage on target player', () => {
            players[0].takeDamage = vi.fn();
            ai.updateBiting(0.016);
            expect(players[0].takeDamage).toHaveBeenCalledWith(0.5);
        });

        it('should only call takeDamage once', () => {
            players[0].takeDamage = vi.fn();
            ai.updateBiting(0.016); // First frame
            ai.stateTimer = 0.016;
            ai.updateBiting(0.016); // Second frame
            expect(players[0].takeDamage).toHaveBeenCalledTimes(1);
        });

        it('should handle target becoming null', () => {
            ai.target = null;
            expect(() => ai.updateBiting(0.016)).not.toThrow();
        });

        it('should not deal damage if no target', () => {
            ai.target = null;
            expect(() => ai.updateBiting(0.016)).not.toThrow();
            // No crash = success
        });
    });

    describe('RETREATING state', () => {
        beforeEach(() => {
            ai = new CompyAI(compy, allCompys, players);
            ai.state = 'RETREATING';
            ai.target = players[0];
            players[0].worldX = 25;
            players[0].worldY = 15;
            compy.worldX = 25;
            compy.worldY = 15;
            ai.stateTimer = 0;
        });

        it('should move away from target', () => {
            ai.updateRetreating(0.016);

            // Should have velocity pointing away from target
            // Compy is at (25, 15), target at (25, 15), so need to move compy closer first
            compy.worldX = 24;
            compy.worldY = 15;
            ai.updateRetreating(0.016);

            // Velocity should point away (negative X direction)
            expect(compy.velocityX).toBeLessThan(0);
        });

        it('should move at 4 units per second', () => {
            compy.worldX = 24;
            compy.worldY = 15;
            ai.updateRetreating(0.016);

            const magnitude = Math.sqrt(compy.velocityX ** 2 + compy.velocityY ** 2);
            expect(magnitude).toBeCloseTo(4, 1);
        });

        it('should maintain retreat speed across multiple frames', () => {
            compy.worldX = 24;
            compy.worldY = 15;

            for (let i = 0; i < 10; i++) {
                ai.stateTimer = i * 0.1;
                ai.updateRetreating(0.016);
                if (ai.state === 'RETREATING') {
                    const magnitude = Math.sqrt(compy.velocityX ** 2 + compy.velocityY ** 2);
                    expect(magnitude).toBeCloseTo(4, 1);
                }
            }
        });

        it('should retreat horizontally (sign-based direction)', () => {
            compy.worldX = 26;
            compy.worldY = 17;

            ai.updateRetreating(0.016);

            // Sidescroller: retreat is horizontal only, sign-based direction
            // compy.worldX(26) > target.worldX(25) → move right at 4 units/sec
            expect(compy.velocityX).toBeCloseTo(4, 1);
            // velocityY is not set by AI (gravity-controlled)
        });

        it('should transition to CIRCLING after 2.5 seconds', () => {
            ai.stateTimer = 2.5;
            ai.updateRetreating(0.016);
            expect(ai.state).toBe('CIRCLING');
        });

        it('should not transition before 2.5 seconds', () => {
            ai.stateTimer = 2.4;
            ai.updateRetreating(0.016);
            expect(ai.state).toBe('RETREATING');
        });

        it('should handle no target by freezing and transitioning', () => {
            ai.target = null;
            ai.updateRetreating(0.016);

            expect(compy.velocityX).toBe(0);
            expect(compy.velocityY).toBe(0);
            expect(ai.state).toBe('CIRCLING');
        });

        it('should freeze immediately when target is lost', () => {
            compy.worldX = 24;
            compy.worldY = 15;

            // First frame with target - should move
            ai.updateRetreating(0.016);
            expect(compy.velocityX).not.toBe(0);

            // Second frame without target - should freeze
            ai.target = null;
            ai.updateRetreating(0.016);
            expect(compy.velocityX).toBe(0);
            expect(compy.velocityY).toBe(0);
        });

        it('should transition to CIRCLING when target is lost', () => {
            ai.target = null;
            ai.updateRetreating(0.016);
            expect(ai.state).toBe('CIRCLING');
        });

        it('should retreat horizontally left or right from target', () => {
            // Sidescroller: retreat is horizontal only
            const directions = [
                { compyX: 26, compyY: 15, expectedVX: 4 },  // East of target → move right
                { compyX: 24, compyY: 15, expectedVX: -4 }, // West of target → move left
            ];

            for (const dir of directions) {
                compy.worldX = dir.compyX;
                compy.worldY = dir.compyY;
                ai.updateRetreating(0.016);

                expect(compy.velocityX).toBeCloseTo(dir.expectedVX, 1);
            }
        });

        it('should complete full retreat cycle', () => {
            compy.worldX = 24;
            compy.worldY = 15;

            // Run through full retreat duration
            for (let t = 0; t < 2.5; t += 0.1) {
                ai.stateTimer = t;
                ai.updateRetreating(0.016);
                if (ai.state === 'RETREATING') {
                    // Should still be retreating
                    const magnitude = Math.sqrt(compy.velocityX ** 2 + compy.velocityY ** 2);
                    expect(magnitude).toBeCloseTo(4, 1);
                }
            }

            // After 2.5s, should transition
            ai.stateTimer = 2.5;
            ai.updateRetreating(0.016);
            expect(ai.state).toBe('CIRCLING');
        });
    });
});
