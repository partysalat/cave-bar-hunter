# Prehistoric Hunter - Sidescroller Redesign
**Date:** 2026-02-15
**Status:** Design Complete

## Summary

Prehistoric Hunter pivots from top-down isometric to a 2D sidescroller. The core game loop, session structure, upgrade system, and cooperative mechanics are unchanged. What changes is the rendering layer, player movement, arena layout, and boss presentation. The result is a more spectator-readable game with dramatically lower asset production cost.

## Why Sidescroller

**Gains:**
- Giant apex bosses fill the screen vertically - immediately legible from across a bar
- Side-view dinosaur sprites only need one orientation (flip horizontally for direction) - half the asset work
- Isometric coordinate projection is eliminated entirely - simpler codebase
- Beat-em-up / sidescroller format is familiar to casual players

**Losses:**
- Players can no longer encircle a boss from all sides
- Replaced by: flanking from left/right ends of the arena, which is equally readable

## Unchanged Systems

- 5-hunt session structure with escalating difficulty
- Cave bar hub between hunts (upgrade shop, bartender, scoreboard)
- Combat loop: telegraph → dodge → punish → stagger → repeat
- Weak point system (damage, break, debuff)
- Perfect dodge timing window (0.5s) and rewards
- Downed state and revival mechanic
- Scoring: damage, weak points, perfect dodges, saves
- Combo multipliers and MVP tracking
- Player count scaling (health, aggression)
- Drop-in/drop-out during cave bar phase
- Upgrade economy (weapons, passives, cocktails)

---

## World Space

**Axes:**
- **worldX:** Horizontal position (left/right across arena)
- **worldY:** Vertical position (height - replaces worldZ from isometric design)
- No worldZ - eliminated

**Coordinate mapping:**
```
screenX = worldX + SCREEN_OFFSET_X
screenY = SCREEN_FLOOR_Y - worldY * PIXELS_PER_UNIT
```

Simple linear mapping. No isometric projection. No depth sorting complexity.

**Arena dimensions:** 80 world units wide × 20 world units tall (wider than visible screen, camera scrolls)

**Camera:** Follows horizontal center of all active players with smooth lerp. Vertical is fixed (arena always fills screen height).

---

## Player Mechanics

### Movement
- **Left/Right:** D-pad left/right → worldX velocity
- **Jump:** D-pad up / dedicated button → upward worldY velocity, gravity pulls back down
- **No 8-direction complexity** - movement is left, right, or stationary on X axis

### Jump Physics
- Jump velocity: +15 units/second
- Gravity: -40 units/second²
- Peak height: ~2.8 world units
- Jump duration: ~0.75 seconds
- **Double jump:** Not available by default; could be a passive upgrade

### Sprite Direction
- Two states: facing left, facing right
- Flip sprite horizontally for direction change
- 8-rotation system eliminated

### Actions (Controller)
- **Right Trigger:** Throw spear / shoot (auto-aims at nearest weak point in frontal cone)
- **Left Trigger:** Dodge roll with invincibility frames (3s cooldown)
- **A:** Use equipped item/trap
- **B:** Jump (or D-pad up)
- **X:** Interact / revive downed teammate
- **Y:** Cycle auto-aim target between weak points

### Dodge Roll
- Horizontal dash in current movement direction
- Invincibility frames: 0.4 seconds
- Cannot dodge vertically (no aerial dodge)
- If airborne: short horizontal burst instead of roll

---

## Combat System

The telegraph → dodge → punish loop works identically in 2D:

1. **Telegraph (2-3s):** Boss body part glows based on attack type. Head glow = bite forward. Legs glow = stomp/sweep at ground level. Tail glow = tail sweep behind.
2. **Attack execution:** Boss commits. Players dodge or reposition.
3. **Recovery window (2-4s):** Boss vulnerable. Players attack weak points.
4. **Stagger break (every ~25% HP):** Boss collapses. All weak points exposed. 5-second damage window.

### Height-Layered Weak Points

Instead of angle-distributed (isometric), weak points are height-distributed:

| Weak Point | Height | Access Method |
|---|---|---|
| Legs | Ground (worldY 0-2) | Ground melee or spear |
| Mid-body | Mid (worldY 2-5) | Jumping melee or spear arc |
| Back | Mid-high (worldY 3-6) | Climbing on boss |
| Head | High (worldY 6-12) | Ranged spear arc or platform jump |

### Climbing
- Player can grab the boss sprite at grab zones (defined per boss)
- Hold toward boss while touching = latch on
- Climb up/down with D-pad vertical
- Attack while climbing hits nearby weak point
- Boss can shake off climbers with specific attacks (shudder animation)
- Climbing reserved for medium and large bosses (not Compy-scale enemies)

### Flanking
- Boss has a **facing direction** (left or right)
- Tail weak point only accessible from **behind** the boss
- Front players draw aggro, back players safely attack tail
- Boss turns to face the most threatening player periodically
- When boss turns: players on the "safe" side scramble to maintain position

---

## Enemy Tiers

### Tier 1 - Brawler Scale (Compys, Dilophosaurus)
**Height:** 1.5-2× player height
**Arena width:** 40 world units (smaller, fits 1.5 screens)

Multiple enemies at approximately player scale. Players fight groups. Compys swarm from both screen edges. Dilophosaurus maintains range and spits. Combat feels like a classic beat-em-up brawler.

**Asset note:** Small sprites, simple animations. Each creature is one sprite sheet (left-facing, flip for right).

### Tier 2 - Medium Bosses (Triceratops, Stegosaurus)
**Height:** 4× player height
**Arena width:** 60 world units

Boss fills ~40% of screen height. Head reachable by single jump. Climbing viable for back weak point. Charges send boss running horizontally across arena, players scatter then chase.

**Triceratops:** Charges left/right. Lure into arena wall for stun. Rear weak point (tail/back legs) only from behind.

**Stegosaurus:** Slow turn speed. Tail sweep covers 270° behind. Head at front is the priority target, reachable by jump.

### Tier 3 - Aggressive Carnivores (Raptor Alpha, Carnotaurus)
**Height:** 3-4× player height
**Arena width:** 70 world units

Faster, more aggressive. Raptors leap across the screen. Carnotaurus charges full arena width. Enrage at 50% HP increases speed and attack frequency.

### Tier 4-5 - Apex Bosses (T-Rex, Giganotosaurus, Quetzalcoatlus)
**Height:** 8-10× player height
**Arena width:** 80 world units

Boss fills 70-80% of screen height. Head is unreachable without ranged arc or platform. Stagger collapse brings head to ground level - the key "everyone pile on" moment.

**T-Rex stagger:** Collapses forward, head crashes to ground. All players can melee the head for 5 seconds. Crowd moment.

**Quetzalcoatlus:** Flies in from right edge. Players damage wings (only vulnerable during flight) to force landing. Attacks on ground. Takes off again after 10 seconds. Repeat.

---

## Arena Design

### Structure
- **Width:** 60-80 world units (wider than screen)
- **Camera:** Horizontal scrolling, follows player group center
- **Height:** Fixed - bottom of screen is ground (worldY=0), top is sky
- **Platforms:** 2-4 platforms per arena at various heights, allow reaching higher weak points

### Platform Rules
- Platforms are simple horizontal surfaces with a texture
- Jump up through bottom (one-way), land on top
- No platform-specific gameplay mechanics (no ice, tar in 2D) - arenas differentiated by layout and visual theme

### Arena Themes (mapped from original design)

| Arena | Visual | Layout Feature |
|---|---|---|
| Jungle | Lush trees, vines | Vine-covered platforms at varying heights |
| Volcanic | Orange glow, lava | Platforms over lava pits, jump to avoid ground hazards |
| Tundra | Blue-white ice | Slippery platform surfaces (extended slide) |
| Bone Graveyard | Giant rib bones | Rib cage platforms at multiple heights |
| Savanna | Golden grass | Open ground, minimal platforms - pure skill test |
| Cave Bar Hub | Stone interior | Non-combat, flat ground only |

---

## Cooperative Mechanics (2D Adjustments)

### Flanking Roles
The boss's facing direction creates natural role distribution:
- **Front players (1-2):** Draw aggro, attack head/front legs, perfect dodge bites
- **Back players (1-2):** Attack tail/rear weak points safely during front-player aggro windows

No explicit coordination required - position in the arena implies role.

### Revival in 2D
- Downed player collapses and can crawl left/right slowly
- Reviving player must physically navigate to downed player (past boss attacks)
- Hold X for 2 seconds while standing over downed player
- More physically tense than isometric version - must cross dangerous ground

### Player Overlap
- Players do not collide with each other (pass through freely)
- Prevents blocking teammate revival paths
- Consistent with Castle Crashers, Towerfall, etc.

---

## Asset Production

### Player Characters (4 colors)
Per character:
- Idle (3-4 frames)
- Run (6 frames)
- Jump (3 frames: rise, peak, fall)
- Attack/throw (4 frames)
- Dodge roll (4 frames)
- Downed/crawl (2 frames)
- Revive stand-up (3 frames)

All left-facing. Flip sprite for right-facing. **Total: ~26 frames per character × 4 = ~104 frames**
*Compare to isometric: 8 rotations × same frames = ~800+ frames*

### Dinosaurs
Per creature, left-facing only:
- Idle (4 frames)
- Walk/patrol (6 frames)
- Telegraph (2 frames - tension pose)
- Attack (4 frames)
- Stagger (3 frames)
- Death (4 frames)

Flip for right-facing direction. Boss-scale creatures (Tier 4-5) are single large sprites.

### Tilesets
Use `create_sidescroller_tileset` MCP tool to generate platform tilesets:
- Jungle: stone/root platforms with grass tops
- Volcanic: obsidian platforms
- Tundra: ice platforms
- Bone: bone/rib platforms
- Savanna: dirt ledges

---

## Technical Architecture Changes

See migration plan: `docs/plans/2026-02-15-sidescroller-migration-plan.md`

**Net change:** Remove ~400 lines of isometric projection/depth-sorting code. Add ~150 lines of jump physics. Sprite direction system goes from 8 states to 2.