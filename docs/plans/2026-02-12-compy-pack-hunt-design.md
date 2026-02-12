# Compy Pack Hunt - Complete Design
**Date:** 2026-02-12
**Hunt:** First Hunt (Warm-up)
**Status:** Design Complete - Ready for Implementation

## Overview

**Hunt Name:** "The Pack Awakens"
**Duration:** 2 minutes (120 seconds target)
**Arena:** Dense Jungle (30×25 world units)
**Enemy Count:** 5 Compys (spawned simultaneously)
**Difficulty:** Very Easy (Warm-up/Tutorial)
**Tutorial Style:** Light touch - minimal prompts, learn by doing

### Objectives

**Primary Objective:** Defeat all 5 Compys

**Secondary Objectives (Bonus Points):**
- No player deaths (+50 pts to all)
- Defeat all within 90 seconds (+25 pts to all)
- Each player lands at least one hit (+10 pts individual)

**Victory Condition:** All 5 Compys defeated
**Failure Condition:** All players downed simultaneously (team mode) OR player loses all 3 lives (solo mode)

### Player Count Scaling

- **1 Player:** 5 Compys @ 100% health (20 HP each)
- **2 Players:** 5 Compys @ 120% health (24 HP each)
- **3 Players:** 5 Compys @ 130% health (26 HP each)
- **4 Players:** 5 Compys @ 140% health (28 HP each)

*Rationale: First hunt should be completable by anyone. Low health enemies teach "focus fire" strategy without punishment. Scaling ensures solo players aren't overwhelmed while 4-player teams still feel some challenge.*

---

## Dense Jungle Arena Layout

### Environment Features

- **6-8 large trees** (1.5 world unit radius each) providing hard cover
- **4-5 large fern clusters** (visual cover, doesn't block movement/attacks)
- **2-3 rock formations** (elevated platforms at Z=1.5)
- **Dappled lighting effects** (shadow pools from canopy)
- **Ambient sounds:** Jungle birds, rustling leaves (audio phase)

### Cover Mechanics

- Trees block line-of-sight for Compy targeting
- Trees block projectiles (spears stopped by collision)
- Players can hide behind trees to break aggro
- Rocks provide elevation advantage (ranged attacks easier from high ground)

### Strategic Layout

```
     [Tree]              [Rock]

  [Tree]    OPEN CENTER    [Ferns]
              (spawn)
        [Rock]      [Tree]

  [Ferns]              [Tree]
```

### Spawn Positions

**Players:** Center of arena (open area, 2×2 grid, 2 world units apart)

**Compys:** 5 positions around perimeter, evenly spaced (creates surround effect)
- North: 1 Compy
- East: 1 Compy
- South: 2 Compys (closer together, creates initial threat)
- West: 1 Compy

*Rationale: Players spawn together (encourages teamwork), Compys spawn around them (creates immediate tension). Cover is scattered but not overwhelming - players can use it but won't get lost.*

---

## Compy AI Behavior & Combat Mechanics

### Individual Compy Stats

- **Health:** 20-28 HP (based on player count scaling)
- **Move Speed:** 6 world units/second (equal to player hunt speed)
- **Attack Damage:** 0.5 hit points (4 hits to down a player)
- **Attack Range:** 0.5 world units (must be very close - melee)
- **Attack Cooldown:** 2 seconds between bites
- **Collision Radius:** 0.8 world units
- **Weak Point:** Full body (any hit counts, no precision required)

*Note: 0.5 damage chosen for warm-up hunt - forgiving while still teaching threat awareness.*

### AI State Machine (Per Compy)

#### 1. CIRCLING (Default state, 60% of time)
- Orbits target player at 3-5 world unit radius
- Constantly repositions to player's flanks/rear
- Watches for opening (other Compys attacking = opening)
- Speed: Normal (6 units/sec)

#### 2. LUNGING (Attack initiation, 1 second)
- **Telegraph (0.5s):** Compy crouches, hisses
  - Visual: Body glows red slightly, small dust kick-up
  - Audio: High-pitched hiss sound (audio phase)
- **Charge (0.5s):** Lunges forward at 12 units/sec toward player
- If player dodges (leaves 0.5 unit radius), attack misses

#### 3. BITING (Attack execution, 0.5 seconds)
- Quick snap animation
- Deals 0.5 damage if player in range
- Brief recovery (can't move for 0.3s)

#### 4. RETREATING (After attack or when injured, 2-3 seconds)
- Backs away 4-5 world units
- Returns to CIRCLING state
- Injured Compys (below 50% HP) retreat more often

---

## Compy Pack Coordination & Swarm Tactics

### Pack Behavior (Group-Level AI)

The 5 Compys share awareness and coordinate attacks using a simple pack mind system.

### Target Selection Rules

1. **Spread targets initially** - Each Compy picks different player at start
2. **Gang up on isolated players** - If a player is >5 world units from teammates, 2-3 Compys switch to them
3. **Punish low-health players** - If a player is at 1 HP (one hit from down), 2 Compys prioritize them
4. **Revenge targeting** - Compy that takes damage has 60% chance to switch to attacker

### Coordinated Attack Patterns

#### Pattern 1: "The Pincer" (2 Compys)
- One Compy attacks from front (draws attention)
- Second Compy lunges from behind simultaneously
- If player dodges front attack, likely to get hit from behind
- **Teaches:** Spatial awareness, don't tunnel vision

#### Pattern 2: "The Swarm" (3+ Compys)
- When player is isolated, 3 Compys circle at different angles
- They attack in sequence with 0.5s stagger (rapid succession)
- Creates pressure: dodge first, immediately dodge second, then third
- **Teaches:** Stay with team, kiting techniques

#### Pattern 3: "Hit and Run" (Single Compy)
- Last remaining Compy becomes more cautious
- Only attacks when player is distracted (shooting another target)
- Retreats immediately after bite
- **Teaches:** Track all enemies, don't ignore stragglers

---

## Hunt Intro Sequence & Flow

### Transition from Cave Bar (5 seconds total)

1. **Fade Out (1 sec)**
   - Cave bar fades to black
   - Text appears: "HUNT 1 of 5"
   - Subtitle: "The Pack Awakens"

2. **Arena Reveal (2 sec)**
   - Fade in to Dense Jungle arena
   - Camera pans across environment (shows trees, cover, atmosphere)
   - Ambient jungle sounds build (audio phase)

3. **Enemy Intro (2 sec)**
   - Camera cuts to rustling bushes at perimeter
   - 5 Compys emerge from different locations with hisses
   - Quick cut montage showing each spawn position
   - Dramatic music sting (audio phase)

4. **Players Ready (Immediate)**
   - Camera snaps to overhead isometric view
   - Players appear in center formation
   - HUD fades in (health bars, score, dinosaur health)
   - **No countdown** - Compys start circling immediately (light touch tutorial)

### Combat Phases

#### Phase 1: First Contact (0-30 seconds)
- All 5 Compys alive, circling behavior dominant
- Compys test players with single lunges
- Players learn: attack range, dodge timing, weak point hits
- Music: Low intensity, ominous drums (audio phase)

#### Phase 2: Pack Pressure (30-90 seconds)
- 2-4 Compys remaining
- Coordinated attacks increase (Pincer, Swarm patterns)
- Compys more aggressive as pack shrinks
- Music: Medium intensity, percussion builds (audio phase)

#### Phase 3: Last Stand (90+ seconds)
- 1 Compy left
- Hit-and-run behavior, uses cover aggressively
- Quick to finish if players focus, or drags if they're sloppy
- Music: High intensity chase theme (audio phase)

---

## Victory, Failure & Scoring

### Victory Sequence (5 seconds)

1. **Last Compy Defeated (1 sec)**
   - Slow-motion on killing blow (0.3s)
   - Compy collapses with dust cloud
   - Triumphant music sting (audio phase)

2. **Victory Celebration (2 sec)**
   - All players do synchronized victory pose
   - "HUNT COMPLETE!" text appears center screen
   - Firework particle effects

3. **Score Tally (2 sec)**
   - Individual scores fly in from sides
   - Damage dealt, perfect dodges, bonuses calculated
   - Current MVP crowned (gold highlight)
   - Completion bonuses added:
     - No Deaths: +50 pts (all players)
     - Under 90 seconds: +25 pts (all players)
     - Participation: +10 pts (if landed a hit)

### Scoring Breakdown

- **Damage dealt:** 1 pt per hit on Compy
- **Killing blow:** 10 pts (who got final hit on each Compy)
- **Perfect dodge:** 5 pts (dodge with <0.5s timing)
- **Teammate save:** 10 pts (reviving downed player)
- **Combo hits:** +20% if 2+ players hit same Compy within 2 sec

### Example Score (Solo Player, Good Performance)

- 25 hits landed = 25 pts
- 5 killing blows = 50 pts
- 3 perfect dodges = 15 pts
- No deaths bonus = 50 pts
- Speed bonus = 25 pts
- **Total: 165 pts** → Enough for 1 cocktail at cave bar

### Failure Sequence (if all players downed)

1. **Defeat Screen (3 sec)**
   - "HUNT FAILED!" text
   - Remaining Compys screech in victory
   - Somber music (audio phase)

2. **Retry Prompt (10 sec countdown)**
   - "Try Again? [Yes] / [No]"
   - Majority vote decides
   - If Yes: Restart same hunt, keep upgrades
   - If No: Return to cave bar, counts as 1 failure (3 total allowed per session)

---

## Transition Back to Cave Bar

### Post-Victory Flow (8 seconds total)

1. **Final Score Display (3 sec)**
   - Screen shows all 4 players side-by-side
   - Individual stats displayed:
     - Total damage dealt
     - Perfect dodges
     - Hits taken
     - MVP indicator (crown) on highest scorer
   - Players can see who contributed what

2. **Bartender Reaction (2 sec)**
   - Cut to bartender in cave bar
   - Reaction based on performance:
     - **Flawless (no hits taken):** Enthusiastic fist pump, "UGH! MIGHTY!"
     - **Victory (took damage):** Approving nod, "GOOD HUNT!"
     - **Close call (someone downed):** Concerned grunt, "HMMM... SURVIVE..."
   - Adds personality, builds bar atmosphere

3. **Trophy Wall Update (1 sec)**
   - Quick shot of trophy wall
   - Compy silhouette lights up with checkmark
   - "1 of 12 Defeated" counter updates

4. **Fade to Cave Bar (2 sec)**
   - Camera fades out from arena
   - Fades in to cave bar entrance
   - Players walk in through entrance (staggered timing)
   - 30-second timer starts immediately
   - Session state saved: Hunt 1 complete, Compy defeated

### Session State Persistence

- Player scores carried forward
- Purchased weapons/abilities persist
- Cocktail buffs expire (consumed during hunt)
- Hunt progress: 1/5 complete
- Next hunt unlocked: Hunt 2 (Triceratops or Stegosaurus)

---

## Technical Implementation

### New/Modified Systems

#### 1. HuntScene.js (New - replaces TestScene for production)
- Extends Phaser.Scene
- Manages hunt lifecycle: intro → combat → victory/failure
- Spawns players and dinosaurs based on session state
- Handles transitions to/from CaveBarScene
- Integrates with SessionManager for persistence

#### 2. CompyAI.js (New AI controller)

```javascript
class CompyAI {
  constructor(compy, allCompys, players) {
    this.compy = compy;
    this.packMembers = allCompys; // Share pack awareness
    this.players = players;
    this.state = 'CIRCLING';
    this.target = null;
    this.attackCooldown = 0;
  }

  update(delta) {
    // State machine: CIRCLING → LUNGING → BITING → RETREATING
    switch(this.state) {
      case 'CIRCLING':
        this.updateCircling(delta);
        break;
      case 'LUNGING':
        this.updateLunging(delta);
        break;
      case 'BITING':
        this.updateBiting(delta);
        break;
      case 'RETREATING':
        this.updateRetreating(delta);
        break;
    }
  }

  updateCircling(delta) {
    // Select/update target based on pack coordinator input
    // Orbit target at 3-5 unit radius
    // Check for attack opportunity (coordinator permission)
    // Transition to LUNGING when ready
  }

  updateLunging(delta) {
    // Telegraph phase (0.5s): crouch, glow red
    // Charge phase (0.5s): rush at 12 units/sec
    // Check if player dodged (left radius)
    // Transition to BITING or RETREATING
  }

  updateBiting(delta) {
    // Snap animation (0.5s)
    // Deal 0.5 damage if player in range
    // Brief recovery (0.3s cannot move)
    // Transition to RETREATING
  }

  updateRetreating(delta) {
    // Back away 4-5 units
    // Duration: 2-3 seconds
    // Return to CIRCLING
  }

  selectTarget() {
    // Pack coordination logic:
    // 1. Check for isolated players (>5 units from team)
    // 2. Check for low-health players (1 HP)
    // 3. Check for revenge target (attacked this Compy)
    // 4. Otherwise spread targets evenly
  }
}
```

#### 3. PackCoordinator.js (New - manages 5 Compys as group)

```javascript
class PackCoordinator {
  constructor(compys, players) {
    this.compys = compys;
    this.players = players;
    this.attackQueue = []; // Schedules coordinated attacks
  }

  update(delta) {
    // Analyze player positions
    // Identify isolated targets
    // Identify low-health targets
    // Queue coordinated attacks (Pincer, Swarm patterns)
    // Execute attack timing (stagger lunges by 0.5s)
  }

  scheduleCoordinatedAttack(pattern, target) {
    // Pattern: 'PINCER', 'SWARM', 'HIT_AND_RUN'
    // Assigns Compys to roles and timing
    // Example Pincer:
    //   - Compy A: Attack from front at T=0s
    //   - Compy B: Attack from behind at T=0s
  }

  getAttackPermission(compy) {
    // Returns true if this Compy should attack now
    // Enforces coordination patterns
    // Prevents all 5 attacking simultaneously (too chaotic)
  }
}
```

### Modified Existing Systems

**Dinosaur.js:**
- Add Compy-specific stats (health, speed, damage)
- Add support for pack coordination (reference to PackCoordinator)

**CombatSystem.js:**
- Support 0.5 damage (fractional health)
- Track coordinated attack bonuses

**SessionManager.js:**
- Track defeated dinosaurs (Compy checkmark on trophy wall)
- Persist hunt progress (1/5 complete)

---

## Asset Requirements

### Compy Visual Assets

**Sprite Sheets (Pixel Art):**
- Compy character base (8 directions: N, NE, E, SE, S, SW, W, NW)
- Size: ~32×32 pixels per frame (small enemy)
- Color: Green-brown scales, yellow eyes

**Animations (per direction):**

1. **Idle** (4 frames, 6 fps, loop)
   - Breathing, slight head movement
   - Tail sway

2. **Running** (6 frames, 12 fps, loop)
   - Quick scurrying motion
   - Low to ground, agile

3. **Lunge Telegraph** (2 frames, 8 fps, no loop)
   - Crouch/wind-up
   - Red glow overlay added programmatically

4. **Bite Attack** (4 frames, 16 fps, no loop)
   - Snap forward
   - Jaws open→close

5. **Retreat** (4 frames, 10 fps, no loop)
   - Backward hop
   - Defensive posture

6. **Death** (6 frames, 12 fps, no loop)
   - Collapse
   - Dust cloud particle effect
   - Fade out

**Total Frames:** 8 directions × 26 frames = 208 frames
**Estimated Size:** Single sprite sheet ~2048×2048 with atlas JSON

**Generation Method:** Use PixelLab MCP to generate Compy character with animations

### Dense Jungle Arena Assets

**Tiles (Isometric):**
- Grass floor tile (128×64 base)
- Dirt path variation
- Leaf litter accents

**Props:**
- Large tree trunk (3 variations for variety)
- Fern cluster sprites (2-3 sizes)
- Rock formation (small/medium/large)
- Hanging vines (decorative)

**Generation Method:** Use PixelLab MCP isometric tile tool

---

## Implementation Phases

### Phase 3.1: Compy Hunt Foundation (Week 1)

**Day 1-2: Arena Setup**
- Create DenseJungleArena.js (or add to HuntScene)
- Build floor grid with grass tiles
- Place 6-8 tree props with collision
- Add rock formations (platforms at Z=1.5)
- Test player movement and line-of-sight blocking

**Day 3-4: Compy Entity & Basic AI**
- Extend Dinosaur.js for Compy type
- Implement CIRCLING state (orbit player at 3-5 unit radius)
- Add basic collision detection (Compy vs Player)
- Spawn 5 Compys at perimeter positions
- Test: Compys circle but don't attack yet

**Day 5-7: Attack AI**
- Implement LUNGING state (telegraph + charge)
- Implement BITING state (damage on contact)
- Implement RETREATING state (back away)
- Add 0.5 damage per bite
- Test: Single Compy can attack and down player

**Milestone:** Basic hunt playable with 5 non-coordinated Compys

### Phase 3.2: Pack Coordination (Week 2)

**Day 8-10: PackCoordinator System**
- Create PackCoordinator.js
- Implement target selection (isolated, low-health priority)
- Implement "Pincer" pattern (2 Compys, front+back)
- Implement "Swarm" pattern (3 Compys, rapid succession)
- Test: Coordinated attacks feel challenging but fair

**Day 11-12: Polish & Balance**
- Tune Compy speed, attack timing
- Adjust health scaling for 1-4 players
- Test with different player counts
- Verify 2-minute target completion time

**Milestone:** Pack tactics working, hunt feels complete

### Phase 3.3: Hunt Flow & Transitions (Week 3)

**Day 13-14: Intro Sequence**
- Create hunt intro cinematic (camera pan, Compy reveals)
- Add "HUNT 1 of 5" title card
- Smooth transition from CaveBarScene
- HUD fade-in

**Day 15-16: Victory/Failure**
- Victory sequence (score tally, celebration)
- Failure sequence (retry prompt)
- SessionManager integration (save hunt progress)
- Trophy wall update

**Day 17-18: Cave Bar Return**
- Transition back to CaveBarScene
- Bartender reaction based on performance
- Score persistence
- Test full loop: Cave Bar → Hunt → Cave Bar

**Milestone:** Complete hunt cycle working end-to-end

### Phase 3.4: Visual Assets (Week 4 - Parallel Track)

This can happen alongside Phase 3.1-3.3 using placeholder art:

**Compy Sprites:**
- Generate via PixelLab MCP (you have access!)
- 8 directional rotations
- 6 animation sets per direction
- Build sprite sheet with scripts/build-spritesheets.js

**Arena Assets:**
- Generate jungle tiles via PixelLab isometric tile tool
- Generate tree/rock props
- Integrate into DenseJungleArena

**Milestone:** Production-quality visuals replace placeholders

---

## Total Timeline

**3-4 weeks for complete Compy Pack hunt**

---

## Testing Checklist

### Functional Testing

- [ ] 5 Compys spawn at correct perimeter positions
- [ ] Compys orbit players in CIRCLING state
- [ ] Telegraph is visible (0.5s crouch + red glow)
- [ ] Lunge covers correct distance at correct speed
- [ ] Bite deals 0.5 damage when in range
- [ ] Bite misses when player dodges
- [ ] Retreat behavior works (backs away 4-5 units)
- [ ] 4 hits downs a player (0.5 × 4 = 2 HP)

### Pack Coordination Testing

- [ ] Compys spread targets initially
- [ ] 2-3 Compys gang up on isolated player (>5 units from team)
- [ ] Compys prioritize low-health player (1 HP)
- [ ] Pincer pattern executes (front + back simultaneous)
- [ ] Swarm pattern executes (3 attacks with 0.5s stagger)
- [ ] Last Compy uses hit-and-run behavior

### Balance Testing

- [ ] 1 player can complete hunt in ~2 minutes
- [ ] 2 players can complete hunt in ~2 minutes
- [ ] 3 players can complete hunt in ~2 minutes
- [ ] 4 players can complete hunt in ~2 minutes
- [ ] Hunt feels appropriately easy (warm-up difficulty)
- [ ] Players earn 150-200 points on average (enough for upgrades)

### Flow Testing

- [ ] Intro sequence plays (5 seconds, camera pan, Compy reveals)
- [ ] HUD fades in correctly
- [ ] Victory sequence plays (celebration, score tally)
- [ ] Defeat sequence plays (retry prompt)
- [ ] Transition to cave bar works (bartender reaction, trophy update)
- [ ] Session state persists (scores, hunt progress)
- [ ] Full loop works: Cave Bar → Hunt → Cave Bar

### Edge Cases

- [ ] What happens if player disconnects mid-hunt?
- [ ] What happens if all Compys target same player?
- [ ] Can Compys get stuck behind trees?
- [ ] Can players exploit elevation (rock platforms) to be unreachable?
- [ ] Does pack coordination break with <5 Compys alive?

---

## Success Metrics

**Completion Rate:** 90%+ of sessions should complete Compy hunt on first try

**Time to Complete:**
- Median: 90-120 seconds
- If faster: Hunt too easy, increase Compy health or coordination
- If slower: Hunt too hard, reduce Compy aggression or damage

**Player Retention:**
- 80%+ of players should continue to Hunt 2 after completing Compy hunt
- Low retention suggests hunt is too punishing or boring

**Score Distribution:**
- Average: 150-200 points (enough for 1 cocktail or ability)
- Top 25%: 250+ points (skilled play)
- Bottom 25%: 100+ points (still rewarded for participation)

---

## Notes & Future Expansions

### Variant Ideas (Post-Launch)

**"Compy Horde" Challenge Mode:**
- 10 Compys instead of 5
- Same mechanics, higher difficulty
- Unlocked after completing main campaign

**"Alpha Compy" Elite Version:**
- 1 large alpha (2× size, 5× health) + 3 normal Compys
- Alpha has special roar that buffs pack
- Harder version for returning players

### Lessons for Future Hunts

- Pack coordination system can be reused for Raptor hunt
- Line-of-sight blocking (trees) works well, use in other arenas
- 0.5 damage fractional system allows fine-tuning difficulty
- Light touch tutorial approach feels better than heavy prompts

---

**End of Design Document**

**Next Steps:**
1. Review and approve design with team
2. Set up git worktree for isolated development
3. Begin Phase 3.1: Arena Setup
4. Generate Compy sprites via PixelLab MCP
5. Iterate and playtest
