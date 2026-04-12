# Prehistoric Hunter - Sidescroller Game Design

**Project Type:** Custom 1-4 player cooperative dinosaur hunting game for a dinosaur-themed bar
**Target Platform:** PC with gamepad controllers on a large public display
**Format:** 2D sidescroller boss-brawler
**Session Length:** 15-30 minutes
**Version:** 1.0
**Last Updated:** 2026-04-12

## Executive Summary

Prehistoric Hunter is a cooperative sidescroller where players become cavemen hunters battling escalating dinosaur bosses across five hunts. The game is built for a bar environment: it is easy to join, readable from across the room, fast to understand, and full of dramatic spectator moments. Players cooperate to survive each hunt while competing for score, MVP status, and leaderboard placement.

The full session loop alternates between high-energy boss fights and a 30-second cave bar phase where players spend points on weapons, passive abilities, and cocktails. The core fantasy is simple and strong: survive the hunt, exploit weak points, save your teammates, return to the bar stronger, and take down larger and more dangerous dinosaurs.

## Core Pillars

### Spectator Readability

The game must be easy to read on a large screen in a noisy environment. Boss attacks need strong telegraphs, weak points need clear visual emphasis, and the camera must keep the full story of the fight understandable even to people who are not playing.

### Simple Controls, Deep Team Play

The control scheme is intentionally compact so first-time bar patrons can start quickly. Depth comes from timing, positioning, flanking, revive decisions, target focus, loadout choices, and weak point control.

### Cooperative Survival With Competitive Scoring

Players should feel like they win together while still chasing individual bragging rights. The scoring system rewards damage, skill expression, clutch saves, and high-pressure moments.

### Bar-Themed Identity

The cave bar is not just a menu. It is the social center of the game, the upgrade phase, the pacing reset between hunts, and a direct tie-in to the real venue.

## Session Structure & Flow

### Complete Session

A full session consists of five escalating hunts:

1. Warm-up Hunt (2 minutes)
2. Mid-tier Herbivore Hunt (3 minutes)
3. Aggressive Carnivore Hunt (4 minutes)
4. Elite Predator Hunt (5 minutes)
5. Apex Boss Hunt (7 minutes)

Each hunt is followed by a cave bar phase except the final hunt, which leads to the end-of-session victory flow.

### Scene Flow

The complete scene graph is:

1. `AttractScene`
2. `PlayerSelectScene`
3. `HuntScene` for Hunt 1
4. `CaveBarScene`
5. `HuntScene` for Hunt 2
6. `CaveBarScene`
7. `HuntScene` for Hunt 3
8. `CaveBarScene`
9. `HuntScene` for Hunt 4
10. `CaveBarScene`
11. `HuntScene` for Hunt 5
12. `VictoryScene`
13. Return to `AttractScene`

If the session fails, the flow routes to `GameOverScene` instead of `VictoryScene`.

### Cave Bar Phase

The cave bar phase lasts 30 seconds and serves four purposes:

- show current standings
- let players buy upgrades
- reveal the next hunt
- allow player join/leave changes between fights

The cave bar phase should feel quick, theatrical, and readable. It is the breathing space between encounters, not a complex management layer.

## Controls & Input

### Controller Layout

The game supports up to four gamepads. The default input model is:

- D-pad Left/Right: horizontal movement
- D-pad Up or `B`: jump
- Right Trigger: throw spear or fire current ranged weapon
- Left Trigger: dodge roll
- `A`: use equipped item or context action
- `X`: interact, revive, confirm at stations
- `Y`: cycle weak point target

Keyboard fallback can be provided for Player 1 during development.

### Input Principles

- the controls must work on simple gamepads with no reliance on dual-stick aiming
- movement and combat must remain readable under noisy bar conditions
- every important action needs immediate visual feedback

## Player Mechanics

### Movement

Players move left and right across the arena on the `worldX` axis. `worldY` represents vertical height. Movement is fast and responsive, with no player collision so teammates never block each other during combat or revives.

### Jump Physics

Jumping is a core combat tool, not just traversal. It allows players to:

- avoid ground hazards
- reach higher weak points
- access platforms
- engage climbing or liana routes

Target feel:

- jump velocity: +15 world units per second
- gravity: -40 world units per second squared
- peak height: roughly 2.8 world units
- total jump time: roughly 0.75 seconds

### Dodge Roll

The dodge roll is the defensive signature action.

- horizontal burst in current facing direction
- invincibility frames during the roll
- 3-second base cooldown
- airborne use becomes a short horizontal burst rather than a ground roll

The dodge is readable, generous enough for casual players, and precise enough for skilled players to exploit perfect timing.

### Downed State

Players are downed after taking enough hits to deplete their health.

- default durability: 2 hits before downed
- downed players collapse and can crawl slowly left or right
- a revive timer counts down from 10 seconds
- if all players are downed at once in team play, the hunt fails

### Revival

To revive a teammate:

- move to the downed player
- hold `X` for 2 seconds
- complete the revive without interruption

Successful revival grants:

- revived player returns with partial health
- both players get a brief defensive buffer or shield effect
- revive scorer earns points

This system is designed to create high-tension rescue moments that spectators immediately understand.

## Combat System

### Core Combat Loop

Every hunt follows a repeating boss-combat loop:

1. Telegraph
2. Attack execution
3. Recovery window
4. Stagger progress
5. Repeat until kill

### Telegraph Phase

Bosses announce attacks with strong visual and audio cues.

- head glow: bite or forward strike
- legs glow: charge, stomp, or rush
- tail glow: sweep or rear-area denial
- target indicator: highlights who is currently threatened

Telegraphs should be readable from across the bar and should teach the fight naturally.

### Attack Execution

Once committed, attacks should feel dangerous and decisive. The targeted player dodges or repositions while untargeted players look for punish windows on exposed weak points.

### Recovery Window

Recovery windows are the main damage phase. Bosses should leave openings long enough for coordinated punishment but short enough to keep pressure high.

### Stagger Break

Bosses stagger roughly every 25 percent of their health bar.

During stagger:

- boss becomes immobilized or collapses
- all weak points become more accessible
- damage taken increases substantially
- music and screen effects intensify

Staggers are major crowd moments and the ideal time to cash in offensive buffs.

## Weak Point System

### Weak Point Roles

The core weak point vocabulary is:

- Head: small, dangerous to approach, high-value damage
- Legs: accessible, consistent, often tied to slows or stumbles
- Tail or Rear: positional reward for flanking
- Back or Mid-body: accessible through jumps, climbing, or special positioning

### Height-Layered Weak Points

Weak points are distributed by height in the sidescroller:

- Legs: `worldY 0-2`
- Mid-body: `worldY 2-5`
- Back: `worldY 3-6`
- Head: `worldY 6-12`

This gives each encounter a readable vertical puzzle:

- melee players control the ground game
- jump attacks and platforms open mid-height targets
- ranged attacks and climb windows unlock upper weak points

### Weak Point States

Weak points can be:

- intact
- damaged
- broken

Breaking a weak point applies a meaningful debuff such as slowing the boss, exposing new punish windows, or disrupting a signature attack.

## Perfect Dodge Mechanic

Perfect dodge is one of the game’s main skill-expression systems.

- normal dodge: avoids danger
- perfect dodge: triggered in the final 0.5 seconds before impact

Perfect dodge rewards:

- 5 score bonus
- temporary damage buff
- dramatic visual callout
- satisfying audio confirmation

Beginners can survive with safe early dodges. Advanced players can chase risky late dodges for stronger offense and style points.

## Team Synergy Mechanics

### Focus Fire Bonus

When multiple players strike the same weak point in close succession, the game awards a combo multiplier. This encourages natural callouts like “everyone on the tail” and creates visible cooperative damage spikes.

### Revive Bonus

Clutch revives should feel heroic. Saving a teammate awards score and grants a short survivability window so the save can convert into momentum instead of immediately collapsing again.

### Role Emergence

The game should support natural roles without locking anyone into classes:

- frontline baiting and dodge experts
- ranged weak-point specialists
- support players who prioritize revives and control tools
- mobility-focused flankers

## Weapons & Equipment

### Primary Weapons

#### Stone Spear

- starting weapon
- balanced damage and reload
- full-arena usefulness
- good all-purpose option

#### Bone Club

- high damage
- short range
- slower attacks
- brief stun utility on hit

#### Bow

- lower damage per hit
- faster rate of fire
- ballistic arc
- ideal for ranged pressure and high weak point access

#### Net Launcher

- low direct damage
- immobilizes a weak point briefly
- strong team-support weapon
- best in coordinated groups

### Passive Abilities

#### Thick Hide

- increases survivability
- best for frontline and beginner players

#### Swift Feet

- shorter dodge cooldown
- supports aggressive mobility builds

#### Hunter's Eye

- larger weak point hitboxes
- makes precision play more forgiving and more rewarding

#### Pack Leader

- faster revives
- revived teammates gain a temporary damage boost

#### Scavenger

- bonus point gain from damage and combat contribution
- appeals to competitive score chasers

### Cocktails

Cocktails are short-term between-hunt buffs purchased from the bartender. Players can carry at most two into the next hunt.

#### Mammoth Mule

- movement speed increase

#### Raptor Rush

- attack speed and reload improvement

#### Dino Daiquiri

- regeneration over time

#### Saber Slam

- next few attacks deal heavily boosted damage

#### Tar Pit Tonic

- absorbs the next hit

#### Volcano Mojito

- attacks apply burn damage

### Example Loadouts

#### Tank Build

- Bone Club
- Thick Hide
- Dino Daiquiri
- Tar Pit Tonic

#### DPS Build

- Bow
- Hunter's Eye
- Saber Slam
- Raptor Rush

#### Support Build

- Net Launcher
- Pack Leader
- Mammoth Mule
- Dino Daiquiri

#### Kiter Build

- Bow
- Swift Feet
- Mammoth Mule
- Raptor Rush

## Dinosaur Roster & Behaviors

### Tier 1: Warm-Up Hunts

#### Compy Pack

- multiple small enemies
- swarm behavior
- circle and pounce from both sides
- good for teaching spacing and target priority

#### Dilophosaurus

- mid-range pressure
- poison spit and retreat patterns
- punishes player clumping

### Tier 2: Herbivores

#### Triceratops

- forward charges
- horn sweeps
- vulnerable after committed rushes
- strong flanking game around rear weak points

#### Stegosaurus

- heavy tail control
- slow turning
- ground control through sweep and stomp

### Tier 3: Aggressive Carnivores

#### Raptor Alpha

- pounce and isolation threat
- add summons at health thresholds
- punishes split positioning

#### Carnotaurus

- long horizontal charges
- enrage at 50 percent health
- rewards perfect dodge mastery

### Tier 4: Elite Predators

#### Spinosaurus

- water-themed control space
- repositioning attacks
- pressure through reach and mobility

#### Allosaurus

- multi-hit pressure
- add support
- rewards disciplined focus under chaos

### Tier 5: Apex Bosses

#### Tyrannosaurus Rex

- two-phase fight
- strong pattern recognition
- huge stagger payoff when brought low

#### Giganotosaurus

- more relentless than T-Rex
- shorter telegraphs
- high-end mastery boss

#### Quetzalcoatlus

- flying boss
- wing vulnerability during flight
- grounded punish windows after forced landings

## Boss Scale by Tier

### Tier 1

- roughly 1.5x to 2x player height
- small or group encounters
- 40 world unit arenas

### Tier 2

- roughly 4x player height
- 60 world unit arenas
- single-jump access to some upper body targets

### Tier 3

- roughly 3x to 4x player height
- 70 world unit arenas
- more arena-crossing aggression

### Tier 4 and 5

- roughly 8x to 10x player height
- 80 world unit arenas
- large vertical presence
- strong stagger spectacle

## Arena Design

### Arena Structure

Combat arenas are wider than one screen and scroll horizontally with the player group.

Standard rules:

- width: 60-80 world units
- fixed ground plane at `worldY = 0`
- 2-4 platforms depending on encounter
- camera follows the horizontal center of active players
- vertical framing remains fixed and readable

### Arena Themes

#### Jungle

- dense foliage and hanging vines
- liana traversal
- rolling log hazard

#### Volcanic

- obsidian platforms and lava glow
- falling boulder hazard

#### Tundra

- slick surfaces
- ice block hazard

#### Bone Graveyard

- giant rib structures and layered platforms
- falling rib hazard
- strong climbing and liana routes

#### Savanna

- open skill-test arena
- minimal cover
- ideal for apex encounters

#### Cave Bar Hub

- non-combat social space
- flat traversal
- interaction-focused layout

### Platform Rules

- one-way from below
- stable landing surfaces
- no overly fiddly precision platforming
- used mainly for combat positioning and access to elevated weak points

## Liana System

### Grab & Swing

Lianas appear in select arenas, primarily Jungle and Bone Graveyard.

Player interaction:

- approach a liana
- press `A` to grab
- swing based on current momentum
- release at the desired point in the arc

### Release Outcomes

- downswing release: quick ground drop
- mid-arc release: forward traversal
- apex release: maximum height and distance
- perfect apex release: bonus launch and empowered aerial hit

### Liana Strike

A perfect release can trigger a special opening hit:

- bonus damage
- bonus score
- strong callout text such as `LIANA STRIKE!`

Lianas should be flashy, optional, and beginner-friendly. Missing the perfect release should lose the bonus, not punish the player harshly.

### Hunt Openers

Arena-specific intros create spectacle before the first exchange:

- Jungle and Bone Graveyard: liana swing-in
- Volcanic: rappel descent
- Tundra: sliding entrance
- Savanna: direct sprint-in

## Climbing System

Medium and large bosses can expose grab zones.

Climbing rules:

- move toward a valid grab point while in contact
- latch onto the boss
- climb up or down
- attack nearby weak points while attached
- risk being shaken off by specific attacks

Climbing creates a second layer of combat readability: one player may bait on the ground while another scrambles up the creature for a back or head opening.

## Physics Hazards

Environmental hazards are timed events that threaten players and sometimes the boss.

### Jungle: Rolling Logs

- enter from screen edges
- jump to avoid
- can stumble smaller enemies or briefly disrupt bosses

### Volcanic: Falling Boulders

- shadow telegraph on the ground
- impact shockwave
- can heavily punish bosses if lured correctly

### Tundra: Ice Blocks

- fall, then slide
- ricochet behavior adds unpredictability
- can temporarily slow bosses

### Bone Graveyard: Falling Ribs

- heavily telegraphed collapse
- become temporary obstacles or platforms
- can separate players and bosses for a short window

Hazards should create tactical opportunities, not random frustration.

## Cave Bar Hub

### Purpose

The cave bar is the session’s pacing reset, shop, score readout, and social identity center.

### Core Set Pieces

- bartender station for cocktails
- weapon rack for loadout changes
- cave paintings for passive abilities
- scoreboard for live rankings
- trophy wall for defeated dinosaurs and upcoming hunt tease

### Visual Identity

- torchlit stone interior
- primitive furniture and bone props
- warm contrast to the danger of the arenas
- colorful player presence against earthy surroundings

### Bartender

The bartender is a gruff but likable Neanderthal host.

Functions:

- sells cocktails
- reacts to player performance
- gives the cave bar personality
- helps the game feel like part of the real venue

### Interaction Flow

#### Entering the Cave Bar

1. hunt result callout
2. fade from arena
3. player entrance animation
4. cave bar timer starts
5. upgrade interactions begin

#### Leaving the Cave Bar

1. countdown warning
2. players auto-route toward exit if needed
3. fade into next arena
4. hunt intro begins

### Trophy Wall

The trophy wall should:

- show all dinosaurs in silhouette or unlocked form
- reveal progress through the current session
- preview the next encounter
- give the room a strong “monster hunter lodge” identity

## Scoring System

### Point Sources

- damage dealt: 1 point per effective damage
- weak point hits: bonus reward
- perfect dodge: 5 points
- teammate save: 10 points
- first blood: 20 points
- killing blow: 20 points
- combo chains: multiplier moments

### End-of-Session Awards

The session finale should show:

- ranked total scores
- MVP crown
- most perfect dodges
- most saves
- highest damage contribution
- completion bonus
- total session time

### Leaderboards

#### Daily

- top 10 sessions
- reset daily

#### All-Time

- top 50 sessions

#### Personal Stat Tracking

- most MVPs
- highest single hunt score
- most perfect dodges in a session
- most saves
- fastest clear time

## Player Count Scaling

### Health Scaling

Boss health scales by active player count:

- 1 player: 100 percent
- 2 players: 160 percent
- 3 players: 210 percent
- 4 players: 240 percent

### Aggression Scaling

- solo: slower, clearer patterns
- 2-4 players: more target switching, more pressure, more add usage
- 4 players: highest aggression and shortest safe windows

### Join & Leave Rules

Players can join or leave during the cave bar phase.

Join behavior:

- spawn into the cave bar
- receive a catch-up score buffer or starting support
- next hunt recalculates difficulty

Leave behavior:

- if during hunt, character can finish as simple AI support
- if during cave bar, remove cleanly before next encounter

## Failure & Victory Conditions

### Hunt Failure

Team mode failure triggers when:

- all players are downed at once
- hunt failsafe timer expires

Solo mode uses lives instead of team revives.

### Session Failure

After repeated hunt failures, the session ends and routes to `GameOverScene`.

### Hunt Victory

Hunt victory requires defeating the current boss or all enemies in the encounter.

### Session Victory

After Hunt 5, the game routes to `VictoryScene` rather than back to the cave bar.

The final screen should:

- total all player scores
- award completion bonus
- crown MVP
- prompt for initials if leaderboard-worthy
- return to attract mode after completion or timeout

## Attract Mode

When idle, the game rotates through:

1. replay highlights
2. daily leaderboard
3. animated cave bar scene
4. controls and how-to-play screen
5. dinosaur showcase

The attract loop should always make the machine feel alive and welcoming to new players.

## Camera & Presentation

### Camera Rules

- horizontal follow of the player group
- keep active players visible
- zoom out when the group spreads
- slight emphasis zoom during stagger or major boss moments
- no disorienting cuts during active combat

### Big Spectator Moments

- boss intro stings
- weak point breaks
- stagger collapses
- near-death revives
- killing blows
- synchronized victory poses

### HUD

Top layer:

- player portraits
- health
- score
- buff icons
- hunt count
- hunt timer

Bottom or center emphasis:

- boss health bar
- weak point state indicators
- dynamic combat callouts

The HUD must remain readable at distance and never overwhelm the action.

## Visual Style

### Aesthetic Direction

- stylized cartoon prehistoric world
- bold silhouettes
- chunky readable motion
- high-contrast effects
- energetic rather than grim

### Player Readability

- four strong player colors
- matching projectile trails and UI accents
- strong action silhouettes for dodge, throw, jump, and downed states

### Dinosaur Readability

- exaggerated silhouettes
- clear telegraph poses
- visible weak point glow and break states
- dramatic but readable death and stagger animations

## Audio Design

### Music

- relaxed cave bar theme between hunts
- escalating hunt intensity layers
- dramatic spikes during stagger and danger states

### Critical Audio Cues

- boss telegraphs
- weak point breaks
- player down alerts
- countdown warnings
- victory and failure stings

### Accessibility Rule

Every critical audio cue must have an equally strong visual counterpart so the game remains playable in a loud bar and accessible to players who cannot rely on sound.

## Technical Implementation

### Technology Stack

- Phaser 3
- browser deployment
- gamepad-first input
- remote-friendly update model

### Core Systems

#### `InputManager`

- controller mapping
- keyboard fallback for development
- disconnection handling

#### `PhysicsManager`

- 2D movement and jump physics
- platform collision
- hazard interaction

#### `CombatSystem`

- damage resolution
- weak point checks
- dodge and perfect dodge timing
- stagger tracking
- status effects

#### `DinosaurAI`

- behavior state machines
- target selection
- telegraph and attack scripting
- phase logic

#### `SessionManager`

- scene progression across 5 hunts
- player state carry-over
- join/leave handling
- session win/loss routing

#### `ScoreManager`

- live score events
- end-of-session tally
- stat awards
- leaderboard formatting

### World Model

The canonical gameplay space is:

- `worldX`: horizontal travel
- `worldY`: vertical height

There is no extra depth axis in the core design. The camera is side-on, the arenas are built for left-right combat, and every system should treat this sidescroller view as the default reality of the game.

### Performance Targets

- 60 FPS on modest dedicated hardware
- fast scene transitions
- predictable controller response
- limited on-screen effect counts for bar reliability

## Asset Production Guidance

### Player Animation Set

Minimum set per character:

- idle
- run
- jump rise / peak / fall
- throw / attack
- dodge
- downed / crawl
- revive stand-up
- victory pose

### Dinosaur Animation Set

Minimum set per dinosaur:

- idle
- locomotion
- telegraph
- attack
- stagger
- death

### Environment Assets

- arena-specific platforms
- hazards
- cave bar props
- trophy wall states
- UI icon set for weapons, cocktails, abilities, and awards

## Deployment & Bar Operations

### Physical Setup

- 55-inch or larger display
- side-by-side standing room for up to 4 players
- reliable wired or low-latency controllers
- safe cable management
- attract mode running by default

### Daily Use

- boots directly into the game
- loops attract mode when idle
- requires no staff babysitting
- supports quick resets if abandoned

### Staff-Friendly Framing

Staff should be able to explain it in a sentence:

“Work together to hunt dinosaurs, buy upgrades in the cave bar between rounds, and whoever scores the most gets MVP.”

## Monetization & Venue Integration

### Preferred Model

Treat the game as a bar amenity first. The primary value is increased dwell time, repeat visits, drink sales, and a memorable identity for the venue.

### Real-World Tie-Ins

- in-game cocktails mirrored on the real menu
- tournament nights
- MVP prizes
- leaderboard photos and social posts
- themed decor around the machine

## Analytics & Success Metrics

### Engagement

- sessions per day
- average session length
- repeat player rate
- completion rate to Hunt 5

### Business Impact

- increased dwell time
- sales near the game area
- social sharing and check-ins
- game-driven return visits

### Technical Health

- uptime
- frame rate stability
- transition load times
- controller reliability

## Future Expansion

Potential future additions:

- new dinosaur packs
- special event hunts
- challenge modes
- cosmetic unlocks
- cross-venue leaderboard support

## Design Principles

### Easy to Start

A first-time player in a bar should understand the fantasy, controls, and immediate goal in under 30 seconds.

### Hard to Master

The long-term ceiling comes from timing, positioning, loadouts, weak point routing, and team coordination.

### Readable at Distance

If a spectator can understand who is in danger, what the boss is doing, and when the crowd should react, the game is doing its job.

### Built for Social Play

Every major system should support group excitement: revives, staggers, leader changes, close calls, and victory celebrations.

### The Bar and the Game Should Strengthen Each Other

The machine should feel native to the venue, and the venue should make the game feel like an attraction rather than a random screen in the corner.
