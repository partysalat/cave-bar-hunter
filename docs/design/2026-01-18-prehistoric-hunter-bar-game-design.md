# Prehistoric Hunter - Bar Game Design

**Project Type:** Custom 4-player cooperative dinosaur hunting game for dinosaur-themed bar
**Target Platform:** PC with gamepad controllers, large display
**Session Length:** 15-30 minutes
**Design Date:** 2026-01-18

## Executive Summary

Prehistoric Hunter is a cooperative boss-battle game where 1-4 players take on the roles of cavemen hunters tracking and defeating increasingly dangerous dinosaurs. Players work together to survive while competing for individual high scores and MVP honors. The game features a unique cave bar hub between hunts where players purchase weapon upgrades, passive abilities, and cocktail buffs using points earned from combat performance.

**Core Appeal for Bar Environment:**
- Spectator-friendly: Top-down isometric view shows all action clearly
- Social gameplay: Cooperative with competitive scoring
- Quick to learn: Simple controls, visual telegraphs
- High energy: Dramatic boss encounters with crowd-pleasing moments
- Thematic integration: Cave bar setting mirrors real bar, cocktails as power-ups

## Session Structure & Flow

### Complete Session (15-30 minutes)

A full game session consists of 5 escalating hunts:

1. **Warm-up Hunt** (2 min) - Compy pack or Dilophosaurus
2. **Mid-tier Herbivore** (3 min) - Triceratops or Stegosaurus
3. **Aggressive Carnivore** (4 min) - Raptor Alpha or Carnotaurus
4. **Elite Predator** (5 min) - Spinosaurus or Allosaurus
5. **Apex Boss** (7 min) - T-Rex, Giganotosaurus, or Quetzalcoatlus

### Between-Hunt Cave Bar Phase (30 seconds each)

After each hunt, players return to the cave bar hub:
- Score breakdown displayed with current leader highlighted
- Quick upgrade shop: weapons, passive abilities, cocktails
- Next dinosaur revealed with dramatic intro animation
- "READY?" countdown timer (all players must confirm)

### Scoring System

**Individual Point Earning:**
- **Damage dealt:** 1 point per hit
- **Weak point hits:** 3 points (bonus multiplier)
- **Perfect dodges:** 5 points (evade with <0.5s timing window)
- **Teammate saves:** 10 points (reviving or protecting downed players)
- **Special bonuses:** First blood (20 pts), killing blow (20 pts), combo chains

**Session End:**
- Total scores tallied across all 5 hunts
- MVP crowned (highest total score)
- Player with most perfect dodges, most saves, highest damage shown
- Top 10 daily leaderboard entry
- Initials entry for high scores

## Controls & Input

### Controller Layout (D-pad + 4 buttons + 2 triggers)

**Movement & Basic Actions:**
- **D-pad:** 8-directional movement
- **Right Trigger:** Throw spear/shoot weapon (hold for auto-aim assist)
- **Left Trigger:** Dodge roll with invincibility frames (3-second cooldown)

**Face Buttons:**
- **A (Bottom):** Use equipped item/trap
- **B (Right):** Quick melee attack (stun, short range)
- **X (Left):** Interact/revive downed teammate
- **Y (Top):** Cycle auto-aim target between weak points

### Aiming System (No Right Stick)

**Auto-Aim Hybrid Approach:**
- Player sprite faces the direction of D-pad movement
- Holding Right Trigger activates auto-aim: reticle snaps to nearest weak point within frontal cone
- Y button cycles through available weak points (Head → Tail → Legs → cycle)
- Visual indicator (colored arrow) shows which weak point player is targeting
- All players can see each other's target indicators for coordination

**Design Rationale:**
- D-pad controllers lack analog aiming
- Auto-aim keeps combat fluid and accessible
- Manual cycling allows strategic weak point selection
- Visual feedback enables team coordination without voice chat

## Combat Mechanics

### Core Combat Loop

**1. Telegraph Phase (2-3 seconds)**
- Dinosaur locks onto target player (arrow appears above their head)
- Visual cue: Body part glows based on attack type
  - Head glow = bite attack
  - Legs glow = charge attack
  - Tail glow = sweep attack
- Audio cue: Distinct growl/roar per attack type
- Targeted player must prepare to dodge or reposition

**2. Attack Execution (1-2 seconds)**
- Dinosaur commits to attack with brief windup animation
- Targeted player should dodge roll for safety
- Non-targeted players have clean opening to attack exposed weak points
- Perfect dodge timing (final 0.5s before hit) grants damage buff

**3. Recovery Window (2-4 seconds)**
- Dinosaur's attack animation completes
- Brief vulnerable state where all players can safely attack
- Critical window for building toward stagger threshold

**4. Stagger Break (Every ~25% health lost)**
- Dinosaur stumbles, falls, or becomes immobilized
- All weak points exposed and take 3x damage
- 5-second massive damage window
- Music intensity spikes
- Ideal time to use cocktail buffs and items
- Screen effect: Slow-motion briefly, "STAGGER!" text callout

### Weak Point System

**Weak Point Types:**
- **Head:** Small hitbox, high mobility, 2x damage multiplier
- **Tail:** Medium hitbox, breaking it causes trip/stagger effect
- **Legs:** Large hitbox, easiest to hit, breaking slows dinosaur 40%
- **Back:** Some dinosaurs only, requires positioning behind, moderate damage

**Weak Point States:**
- **Intact:** Glowing when vulnerable, takes full damage
- **Damaged:** Visual cracks appear, nearing break threshold
- **Broken:** Shatters with satisfying effect, applies debuff to dinosaur

### Perfect Dodge Mechanic

**Timing Windows:**
- **Normal dodge:** Roll anytime during telegraph = safe (invincibility frames)
- **Perfect dodge:** Roll during final 0.5 seconds before attack connects

**Perfect Dodge Rewards:**
- 5 bonus points
- Brief damage buff: 1.5x damage for next 3 seconds
- Visual feedback: Brief slow-motion, "PERFECT!" text, player sprite glows
- Audio feedback: Satisfying whoosh + chime

**Skill Expression:**
- Beginners can play safe with early dodges
- Advanced players risk late dodges for damage buffs
- Mastery: Chaining perfect dodges for sustained damage bonus

### Downed & Revival System

**Getting Downed:**
- Player takes 2 hits before being downed (3 with Thick Hide upgrade)
- Downed player collapses, "SAVE!" prompt appears above them
- 10-second timer before permanent death
- Downed player can slowly crawl (D-pad)

**Revival Process:**
- Teammate moves to downed player
- Holds X button for 2 seconds (progress bar fills)
- Both players gain brief shield upon successful revival (absorbs 1 hit)
- Revived player returns with 50% capability for 5 seconds (slower movement/attack)

**Failure Conditions:**
- Solo mode: Player has 3 lives, each down costs 1 life
- Team mode (2-4 players): All players downed simultaneously = hunt fails

### Team Synergy Mechanics

**Target Focus Bonus:**
- When 2+ players hit same weak point within 2-second window = combo
- Combo multiplier: 1.2x damage for all hits in combo chain
- Visual: Damage numbers link together, "COMBO x3!" appears
- Encourages voice coordination: "Everyone hit tail!"

**Revive Chain Bonus:**
- Successfully reviving teammate grants both players temporary shield (1 free hit)
- Encourages risky heroic saves rather than passive play
- Creates spectator "hero moments"

**Item Synergies:**
- Bear trap + focused fire = instant weak point break
- Damage totem placement becomes strategic team decision
- Smoke bomb allows entire team to reposition safely

## Weapons & Equipment

### Primary Weapons (150-250 points, purchased at Cave Bar)

**Stone Spear (Starting weapon, free)**
- Balanced stats: Medium damage, medium fire rate
- 2-second reload between throws
- Effective range: Full arena
- Best for: Learning combat, general use

**Bone Club (200 points)**
- High damage, slow attack speed
- Melee range only (must be adjacent)
- Stuns dinosaurs briefly on hit
- Best for: Tank builds, aggressive players

**Bow (150 points)**
- Low damage per hit, fast fire rate (1-second reload)
- Unlimited range, arc trajectory (arrows follow a ballistic arc)
- Best for: Kiting, consistent damage, speed builds

**Net Launcher (250 points)**
- Low direct damage, immobilizes dinosaur weak point for 3 seconds
- 5-second reload
- Immobilized parts take +50% damage from all sources
- Best for: Support builds, team coordination

### Passive Abilities (100-200 points)

**Thick Hide (150 points)**
- +1 hit before being downed (3 hits total instead of 2)
- Best for: Frontline fighters, solo players, beginners

**Swift Feet (100 points)**
- Dodge roll cooldown reduced from 3s to 2s
- Best for: Aggressive dodging, kiting, mobile playstyles

**Hunter's Eye (150 points)**
- Weak point hitboxes increased 30%
- Makes head shots significantly easier
- Best for: DPS builds, precision players

**Pack Leader (100 points)**
- Revive speed increased 50% (2s becomes ~1.3s)
- Grants revived teammate +25% damage for 10 seconds
- Best for: Support players, team-focused builds

**Scavenger (200 points)**
- Earn 25% bonus points for all damage dealt
- Best for: Competitive players chasing MVP, solo players

### Cocktails (50-75 points each, max 2 active per hunt)

Purchased from cave bar bartender, consumed immediately with animation.

**Mammoth Mule (50 points)** - Frozen blue drink
- +25% movement speed for entire hunt
- Synergy: Bone Club (mobile melee), kiting strategies

**Raptor Rush (75 points)** - Fiery red drink
- +30% attack speed (reduced reload times) for entire hunt
- Synergy: Bow (rapid arrow volley), Bone Club (faster stun combos)

**Dino Daiquiri (75 points)** - Green herbal drink
- Regenerate 1 HP every 10 seconds (slow heal over time)
- Synergy: Thick Hide (near-unkillable tank), solo play

**Saber Slam (75 points)** - Purple berry drink
- Next 3 attacks deal double damage (2x multiplier)
- Synergy: Bone Club (massive single hits), save for stagger phases

**Tar Pit Tonic (75 points)** - Thick black drink
- Absorbs next hit without taking damage (1-hit shield)
- Synergy: Aggressive play, perfect dodge practice, clutch saves

**Volcano Mojito (50 points)** - Orange smoking drink
- All attacks apply brief burn effect
- Synergy: Bow (rapid arrows each apply burn), multi-hit strategies

### Strategic Loadout Examples

**Tank Build:**
- Weapon: Bone Club
- Passive: Thick Hide
- Cocktails: Dino Daiquiri + Tar Pit Tonic
- Role: Frontline fighter, draws aggro, revives teammates

**DPS Build:**
- Weapon: Bow
- Passive: Hunter's Eye
- Cocktails: Saber Slam + Raptor Rush
- Role: Maximize damage output, rapid weak point hits

**Support Build:**
- Weapon: Net Launcher
- Passive: Pack Leader
- Cocktails: Mammoth Mule + Dino Daiquiri
- Role: Enable team damage, keep players alive

**Kiter Build:**
- Weapon: Bow
- Passive: Swift Feet
- Cocktails: Raptor Rush + Mammoth Mule
- Role: Mobile harasser, never stops moving/shooting

## Dinosaur Roster & Behaviors

### Tier 1: Warm-up Hunts (2 minutes)

**Compy Pack**
- Health: Very low (individual), 5 enemies
- Attacks: Quick bite, coordinated leap
- Behavior: Swarm tactics, circle players, attack from behind
- Weak Points: Body (any hit is effective)
- Strategy: Focus fire one at a time, use melee for cleave

**Dilophosaurus**
- Health: Low
- Attacks: Poison spit (blinds/blurs screen), bite
- Behavior: Maintains medium range, spits when players group, retreats if cornered
- Weak Points: Head (spit source), legs
- Strategy: Spread out to avoid multi-spit, rush after spit to interrupt

### Tier 2: Herbivores (3 minutes)

**Triceratops**
- Health: Medium-high
- Attacks: Forward charge, horn sweep, tail whip
- Behavior: Charges furthest player, spins to protect rear weak point
- Weak Points: Rear (back legs/tail), sides (vulnerable during charge)
- Strategy: Bait charge into walls/tar for stun, flank during recovery

**Stegosaurus**
- Health: Medium
- Attacks: 270° tail sweep, stomp (close range AOE)
- Behavior: Slow turn speed, positions tail toward threats
- Weak Points: Head (opposite tail, hard to reach), legs
- Strategy: Split team to attack head and tail simultaneously, bait sweeps

### Tier 3: Aggressive Carnivores (4 minutes)

**Raptor Alpha**
- Health: Medium
- Attacks: Pounce (pins player), claw slash, howl (summons adds)
- Behavior: Circles at medium range, targets isolated players, summons 2 smaller raptors at 66% and 33% HP
- Weak Points: Head, back (when pouncing)
- Strategy: Stay grouped, kill adds immediately, use smoke bomb during frenzy phase

**Carnotaurus**
- Health: High
- Attacks: Bull rush charge, bite, ground pound (AOE knockdown)
- Behavior: Aggressive forward pressure, telegraphed charges across full arena, enrages at 50% HP (faster, less telegraph)
- Weak Points: Legs (causes stumble), head (during charge recovery)
- Strategy: Perfect dodge charges for damage buff, focus legs to slow enrage phase

### Tier 4: Elite Predators (5 minutes)

**Spinosaurus**
- Health: High
- Attacks: Water spray (cone, knockback), bite, tail swipe, dive (submerge and reposition)
- Behavior: Uses water features in arena, amphibious mobility, aggressive when cornered
- Weak Points: Sail (back), head
- Strategy: Control positioning away from water, punish dive repositions

**Allosaurus**
- Health: Medium-high
- Attacks: Leap bite, roar (summons 2 raptors), claw combo (3-hit)
- Behavior: Pack leader tactics, coordinates with summoned raptors, tests player spacing
- Weak Points: Legs (breaks coordination), head (during leap)
- Strategy: Spread to avoid combo hits, focus main boss over adds when possible

### Tier 5: Apex Bosses (7 minutes)

**Tyrannosaurus Rex** (Two-phase fight)
- Health: Very high
- **Phase 1 (100-50% HP):**
  - Attacks: Bite (3s telegraph, single target), stomp (AOE circle), tail sweep (180° behind), roar (fear, slows all 50% for 5s)
  - Pattern: Bite → Stomp → Tail → Bite → Roar (repeats)
  - Weak Points: Head (best), legs
- **Phase 2 (50-0% HP - Enraged):**
  - All attacks 30% faster
  - New: Tremor charge (runs across arena, multiple stomps)
  - Roar every 15 seconds (more frequent)
  - Reduced recovery windows
- Strategy: Learn pattern in Phase 1, save cocktails/items for Phase 2, tank draws bite while others DPS tail

**Giganotosaurus**
- Health: Very high (more than T-Rex)
- Attacks: Charge bite (forward rush), spin attack (360° sweep), ground slam (creates shockwave)
- Behavior: More aggressive than T-Rex, shorter telegraphs, relentless pressure, minimal recovery windows
- Weak Points: Back (exposed during spin), legs (hard to break)
- Strategy: Requires mastery of perfect dodges, high mobility essential, coordinate staggers for damage windows

**Quetzalcoatlus** (Flying boss, unique mechanics)
- Health: Medium-high
- Attacks: Dive bomb (from Z=5.0 to Z=0), wing gust (knockback cone), aerial grab (picks up player, teammates must shoot to free)
- Behavior: Cruises at high altitude (immune to damage), swoops down during attacks, lands briefly after dive bomb
- Weak Points: Wings (only vulnerable during flight), body (only during grounded state)
- Strategy: Force landings with focused wing shots, maximize damage during brief ground phases, save grabbed allies quickly

## Arena Environments

All arenas are roughly 30x25 world units with distinct biomes and tactical features.

### Tar Pits Arena
- **Visual:** Bubbling black tar pools, prehistoric plants, scattered bones
- **Features:** 3-5 tar pools (various sizes) scattered across ground
- **Mechanics:** Movement slowed 50% in tar (affects players and dinosaurs), heavy dinosaurs can get stuck briefly
- **Strategy:** Lure charges into tar for extended stagger, avoid tar during dodge-heavy phases
- **Best for:** Triceratops, Carnotaurus (heavy chargers)

### Volcanic Rocks
- **Visual:** Orange/red glow, steam effects, cracked obsidian ground, lava streams at edges
- **Features:** 4-6 geysers that erupt on timers (8-second cycles)
- **Mechanics:** Geysers telegraph 1 second before eruption (rumble + glow), deals fire damage in vertical cone (Z=0 to Z=3)
- **Strategy:** Position dinosaur over geysers for extra damage, learn timing to avoid self-damage
- **Best for:** Spinosaurus, Allosaurus (mobile bosses)

### Dense Jungle
- **Visual:** Lush green canopy, dappled lighting, hanging vines, large ferns
- **Features:** 6-8 large trees and rock formations providing cover
- **Mechanics:** Line-of-sight breaks (hide behind cover to break aggro), ranged attacks blocked by obstacles
- **Strategy:** Kite dinosaurs around obstacles, use cover for revives, ambush from behind
- **Best for:** Raptor Alpha, Dilophosaurus (intelligent hunters)

### Frozen Tundra
- **Visual:** Blue-white palette, snow drifts, frozen waterfalls, icicle formations
- **Features:** Ice patches covering ~40% of ground
- **Mechanics:** Ice = slippery movement (reduced traction, harder to stop), dinosaur charges slide farther
- **Strategy:** Bait charges on ice for longer slide = extended punish window, careful positioning required
- **Best for:** Carnotaurus, T-Rex (heavy chargers)

### Bone Graveyard
- **Visual:** Massive skeletal remains (ribs, skulls), dramatic shadows, dusty atmosphere
- **Features:** Giant bone structures creating elevated platforms (Z=1.5 and Z=3.0)
- **Mechanics:** Climb bones for height advantage, ground-level attacks don't reach elevated players, some bosses can't reach platforms
- **Strategy:** Ranged players use high ground, melee draws aggro below, split dinosaur attention vertically
- **Best for:** Stegosaurus, T-Rex (limited vertical reach)

### Open Savanna (Boss Arenas Only)
- **Visual:** Golden grass, scattered acacia trees at edges, dramatic sky, watering hole in center
- **Features:** Minimal cover, wide open space, small water feature
- **Mechanics:** No environmental advantages, pure skill test, maximum mobility space
- **Strategy:** Teamwork and positioning are everything, use full arena space for kiting
- **Best for:** T-Rex, Giganotosaurus, Quetzalcoatlus (apex bosses)

## Cave Bar Hub (Between-Hunt Phase)

### Visual Design

**Setting:** Prehistoric cave bar interior with torches, stone furniture, tribal atmosphere

**Key Elements:**
- Stone bar counter (center-right)
- Burly Neanderthal bartender character (grunts, gestures)
- Wooden stools (4 positions, color-coded per player)
- Cave paintings on walls (represent passive ability upgrades)
- Weapon rack on left wall (displays available weapons)
- Trophy wall showing silhouettes of defeated dinosaurs
- Scoreboard carved into stone (displays current session standings)
- Torches providing warm lighting
- Bone mugs, primitive decorations

**Player Representation:**
- 4 player cavemen stand in cave bar
- Color-coded (red, blue, yellow, green)
- Walk to different stations to interact
- Bartender faces current interacting player

### Interactions

**Bartender (Cocktails)**
- Player walks to bar counter
- Menu appears showing 6 cocktails with icons, prices, effects
- Purchase: Bartender slides drink (bone mug animation)
- Player chugs drink, buff icon appears above head
- Bartender reacts: "UGH! GOOD CHOICE!" (grunted approval)
- Limit: 2 cocktails per player per hunt

**Weapon Rack (Weapon Swap)**
- Player walks to weapon rack on wall
- Menu shows 5 weapon options with stats and prices
- Purchase/equip: Weapon appears in player's hand
- Visual: Old weapon placed on rack, new weapon taken
- Can swap freely if already purchased

**Cave Paintings (Passive Abilities)**
- Player walks to specific cave painting
- Painting glows, shows ability description and price
- Purchase: Painting glows brighter, buff icon appears above player
- Permanent for session once purchased
- Multiple abilities stack

**Scoreboard**
- Automatic display (no interaction)
- Shows current hunt number (Hunt 2/5)
- Displays all 4 player scores ranked
- MVP indicator (crown icon) for current leader
- Updates after each hunt

**Trophy Wall**
- Shows silhouettes of all dinosaurs
- Defeated dinos show full art + checkmark
- Upcoming dino shows as glowing silhouette
- Creates anticipation for next hunt

### Bartender Character

**Personality:**
- Gruff but friendly Neanderthal
- Communicates through grunts, gestures, expressions
- Reacts to player performance:
  - High scores: Enthusiastic approval ("UGH! MIGHTY HUNTER!")
  - Low scores: Skeptical grunt ("HMMM... WEAKLING...")
  - Player death: Concerned look
  - Victory: Cheers and celebrates

**Animations:**
- Idle: Cleaning bone mug with rag
- Serving: Slides drink across bar
- Reacting: Pumps fist, nods, shakes head

### Transition Flow

**Entering Cave Bar:**
1. Hunt victory screen (2 seconds) - "HUNT COMPLETE!"
2. Camera zooms out from arena
3. Fade to cave bar entrance
4. Players walk in through cave entrance (staggered timing)
5. Bartender acknowledges arrival
6. 30-second timer starts (displays on wall)

**Exiting Cave Bar:**
1. Timer reaches 5 seconds - countdown displayed
2. All players automatically move to cave exit
3. Bartender waves farewell
4. Fade to next arena
5. Next dinosaur intro sequence

**Drop-In/Drop-Out:**
- New player joins: Enters through cave entrance, bartender grunts welcome
- Player leaves: Walks out exit, bartender waves
- Only possible during cave bar phase (not during hunts)

## Coordinate System Architecture

### World Space (3D Gameplay Logic)

**Axes:**
- **worldX:** Horizontal axis (left-right across arena), range: 0-30 units
- **worldY:** Depth axis (near-far, toward/away from camera), range: 0-25 units
- **worldZ:** Height axis (vertical elevation, jumping, platforms), range: 0-10+ units

**Usage:**
- All entity positions stored as (worldX, worldY, worldZ)
- All velocities and movement calculations use world units
- Collision detection operates in world space (sphere vs box checks)
- Gameplay logic (distance checks, AI decisions) uses world coordinates

**Typical World Values:**
- Player position: (15.0, 12.0, 0.0) = center ground
- Jump height: worldZ changes from 0.0 to 2.0 over 0.5 seconds
- Platform heights: Z=1.5 (low), Z=3.0 (high)
- Quetzalcoatlus cruise: Z=5.0 (unreachable)
- Arena bounds: X=[0, 30], Y=[0, 25], Z=[0, ~8]

### Screen Space (2D Rendering)

**Isometric Projection Formula:**
```
screenX = (worldX - worldY) * (TILE_WIDTH / 2) + SCREEN_CENTER_X
screenY = (worldX + worldY) * (TILE_HEIGHT / 2) - (worldZ * HEIGHT_SCALE) + SCREEN_CENTER_Y
```

**Constants (2K Resolution - 2× Scale):**
- TILE_WIDTH = 128 pixels (2× for higher detail)
- TILE_HEIGHT = 64 pixels (maintains 2:1 isometric ratio)
- HEIGHT_SCALE = 100 pixels per world unit (Z axis, 2× scaled)
- SCREEN_CENTER_X = 1280 pixels (2560 / 2)
- SCREEN_CENTER_Y = 720 pixels (1440 / 2)

**Screen Space Usage:**
- Sprite rendering positions (sprite.x, sprite.y)
- Derived every frame from world positions
- Never used for gameplay logic
- Read-only for game systems

### Depth Sorting (Render Order)

**Depth Calculation:**
```
depth = worldY * 1000 + worldZ * 10
```

**Rationale:**
- Objects further "back" (higher worldY) render in front (higher depth)
- Height (worldZ) provides minor depth adjustment
- Creates proper visual layering without true 3D

**Application:**
- Every entity sets sprite.setDepth(calculateDepth(worldY, worldZ)) each frame
- Phaser automatically sorts sprites by depth value
- Players can move behind/in front of dinosaurs naturally

### Height-Based Gameplay

**Vertical Mechanics:**

**Jumping:**
- Player holds worldZ from 0.0 (ground) up to 2.0 (peak)
- Gravity constant: -1200 pixels/second² (applied to worldZ velocity)
- Jump velocity: +500 pixels/second (initial upward)
- Jump duration: ~0.8 seconds total

**Platform Interaction:**
- Platforms have collision at specific Z heights (1.5, 3.0)
- Player can stand on platform if worldZ > platform.worldZ
- Provides height advantage for ranged attacks
- Some dinosaur attacks can't reach elevated players

**Flying Boss (Quetzalcoatlus):**
- Cruises at worldZ = 5.0 (above maximum jump reach)
- Immune to damage while airborne
- Swoops to worldZ = 0.0 during dive attack
- Brief vulnerability window when grounded

**Attack Height Ranges:**
- Stomp attacks: Z=0 to Z=0.5 (ground only)
- Bite attacks: Z=0 to Z=2.0 (can hit jumping players)
- Tail sweeps: Z=0 to Z=1.5 (medium height)
- Projectiles: Follow arc trajectory through Z space

**Collision Detection in 3D:**

**Sphere Collision (Players, Bullets):**
- Entity has: worldX, worldY, worldZ, radius
- Check distance in 3D: sqrt((x1-x2)² + (y1-y2)² + (z1-z2)²)
- Collision if distance < radius1 + radius2

**Box Collision (Dinosaurs, Props):**
- Entity has: worldX, worldY, worldZ, width, depth, height
- Check overlap in all 3 axes
- Must overlap in X AND Y AND Z to collide

**Height-Aware Collision:**
- Player at Z=2.0 avoids tail sweep at Z=0.5 (no Z overlap)
- Player on platform Z=3.0 can't be hit by ground attacks
- Jumping over tar pits (if Z > 0.3) avoids slow effect

## Visual Design & Polish

### Art Style: Stylized Cartoon

**Aesthetic:**
- Exaggerated prehistoric theme (Flintstones meets Monster Hunter)
- Bold colors, high contrast for readability from distance
- Chunky outlines on characters and dinosaurs
- Expressive animations (bouncy, dynamic)
- Fun and energetic, not scary or realistic

**Color Palette:**
- Earth tones for environments (browns, greens, oranges)
- Vibrant accent colors for players (red, blue, yellow, green)
- Glowing effects for weak points (bright yellow/orange)
- High saturation for visibility in bar lighting

### Player Character Design

**Visual Identity (4 Players):**
- **Player 1 (Red):** Red caveman outfit, red spear wrap, red face paint
- **Player 2 (Blue):** Blue caveman outfit, blue spear wrap, blue face paint
- **Player 3 (Yellow):** Yellow caveman outfit, yellow spear wrap, yellow face paint
- **Player 4 (Green):** Green caveman outfit, green spear wrap, green face paint

**Visual Feedback:**
- Spear projectiles trail player's color
- Dodge roll leaves colored motion blur
- Damage numbers pop in player's color (red player = red numbers)
- Perfect dodge adds glowing aura in player's color
- Cocktail buffs show colored icon above head

**Animations:**
- Walk/run (4 directions): Bouncy, exaggerated stride
- Dodge roll: Fast spin with motion blur
- Throw spear: Wind-up, release, follow-through
- Melee attack: Wide swing with impact frame
- Downed: Fall, crawl, revive stand-up
- Victory pose: Unique per player (fist pump, spear raise, etc.)

### Dinosaur Design

**Size Categories:**
- Small (Compy): ~1x1 world units
- Medium (Raptor, Dilo): ~2x2 world units
- Large (Trike, Stego): ~4x3 world units
- Huge (T-Rex, Giga): ~6x4 world units

**Visual Polish:**
- Clear silhouettes (recognizable from shape alone)
- Exaggerated features (big teeth, spikes, eyes)
- Weak points glow when vulnerable (pulsing yellow/orange)
- Damage states: Cracks appear on weak points as they near break
- Enrage states: Color shift (reddish tint), steam effects

**Animations:**
- Idle: Breathing, looking around, subtle movement
- Telegraph: Charge-up glow effect, tension pose
- Attack: Fast, snappy impact frames, screen shake
- Stagger: Stumble, fall, vulnerable pose
- Death: Dramatic collapse, dust cloud, fade out

### On-Screen HUD (Minimal Design)

**Top of Screen:**
- 4 player portraits (small character icons)
  - Color-coded borders
  - Health bars beneath (2-3 hearts)
  - Current score displayed (updates in real-time)
  - Buff icons (cocktails, abilities)
- Current session progress: "Hunt 3/5"
- Timer for current hunt (counts up)

**Center-Bottom:**
- Large dinosaur health bar (fills horizontal space)
- Dinosaur name and type above bar
- Weak point indicators on bar (segments show part health)

**Corner (Bottom-Right):**
- Player's personal info:
  - Equipped weapon icon
  - Item charges (if applicable)
  - Dodge cooldown indicator (circular timer)

**Dynamic Callouts:**
- Floating damage numbers (scale with damage: bigger = more damage)
- "PERFECT DODGE!" text appears above player
- "SAVE HIM!" prompt above downed player
- "COMBO x4!" appears between cooperating players
- "WEAK POINT BROKEN!" center screen flash

### Spectator-Friendly Moments

**Boss Intros:**
- Camera pans across arena showing environment
- Dinosaur enters with dramatic animation (roar, stomp)
- Name card appears: "TYRANNOSAURUS REX"
- Players ready-up animation (spears raised)
- Music swells, countdown: 3... 2... 1... HUNT!

**Near-Death Moments:**
- Screen flash red when player hit
- "SAVE HIM!" prompt appears prominently
- Tension music cue
- Downed player has countdown timer (visible to all)
- Successful save triggers "SAVED!" celebration text

**Weak Point Breaks:**
- Satisfying crack/shatter animation
- Slow-motion for 0.3 seconds
- "WEAK POINT BROKEN!" text
- Dinosaur reacts (stumble, roar, stagger)
- Damage numbers explode in all colors

**Stagger Phases:**
- Screen border pulses gold
- "STAGGER! GO GO GO!" text
- Music intensity spike
- Dinosaur vulnerable pose clearly visible
- Timer bar shows stagger duration (5 seconds)

**Killing Blows:**
- Brief slow-motion on final hit
- Camera zoom slightly on dinosaur
- Dramatic death animation
- Killer player highlighted with "KILLING BLOW!" text
- Victory fanfare

**Hunt Victory:**
- All players do synchronized victory pose
- Scores fly in and total up
- Current leader crowned with sparkle effect
- Transition to cave bar with celebration

### Camera System

**Base Camera:**
- Top-down isometric, locked angle (no rotation)
- Follows center point of all active players
- Smooth lerp (interpolation) for movement

**Dynamic Zoom:**
- Zooms out when players spread apart (keeps all visible)
- Zooms in slightly during stagger phases (emphasizes action)
- Zoom limits: Min 0.8x, Max 1.2x (never too extreme)
- Smooth zoom transitions (no jarring changes)

**Screen Shake:**
- Light shake: Dinosaur footsteps, player lands from jump
- Medium shake: Dinosaur attacks hit ground, staggers
- Heavy shake: Boss roars, ground slam attacks
- Brief duration (0.2-0.5 seconds), returns to stable

**Fixed Framing:**
- Never cuts or changes angle (spectators never lose context)
- Arena always fully visible
- UI elements remain anchored to screen edges

## Audio Design

### Music Strategy

**Cave Bar Theme:**
- Laid-back tribal drums, primitive flutes
- Relaxing atmosphere (bar between-action breather)
- Volume: 30-40% (doesn't compete with bar atmosphere)

**Hunt Themes (Dynamic Intensity):**
- Low intensity: Rhythmic drums, ambient tension
- Medium intensity: Percussion builds, melodic elements enter
- High intensity: Full tribal orchestra, fast drums
- Boss hunts: Epic orchestral tribal fusion
- Volume: 50-60% (enough to feel epic, not overwhelming)

**Adaptive Music:**
- Intensity scales with action (idle vs active combat)
- Spikes during stagger phases
- Ramps up when player at low health
- Victory sting on hunt completion

### Sound Effect Priority System

**Critical (Always Heard, High Volume):**
- Dinosaur attack telegraphs (roar before charge)
- Player down alarm (urgent drum hit)
- Weak point break (satisfying crack/shatter)
- Stagger window opening (dramatic impact)
- Countdown timer beeps (final 10 seconds)
- Victory fanfare

**Important (Reduced in Mix, Medium Volume):**
- Spear throw/hit (whoosh, thud)
- Dodge roll (quick whoosh)
- Melee attack impact
- Cocktail buff activation (gulp, aura sound)
- Item usage (trap set, smoke bomb)
- Environmental hazards (geyser warning rumble)

**Ambient (Subtle, Low Volume):**
- Footsteps (player and dinosaur)
- Dinosaur breathing/movement
- Arena atmosphere (jungle birds, wind, lava bubbling)
- Cave bar ambience (torch crackling, bartender muttering)

### Spectator Audio Cues

**Clear audio tells for crowd excitement:**
- Boss roar intro: Deep, unmistakable, builds anticipation
- "DANGER!" musical sting: When all players low health
- "STAGGER!" sound effect: Dramatic gong + whoosh
- Perfect dodge: Quick satisfying chime
- Combo hits: Escalating pitch with each combo level
- Victory fanfare: Triumphant, signals success

### Audio Accessibility (Visual Backups)

**All critical audio has visual equivalent:**
- Attack telegraphs: Screen flash + glow effect
- Player down: "SAVE!" text prompt
- Weak point break: Animation + particle burst
- Timer: On-screen countdown display
- Cocktail buffs: Icon appears above player

**No Audio-Only Information:**
- Every gameplay-relevant sound has visual feedback
- Deaf/hard-of-hearing players can fully play
- Works in noisy bar environment

## Player Count Scaling

### Dynamic Difficulty Adjustment

**Dinosaur Health Scaling:**
- **1 Player:** 100% base health
- **2 Players:** 160% base health (80% per player)
- **3 Players:** 210% base health (70% per player)
- **4 Players:** 240% base health (60% per player)

**Rationale:** More players = more total damage output, but coordination overhead and friendly fire risk means it's not strictly linear.

**Dinosaur Aggression:**
- **1 Player:** Boss focuses sole player, patterns more predictable, longer telegraph windows
- **2+ Players:** Boss switches targets dynamically, uses more AOE attacks, summons adds more frequently
- **4 Players:** Maximum chaos - all abilities used, shortest telegraph times, most aggressive

**Damage Scaling:**
- Dinosaur attack damage remains constant (incentivizes dodge mastery)
- More players = more opportunities to revive, balances difficulty

### Revival System by Player Count

**Solo Mode (1 Player):**
- No teammate revival possible
- Player has 3 lives (hearts displayed in HUD)
- Each death costs 1 life
- Successful hunt completion restores 1 life (max 3)
- 0 lives = session ends (game over)

**Team Mode (2-4 Players):**
- Standard revival system (teammates can save)
- Each player can be downed 2 times before permanent death
- All players downed simultaneously = hunt fails
- 3 hunt failures total = session ends

### Drop-In/Drop-Out (Between Hunts Only)

**Player Joins Mid-Session:**
- Can only join during cave bar phase (not during active hunt)
- Starts at average team score (prevents massive disadvantage)
- Gets starting weapon + 200 bonus points to catch up
- Welcome animation: Enters through cave entrance
- Bartender acknowledges: "UGH! NEW HUNTER!"
- Next hunt scales difficulty to new player count

**Player Leaves Mid-Session:**
- If during hunt: Character becomes AI-controlled until hunt ends, then removed at cave bar
- If during cave bar: Character waves, exits through door
- Dinosaur health recalculates for next hunt based on remaining players
- Remaining players' scores and progress unaffected
- Leaderboard still tracks departed player's score

**AI Behavior (Temporary Player):**
- Follows nearest human player
- Basic attack pattern (throws spear at weak points)
- Doesn't use cocktails or items
- Attempts revives if teammate downed
- Doesn't dodge perfectly (will take hits)

## Session Management & Progression

### Failure Conditions

**Hunt Failure (Team Mode):**
- All players downed simultaneously
- Hunt timer expires (10 minutes, failsafe)
- Can retry failed hunt once before counting as true failure
- 3 total hunt failures = session ends (game over)

**Hunt Failure (Solo Mode):**
- Player runs out of lives (3 total)
- Each death costs 1 life
- Can continue session with remaining lives
- 0 lives = session ends

**Failure Consequence:**
- Retry screen: "TRY AGAIN?" with 10-second countdown
- Players vote (majority decides)
- Retry: Same hunt, same upgrades/cocktails
- Give up: Session ends, scores recorded

### Victory Conditions

**Hunt Success:**
- Dinosaur health reduced to 0
- All players (or solo player) survived
- Victory screen: Scores tallied, bonuses applied

**Session Complete (Beat 5th Hunt):**
- Epic victory screen with all players
- Final score calculation:
  - Total damage dealt
  - Perfect dodges (bonus multiplier)
  - Teammates saved (bonus)
  - Completion bonus (flat 500 points)
- MVP crowned (highest total score, gets crown icon)
- Session stats displayed:
  - Total session time
  - Highest single hunt score
  - Most saves, most perfect dodges
- "Add Initials" prompt for leaderboard entry

### Leaderboard System

**Daily Leaderboard (Resets Midnight):**
- Top 10 session scores
- Displays: Rank, Player Initials (3 chars), Total Score, MVP name
- Updates live after each completed session
- Shown during attract mode

**All-Time Leaderboard:**
- Top 50 best sessions ever
- Same format as daily
- Rarely changes (high bar for entry)

**Individual Player Stats:**
- Most MVPs (tracked by initials)
- Highest single hunt score
- Most perfect dodges in a session
- Most teammates saved
- Fastest session clear time

### Attract Mode (When Idle)

**Displays (Rotates Every 20 Seconds):**
1. **Replay Highlights:** Show best moments from recent sessions (auto-captured)
2. **Daily Leaderboard:** Scrolling top 10 with scores
3. **Cave Bar Scene:** Animated scene with dinosaur shadows walking past entrance
4. **Instruction Screen:** "HOW TO PLAY" with controller diagram
5. **Dinosaur Showcase:** Rotate through all 12 dinosaurs with stats

**Call-to-Action:**
- "PRESS START TO BEGIN" (pulsing text)
- "INSERT COIN" if coin-op mode enabled
- Controller icons show which controllers connected

**Timeout Behavior:**
- If player selects character but doesn't start hunt within 2 minutes: Return to attract
- If in cave bar and all players idle 2+ minutes: Return to attract
- Saves session progress (doesn't lose score)

## Technical Implementation

### Technology Stack

**Game Engine: Phaser 3**
- JavaScript framework for 2D browser games
- Excellent gamepad support (up to 4 simultaneous)
- Built-in sprite management, physics, input handling
- WebGL rendering for performance
- Large community, extensive documentation

**Deployment:**
- Browser-based (no installation required)
- Can package as standalone Electron app if needed
- Remote updates possible (change content without physical access)

**Why Phaser for Bar Game:**
- Cross-platform (runs on any device with browser)
- Quick iteration and testing
- Easy to update content remotely
- Proven performance for isometric games
- Strong gamepad API

### Core Systems Architecture

**CoordinateSystem.js**
- `worldToScreen(worldX, worldY, worldZ)`: Converts 3D world to 2D screen
- `screenToWorld(screenX, screenY)`: Inverse conversion (for mouse clicks if needed)
- `calculateDepth(worldY, worldZ)`: Depth sorting value
- Exports constants: TILE_WIDTH, TILE_HEIGHT, HEIGHT_SCALE

**EntityManager.js**
- Tracks all entities (players, dinosaurs, projectiles, items)
- Updates world positions based on velocities
- Converts to screen positions each frame via CoordinateSystem
- Manages entity lifecycle (spawn, update, destroy)
- Handles entity pooling (reuse projectiles)

**InputManager.js**
- Handles up to 4 gamepad controllers
- Maps D-pad + buttons to action events
- Input buffering (remember button press for 0.1s)
- Disconnection detection and recovery
- Supports keyboard fallback for testing

**CombatSystem.js**
- Damage calculations (base damage, weak point multipliers, buffs)
- Weak point hit detection (raycasts from player to weak point sphere)
- Dodge roll invincibility frame tracking
- Perfect dodge timing window detection
- Stagger threshold tracking per dinosaur
- Status effects (burn, slow, shield)

**DinosaurAI.js**
- Behavior state machines per dinosaur type
- States: Idle, Choosing Target, Telegraph, Attack, Recovery, Stagger
- Attack pattern scripting (sequenced attacks)
- Target selection logic (proximity, threat, isolation)
- Phase transitions for bosses (health thresholds)

**PhysicsManager.js**
- Custom 3D collision detection (not using Phaser physics)
- Sphere-vs-sphere collision (players, projectiles)
- Sphere-vs-box collision (players vs dinosaurs)
- Box-vs-box collision (dinosaurs vs environment)
- Height-aware collision (Z-axis matters)
- Spatial partitioning for performance (grid-based)

**UpgradeManager.js**
- Tracks player purchases (weapons, abilities, cocktails)
- Applies stat modifications to player entities
- Cocktail buff timers and effect application
- Point economy tracking per player
- Loadout serialization (for save/load if needed)

**SessionManager.js**
- Controls hunt progression (Hunt 1/5 → 2/5 → etc.)
- Manages scene transitions (Hunt → Cave Bar → Hunt)
- Tracks session scores and statistics
- Handles player join/leave
- Failure/victory condition checking
- Leaderboard updates

**ScoreManager.js**
- Real-time score tracking per player
- Event-driven point awards (damage, perfect dodge, save)
- Combo tracking and multiplier application
- Session total calculation
- Leaderboard entry formatting
- Stats aggregation (perfect dodges, saves, etc.)

### Scene Flow

```
AttractScene (idle, showing leaderboards)
  ↓ [Player presses start]
PlayerSelectScene (choose number of players, assign controllers)
  ↓ [All players ready]
HuntScene (active gameplay, dinosaur fight)
  ↓ [Dinosaur defeated]
CaveBarScene (upgrade purchases, 30-second timer)
  ↓ [Timer expires or all ready]
HuntScene (next hunt)
  ↓ [Cycle repeats 5 times]
VictoryScene (final scores, leaderboard entry)
  ↓ [Timeout or return to attract]
AttractScene

GameOverScene (if session failed)
  ↓ [Show scores, retry option]
AttractScene or retry HuntScene
```

### Performance Targets

**Target: 60 FPS on modest hardware**
- Phaser optimizations:
  - Sprite atlas (single texture for all sprites)
  - Object pooling (reuse projectiles, particles)
  - Depth pre-pass (batch render by depth)
  - Efficient collision (spatial partitioning)
- Particle effect limits:
  - Max 10 active particle emitters
  - Max 100 particles on screen
  - Short lifetimes (0.5-1 second)
- Audio:
  - Audio sprite sheets (single file, multiple sounds)
  - Preload all audio at start
  - Limit simultaneous sounds to 16

**Hardware Requirements:**
- Mid-range gaming PC (i5/Ryzen 5, GTX 1050 or equivalent)
- 8GB RAM
- SSD recommended for fast loading
- Dedicated GPU not strictly required (integrated works)

### Asset Estimates

**Sprites (Total: ~400 frames)**
- 4 player cavemen × 4 directions × 3 animations (idle, walk, attack) = 48 frames
- 12 dinosaurs × 4 directions × 4 animations (idle, attack, stagger, death) = 192 frames
- Projectiles, effects, UI elements = 50 assets
- Cave bar environment (background, bartender, props) = 30 assets
- Arena tiles, props, environmental features = 80 assets

**Audio (Total: ~80 sounds)**
- 12 dinosaur sound sets × 4 sounds each (roar, attack, hurt, death) = 48 sounds
- Player sounds (throw, hit, dodge, hurt, revive) = 12 sounds
- UI sounds (purchase, button, countdown, victory) = 10 sounds
- Music tracks (cave bar, hunt low/high intensity, boss) = 4 tracks
- Environmental ambience loops = 6 loops

**Total File Size Estimate:** ~200MB (sprite atlases, audio compressed)

### Development Phases & Timeline

**Phase 1: Core Mechanics (4-6 weeks)**
- Coordinate system and isometric rendering
- Player movement and basic D-pad controls
- One test dinosaur with simple AI (no attacks)
- Basic collision detection (sphere-vs-sphere)
- Camera following players

**Phase 2: Combat & Systems (4-6 weeks)**
- Weak point system implementation
- Telegraph and attack execution
- Dodge mechanics with invincibility frames
- Damage calculations and scoring
- Revival and downed states
- HUD implementation

**Phase 3: Content Creation (6-8 weeks)**
- All 12 dinosaurs with unique behaviors
- 6 arena environments with mechanics
- Cave bar scene and shop interactions
- Weapon variety and balance
- Cocktail buffs and effects
- Audio implementation

**Phase 4: Polish & Balance (2-4 weeks)**
- Difficulty tuning per dinosaur
- Player count scaling refinement
- Visual effects (particles, screen shake, camera zoom)
- Audio mixing and dynamic music
- Session flow and pacing adjustments
- Bug fixing

**Phase 5: Bar Integration (2-3 weeks)**
- Attract mode and leaderboards
- Controller disconnect handling gracefully
- Display calibration for bar screen size
- Volume controls and audio ducking
- Playtesting with real bar customers
- Final balance adjustments based on feedback

**Total Estimated Timeline: 18-27 weeks (4-6 months) with a small team**

**Team Composition:**
- 1-2 Programmers (Phaser, JavaScript)
- 1 Artist (2D sprites, animations, UI)
- 1 Sound Designer (SFX, music composition)
- 1 Designer/Producer (balance, coordination, testing)

## Deployment & Bar Operations

### Hardware Setup

**Display:**
- Large TV/monitor: 55"+ recommended for visibility
- 2560×1440 resolution (2K/QHD) for enhanced detail
- Mounted at standing eye level (bar patron height)
- Position: Visible from bar seating and standing areas
- HDMI connection to game PC

**Game PC:**
- Mid-range gaming PC or equivalent
- Specs: i5/Ryzen 5, 8GB RAM, GTX 1050 or integrated GPU
- Dedicated machine (not shared with POS or other bar systems)
- Wired ethernet connection (avoid WiFi input lag)
- SSD for fast boot and loading
- Runs game on startup (kiosk mode)

**Controllers:**
- 4× identical D-pad controllers with 2 triggers
- Options: Nintendo Switch Pro, Xbox D-pad mode, USB retro controllers
- Wired or low-latency wireless (2.4GHz dongle, NOT Bluetooth)
- Mounted controller station (wall-mount or bar-top shelf)
- 2× backup controllers available (for replacements)
- Charging station if wireless

**Audio:**
- Game audio output to bar sound system (aux/HDMI)
- Separate volume control for game vs bar music
- Ability to mute/lower game during peak hours or events
- Consider separate speaker near game screen for localized audio

**Physical Setup:**
- Controller station positioned near screen
- Clear sight line from playing position to screen (3-6 feet)
- Space for 4 players to stand comfortably side-by-side
- Spectator space behind/beside players (2-3 feet clearance)
- Cable management (avoid trip hazards)
- Signage: "Prehistoric Hunter - Up to 4 Players"

### Daily Operations

**Startup:**
- PC boots automatically on power-on
- Game launches in fullscreen on startup
- Attract mode begins automatically
- Daily leaderboard resets at configured time (e.g., opening time or midnight)

**Hands-Off Operation:**
- No staff intervention required during business hours
- Attract mode loops continuously when idle
- Players start sessions themselves
- Game auto-returns to attract after session completion or timeout

**Maintenance:**
- Weekly: Check controller battery levels, test all buttons
- Monthly: Clean screen and controllers
- As-needed: Restart PC if performance issues
- Software updates: Remote deployment via web, no physical access needed

**Staff Access:**
- Admin panel (hidden button combo): Access settings
- Volume control: Adjust game audio independently
- Reset to attract: If game stuck or abandoned mid-session
- View session stats: Daily play counts, peak hours

### Player Onboarding

**Passive Learning:**
- Attract mode "How to Play" screen (30-second loop)
- Simple illustrated instructions near controllers
- Controller diagram with button labels
- QR code linking to full rules/tips (optional)

**In-Game Tutorial:**
- First hunt of every session is slightly easier (extra health)
- On-screen button prompts during first hunt:
  - "Press RT to throw spear!"
  - "Press LT to dodge!"
  - "Press Y to switch targets"
- Bartender gives brief tips in cave bar (text callouts)

**Staff Training:**
- Bartenders learn 30-second explanation:
  - "Work together to hunt dinosaurs"
  - "Red buttons attack, triggers dodge"
  - "Buy upgrades between hunts at the cave bar"
  - "Highest score is MVP!"
- Staff cheat sheet behind bar

### Monetization Models

**Option 1: Free to Play (Recommended for Bar Amenity)**
- Game completely free for bar patrons
- Drives foot traffic and drink/food sales
- Encourages longer visits (higher tabs)
- Competitive leaderboard motivates return visits
- Marketing angle: "Play our exclusive dinosaur game!"

**Option 2: Coin-Op Style**
- Charge $2-5 per session (15-30 min)
- Requires coin acceptor or bill reader integration
- Direct revenue generation
- May reduce casual play / experimentation
- Good if bar has existing arcade cabinet setup

**Option 3: Hybrid Model**
- First session per patron free per visit
- Additional sessions: $2 or free with drink purchase
- Bartender provides token/code for free session with drink order
- Encourages game trial + drink sales

**Recommended:** Free to play as bar amenity. Game is marketing/experience investment, revenue comes from increased drink sales and repeat visits.

### Cross-Promotion with Real Bar

**Cocktail Menu Integration:**
- Real versions of in-game cocktails on bar menu
- Menu descriptions reference game: "Featured in Prehistoric Hunter!"
- Special pricing for MVP winners (show high score screen for discount)
- Themed drink specials on game tournament nights

**Example Real Cocktails:**
- Mammoth Mule: Moscow Mule with blue curaçao
- Raptor Rush: Spicy margarita with chili rim
- Dino Daiquiri: Classic frozen daiquiri
- Saber Slam: Purple berry vodka cocktail
- Tar Pit Tonic: Dark rum with activated charcoal (black drink)
- Volcano Mojito: Mojito with flaming garnish

**Events & Tournaments:**
- **Weekly Tournament Night:** Highest score wins free drink/appetizer
- **Monthly Championship:** Best session score wins physical trophy + bar tab
- **Team Competitions:** Groups of 4 compete, winning team gets pitcher/bottle
- **Social Media:** Post daily leaderboard photos, tag winners, encourage check-ins

**Physical Integration:**
- Game-themed decorations near screen (cave paintings, dinosaur props)
- "Hall of Fame" board showing all-time best scores
- Dinosaur-themed bar snacks (dino nuggets, fossil cookies)

### Analytics & Insights

**Automatic Tracking (Backend Logging):**
- Sessions played per day/week/month
- Peak playing hours (heatmap)
- Average session length
- Player count distribution (1p/2p/3p/4p sessions)
- Most popular dinosaurs (which get defeated most)
- Highest failure points (which hunts players lose most)
- Average scores and MVP rates
- Cocktail purchase frequencies (which buffs most popular)

**Business Value:**
- **Staffing:** Identify peak game hours for staffing optimization
- **Engagement:** Measure customer dwell time increase
- **Content:** Plan updates around player preferences and pain points
- **Marketing:** Share stats (e.g., "10,000 T-Rexes defeated this month!")
- **Balance:** Adjust difficulty if too many failures or too easy

**Privacy-Conscious:**
- No personal data collected (only initials for leaderboard)
- Aggregate statistics only
- Compliant with local privacy laws

### Content Updates

**Monthly Updates (Remote Deployment):**
- New dinosaur variants (seasonal themes)
- New arena variations
- Seasonal cocktail specials (Halloween, Christmas themes)
- Balance adjustments based on analytics
- Bug fixes and performance improvements

**Major Updates (Quarterly):**
- New boss dinosaurs
- New weapon types
- New passive abilities
- Special event modes (speed run, hard mode)

**Community Engagement:**
- Poll bar patrons on social media for new content ideas
- "Design a Dinosaur" contest
- Feature customer usernames/initials in updates

## Success Metrics & KPIs

### Player Engagement
- **Sessions per day:** Target 20-40 sessions during peak hours
- **Repeat players:** Track initials, aim for 30%+ returning players weekly
- **Average session length:** Target 20-25 minutes (indicates engagement)
- **Completion rate:** Target 40%+ sessions reaching hunt 5

### Business Impact
- **Increased dwell time:** Measure average patron visit length before/after game
- **Drink sales correlation:** Track drink orders near game area
- **Social media mentions:** Monitor tags, check-ins, posts about game
- **Foot traffic:** New customers citing game as reason for visit

### Technical Performance
- **Uptime:** Target 99%+ (minimal crashes or freezes)
- **Frame rate:** Maintain 60 FPS during all gameplay
- **Load times:** Arena transitions <3 seconds

## Future Expansion Ideas

### Potential Additions (Post-Launch)
- **New Dinosaur Packs:** Aquatic (Mosasaurus, Plesiosaurus), Flying (Pteranodon variants)
- **Challenge Modes:** Speed run (fastest clear time), No upgrades, Boss rush
- **Cosmetic Unlocks:** Caveman skins, weapon skins (earned via achievements)
- **Seasonal Events:** Halloween (zombie dinosaurs), Winter (ice age creatures)
- **Player Profiles:** Save loadout preferences, track personal stats over time
- **Online Leaderboards:** Compare with other bars running the game (multi-location)

### Franchise Opportunities
- **Other Bar Themes:** Pirate ship battles, space station defense, western shootouts
- **Licensing:** Offer game to other themed bars as white-label product
- **Mobile Companion App:** View leaderboards, get notified of tournaments, reserve play times

---

## Appendix: Design Principles

**Accessibility:**
- Visual feedback for all audio cues
- Colorblind mode options
- Simple controls, low barrier to entry
- Difficulty scales to player skill

**Spectator Experience:**
- All action visible on one screen
- Clear visual language (colors, icons, callouts)
- Dramatic moments that elicit crowd reactions
- Readable from 15+ feet away

**Bar Environment Fit:**
- Volume-conscious audio design
- Hands-off operation (no staff babysitting)
- Quick sessions (high turnover)
- Social gameplay (groups encouraged)
- Thematic integration with bar concept

**Replayability:**
- Randomized dinosaur selection (variety)
- Multiple viable strategies and builds
- Competitive scoring and leaderboards
- Skill mastery curve (easy to learn, hard to master)

**Monetization Alignment:**
- Game drives drink sales (primary revenue)
- Encourages repeat visits (leaderboard competition)
- Social sharing (word-of-mouth marketing)
- Low operational cost (remote updates, minimal maintenance)

---

**End of Design Document**

**Next Steps:**
1. Review and approve design
2. Assemble development team
3. Create detailed technical specification
4. Begin Phase 1: Core Mechanics prototype
5. Iterative playtesting and refinement

**Contact:** [Your contact information for questions/feedback]

**Version:** 1.0
**Last Updated:** 2026-01-18
