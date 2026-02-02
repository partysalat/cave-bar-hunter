# Cave Bar Scene Implementation Plan

**Created:** 2026-02-01
**Status:** Planning
**Dependencies:** Phase 2 Complete, Cave Bar Assets Generated

## Overview

Build the cave bar hub scene where players purchase upgrades, weapons, and cocktails between hunts. This is a 30-second social/strategy phase that breaks up combat and allows players to build their loadouts.

## Design Requirements Summary

**From:** `docs/design/2026-01-18-prehistoric-hunter-bar-game-design.md` (lines 435-531)

**Core Features:**
- Prehistoric cave interior with stone furniture and torches
- 4 players can move around and interact with stations
- 30-second timer between hunts
- Interactive stations: Bartender, Weapon Rack, Cave Paintings, Scoreboard, Trophy Wall
- Shop mechanics: weapons (150-300 pts), passive abilities (100-200 pts), cocktails (50-75 pts)
- Transition animations (enter from hunt, exit to next hunt)

**Visual Elements:**
- Stone bar counter (center-right)
- Bartender NPC (grunts, gestures, reacts to purchases)
- 4 color-coded wooden stools
- Weapon rack (left wall)
- Cave paintings (passive ability unlocks)
- Trophy wall (defeated dinosaurs)
- Scoreboard (session standings)
- Torches for lighting

## Asset Status

**✅ Available:**
- Cave floor tiles (4 types): cave-stone-floor, polished-cave-floor, cave-wall-base, decorative-floor
- Bar counter tiles (6 types): left-end, middle-platform, right-end, corner, platform, platform-edge
- Cave wall tiles (2 types): vertical, corner
- Cave wall props (3 types): barrier, straight, corner
- Props (10 types): bar-stool, bone-mug, cave-painting, scoreboard, torch-sconce, trophy-skull, weapon-rack
- **Bartender character (8 directions + 4 animations)** ✅
  - Base sprite: 8 directional rotations
  - custom-idle (16 frames/direction): cleaning mug animation
  - custom-serving (16 frames/direction): sliding drink animation
  - custom-victory (16 frames/direction): celebrating/fist pump
  - custom-disapproval (16 frames/direction): head shake, arms crossed

**All required assets are ready!**

## Implementation Tasks

### Task 0: ✅ COMPLETE - Bartender Character Assets

**Status:** ✅ Complete (Downloaded from PixelLab)
**Character ID:** 3ad07248-c934-4902-b955-a4f6f837889d

**Assets Located:**
- `assets/characters/bartender/rotations/` - 8 directional base sprites
- `assets/characters/bartender/animations/custom-idle/` - 16 frames per direction
- `assets/characters/bartender/animations/custom-serving/` - 16 frames per direction
- `assets/characters/bartender/animations/custom-victory/` - 16 frames per direction
- `assets/characters/bartender/animations/custom-disapproval/` - 16 frames per direction

**Next Step:** Add bartender to sprite sheet build system (see Task 0.1 below)

---

### Task 0.1: ✅ COMPLETE - Add Bartender to Sprite Sheet Build System

**Status:** ✅ Complete
**Estimated Time:** 15-30 minutes

**What was done:**
Updated `scripts/build-spritesheets.js` to include bartender character in the sprite sheet generation process.

**Generated Assets:**
- ✅ `assets/generated/spritesheets/bartender.png` (1.6MB) - Packed sprite sheet
- ✅ `assets/generated/spritesheets/bartender.json` (209KB) - Atlas with 512 frames
- ✅ Build script handles all 4 bartender animations (idle, serving, victory, disapproval)

**Frame Naming Convention:**
All bartender frames follow the format: `bartender-{animKey}-{direction}-{frameNum}`

Examples:
- `bartender-idle-south-0` through `bartender-idle-south-15`
- `bartender-serving-east-0` through `bartender-serving-east-15`
- `bartender-victory-north-west-0` through `bartender-victory-north-west-15`
- `bartender-disapproval-south-east-0` through `bartender-disapproval-south-east-15`

**Total:** 4 animations × 8 directions × 16 frames = 512 frames

---

### Task 1: Create CaveBarScene Foundation

**Priority:** High
**Dependencies:** None
**Estimated Time:** 2-3 hours

**Subtasks:**
1. Create `src/scenes/CaveBarScene.js`
   - Extend Phaser.Scene
   - Setup preload, create, update methods
   - Load all cave bar tiles and props
   - Load bartender sprite sheet atlas:
     ```javascript
     this.load.atlas('bartender',
       'assets/generated/spritesheets/bartender.png',
       'assets/generated/spritesheets/bartender.json'
     );
     ```

2. Implement basic scene structure:
   - Define cave bar dimensions (world units: ~20×15, smaller than hunt arenas)
   - Create background layer
   - Setup camera (fixed, centered on room)
   - Add lighting atmosphere (ambient + torch glows)

3. Build floor layout:
   - Tile cave-stone-floor as base (covers entire room)
   - Add polished-cave-floor accent tiles near bar counter
   - Add decorative-floor tiles in strategic locations

4. Add cave walls:
   - Place cave-wall-barrier props around room perimeter
   - Use cave-wall-straight for vertical sections
   - Use cave-wall-corner for corners
   - Ensure proper depth sorting (walls behind interior)

**Test Criteria:**
- Scene loads without errors
- Floor tiles render correctly
- Wall props create enclosed room feeling
- Camera shows entire room at once
- Depth sorting works (floor < props < walls)

**Files Created:**
- `src/scenes/CaveBarScene.js`
- `tests/scenes/CaveBarScene.test.js`

---

### Task 2: Build Bar Counter & Bartender Station

**Priority:** High
**Dependencies:** Task 0.1 (bartender sprite sheet), Task 1 (scene foundation)
**Estimated Time:** 3-4 hours

**Subtasks:**
1. Construct bar counter:
   - Place bar-counter-left-end at left edge
   - Repeat bar-counter-middle-platform for length (~4-5 tiles)
   - Place bar-counter-right-end at right edge
   - Position bar-counter-corner tiles for L-shape if needed
   - Bar positioned center-right of room (per design)

2. Create Bartender NPC entity:
   - Create `src/entities/Bartender.js` extending Entity
   - Load bartender from sprite sheet atlas in scene preload:
     ```javascript
     this.load.atlas('bartender',
       'assets/generated/spritesheets/bartender.png',
       'assets/generated/spritesheets/bartender.json'
     );
     ```
   - Create animations from atlas frames:
     - `bartender-idle-{direction}-{frame}` (16 frames/direction)
     - `bartender-serving-{direction}-{frame}` (16 frames/direction)
     - `bartender-victory-{direction}-{frame}` (16 frames/direction)
     - `bartender-disapproval-{direction}-{frame}` (16 frames/direction)
   - Position behind bar counter (worldY slightly higher for depth)
   - Implement idle animation loop as default state

3. Add bar stools:
   - Place 4 bar-stool props in front of counter
   - Position for player interaction zones
   - Color-code or mark stools for players (optional visual indicator)

4. Add bar props:
   - Place bone-mug props on counter
   - Add decorative elements (minor props)

5. Implement bartender animation system:
   - Idle loop (default state)
   - Trigger serving animation on drink purchase
   - Trigger celebrating on high-score player purchase
   - Trigger disapproving on low-score player (optional flavor)

**Test Criteria:**
- Bar counter renders as cohesive structure
- Bartender sprite visible behind counter
- Bartender plays idle animation loop
- Bar stools positioned for player access
- Depth sorting correct (counter platform, bartender, stools)

**Files Created/Modified:**
- `src/entities/Bartender.js`
- `src/scenes/CaveBarScene.js` (add bartender)
- `tests/entities/Bartender.test.js`

---

### Task 3: Implement Player Movement in Cave Bar

**Priority:** High
**Dependencies:** Task 1
**Estimated Time:** 2-3 hours

**Subtasks:**
1. Spawn players in cave bar:
   - Use existing Player entities from hunt scene
   - Position players at cave entrance (worldX, worldY spawn points)
   - Maintain player indices and colors from previous hunt

2. Enable D-pad movement:
   - Reuse InputManager for movement controls
   - Set movement speed (slower than hunt scene, exploration pace)
   - Apply collision boundaries (can't walk through walls/props)

3. Implement collision system:
   - Create collision zones for walls (cave-wall props)
   - Create collision zones for props (bar counter, weapon rack, etc.)
   - Players can walk around but not through objects
   - Use PhysicsManager for collision detection

4. Add entry animation:
   - Players walk in through cave entrance one by one (staggered timing)
   - Brief animation/effect on entry
   - Camera focused on entrance, then follows players

**Test Criteria:**
- 4 players spawn at entrance
- D-pad controls move players around room
- Players cannot walk through walls or props
- Movement feels responsive and smooth
- Players can navigate to all interaction stations

**Files Modified:**
- `src/scenes/CaveBarScene.js` (player spawning, movement)
- `src/systems/PhysicsManager.js` (if collision zones needed)

---

### Task 4: Create Weapon Rack Station

**Priority:** Medium
**Dependencies:** Task 1, Task 3
**Estimated Time:** 3-4 hours

**Subtasks:**
1. Place weapon rack prop:
   - Position on left wall (per design)
   - Add weapon-rack sprite
   - Create interaction zone (proximity trigger)

2. Implement interaction system:
   - Detect player proximity to weapon rack
   - Show "Press X to View Weapons" prompt when in range
   - Open weapon shop menu on X button press

3. Create weapon shop UI:
   - Create `src/ui/WeaponShopMenu.js`
   - Display available weapons with icons, stats, prices
   - Show player's current points
   - Highlight affordable weapons
   - Show currently equipped weapon

4. Weapon purchase logic:
   - Deduct points on purchase
   - Equip new weapon immediately
   - Visual feedback: weapon appears in player's hand
   - Weapon rack shows old weapon placed, new weapon taken
   - Update player's weapon entity

5. Weapon data structure:
   - Create `src/data/weapons.js` with all weapon definitions:
     - Stone Spear (free, default)
     - Bone Club (200 pts)
     - Sling (150 pts)
     - Fire Spear (300 pts)
     - Net Launcher (250 pts)
   - Each weapon: name, description, damage, fire rate, range, price

**Test Criteria:**
- Weapon rack visible on left wall
- Proximity detection works
- Prompt appears when player near rack
- Menu opens on X button press
- Can scroll through weapons
- Purchase deducts points correctly
- Player sprite updates to show new weapon
- Menu closes and player can move away

**Files Created:**
- `src/ui/WeaponShopMenu.js`
- `src/data/weapons.js`
- `tests/ui/WeaponShopMenu.test.js`

**Files Modified:**
- `src/scenes/CaveBarScene.js` (interaction zones)
- `src/entities/Player.js` (weapon equip logic)

---

### Task 5: Create Cave Painting Passive Ability Station

**Priority:** Medium
**Dependencies:** Task 1, Task 3
**Estimated Time:** 3-4 hours

**Subtasks:**
1. Place cave painting props:
   - Position 5 cave-painting sprites on walls around room
   - Each painting represents one passive ability
   - Create interaction zones for each painting

2. Design painting visual states:
   - Locked: Dark/grayed out (not enough points)
   - Available: Glowing/highlighted (can afford)
   - Purchased: Bright glow, checkmark/icon (already owned)

3. Create passive ability data:
   - Create `src/data/passiveAbilities.js`:
     - Thick Hide (150 pts): +1 hit before downed
     - Swift Feet (100 pts): Dodge cooldown 3s → 2s
     - Hunter's Eye (150 pts): Weak point hitboxes +30%
     - Pack Leader (100 pts): Revive speed +50%, bonus damage to revived
     - Scavenger (200 pts): +25% bonus points

4. Implement ability shop interaction:
   - Proximity detection for each painting
   - Show ability description and price on approach
   - Purchase with X button
   - Painting glows brighter on purchase
   - Buff icon appears above player head

5. Apply passive ability effects:
   - Modify player stats on purchase (in Player entity)
   - Effects persist for entire session
   - Multiple abilities can stack
   - Display active abilities in player HUD

**Test Criteria:**
- 5 cave paintings visible on walls
- Each painting shows correct ability info
- Visual states update based on affordability/ownership
- Purchase applies ability effect to player
- Buff icon displays above player
- Abilities persist through scene transitions
- Multiple abilities can be purchased and stack

**Files Created:**
- `src/ui/AbilityPaintingUI.js`
- `src/data/passiveAbilities.js`
- `tests/ui/AbilityPaintingUI.test.js`

**Files Modified:**
- `src/scenes/CaveBarScene.js` (painting interactions)
- `src/entities/Player.js` (ability effects)

---

### Task 6: Create Bartender Cocktail Shop

**Priority:** Medium
**Dependencies:** Task 2, Task 3
**Estimated Time:** 3-4 hours

**Subtasks:**
1. Implement bartender interaction:
   - Proximity detection when player approaches bar counter
   - Show "Press X to Order Drink" prompt
   - Open cocktail menu on X button

2. Create cocktail shop UI:
   - Create `src/ui/CocktailMenu.js`
   - Display 6 cocktail options with icons, effects, prices
   - Show player's current points
   - Highlight affordable cocktails
   - Display "Max 2 per hunt" limit

3. Cocktail data structure:
   - Create `src/data/cocktails.js`:
     - Mammoth Mule (50 pts): +25% movement speed
     - Raptor Rush (75 pts): +30% attack speed
     - Dino Daiquiri (75 pts): Regenerate 1 HP / 10s
     - Saber Slam (75 pts): Next 3 attacks deal 2× damage
     - Tar Pit Tonic (75 pts): Absorbs next hit (1-hit shield)
     - Volcano Mojito (50 pts): All attacks apply burn effect

4. Purchase and consumption:
   - Limit: 2 cocktails per player per hunt
   - Purchase deducts points
   - Bartender serving animation plays
   - Player "chugs" drink (brief animation)
   - Buff icon appears above player head
   - Effects apply for next hunt

5. Bartender reactions:
   - Serving animation on purchase
   - Celebratory animation if player has high score
   - Grunt approval: "UGH! GOOD CHOICE!"

**Test Criteria:**
- Bartender proximity detection works
- Menu opens showing 6 cocktails
- Can purchase up to 2 cocktails per player
- 3rd purchase attempt shows "Max 2 per hunt" warning
- Bartender serving animation plays
- Buff icons display above player
- Points deduct correctly
- Effects persist to next hunt scene

**Files Created:**
- `src/ui/CocktailMenu.js`
- `src/data/cocktails.js`
- `tests/ui/CocktailMenu.test.js`

**Files Modified:**
- `src/scenes/CaveBarScene.js` (bartender interaction)
- `src/entities/Bartender.js` (reaction animations)
- `src/entities/Player.js` (cocktail buffs)

---

### Task 7: Implement Scoreboard Display

**Priority:** Low (nice-to-have)
**Dependencies:** Task 1
**Estimated Time:** 1-2 hours

**Subtasks:**
1. Place scoreboard prop:
   - Position scoreboard stone on wall
   - Make it prominent and visible from anywhere in room

2. Create scoreboard UI:
   - Create `src/ui/ScoreboardDisplay.js`
   - Show current hunt number (Hunt X/5)
   - Display all 4 players ranked by score
   - Highlight current MVP (crown icon)
   - Update in real-time

3. Integrate with ScoreManager:
   - Pull scores from existing ScoreManager system
   - Calculate rankings
   - Display score breakdown (damage, dodges, saves)

**Test Criteria:**
- Scoreboard visible on wall
- Shows hunt progress (X/5)
- Lists all players with current scores
- Ranks players correctly
- MVP has crown icon
- Updates reflect previous hunt results

**Files Created:**
- `src/ui/ScoreboardDisplay.js`
- `tests/ui/ScoreboardDisplay.test.js`

**Files Modified:**
- `src/scenes/CaveBarScene.js` (scoreboard rendering)

---

### Task 8: Implement Trophy Wall Display

**Priority:** Low (nice-to-have)
**Dependencies:** Task 1
**Estimated Time:** 1-2 hours

**Subtasks:**
1. Place trophy wall:
   - Position trophy-skull props on wall
   - Arrange to display defeated dinosaurs

2. Create trophy display system:
   - Create `src/ui/TrophyWallDisplay.js`
   - Show silhouettes of all 12 dinosaurs
   - Defeated dinosaurs: full art + checkmark
   - Upcoming dinosaur: glowing silhouette
   - Creates anticipation for next hunt

3. Track hunt progress:
   - Integrate with session state (which dinosaurs defeated)
   - Update trophy wall after each hunt
   - Show next dinosaur revealed

**Test Criteria:**
- Trophy wall visible
- Defeated dinosaurs show as complete
- Next dinosaur highlighted
- Future dinosaurs show as silhouettes
- Updates after each hunt completion

**Files Created:**
- `src/ui/TrophyWallDisplay.js`
- `tests/ui/TrophyWallDisplay.test.js`

**Files Modified:**
- `src/scenes/CaveBarScene.js` (trophy wall)

---

### Task 9: Implement 30-Second Timer & Transition System

**Priority:** High
**Dependencies:** All interaction tasks (4, 5, 6)
**Estimated Time:** 2-3 hours

**Subtasks:**
1. Create countdown timer:
   - Display 30-second timer on screen
   - Timer starts when scene begins
   - Visual countdown (30...29...28...)
   - Audio beeps at 10, 5, 4, 3, 2, 1

2. Ready-up system (optional):
   - "All players ready?" prompt
   - Players can press button to ready up
   - If all ready before timer, skip to next hunt
   - If not all ready, wait for timer

3. Exit transition:
   - At timer=5s, show "GET READY!" warning
   - At timer=0s, trigger exit sequence
   - Players auto-walk to cave exit
   - Bartender waves farewell
   - Fade to black
   - Load next hunt scene

4. Scene flow management:
   - Create `src/systems/SessionManager.js` (if not exists)
   - Track hunt progression (1/5 → 2/5 → etc.)
   - Store player loadouts (weapons, abilities, cocktails)
   - Pass data to next hunt scene

**Test Criteria:**
- Timer displays and counts down
- Countdown beeps play at correct times
- Exit transition triggers at 0 seconds
- Players exit cave bar smoothly
- Next hunt scene loads with player data preserved
- Can optionally skip via ready-up

**Files Created/Modified:**
- `src/systems/SessionManager.js`
- `src/scenes/CaveBarScene.js` (timer, transitions)
- `tests/systems/SessionManager.test.js`

---

### Task 10: Add Entry Transition from Hunt Scene

**Priority:** High
**Dependencies:** Task 3, Task 9
**Estimated Time:** 2-3 hours

**Subtasks:**
1. Hunt victory screen:
   - Create brief "HUNT COMPLETE!" screen after dinosaur defeat
   - Show hunt completion (2 seconds)
   - Display individual scores for that hunt
   - Camera zoom out from arena

2. Entry animation:
   - Fade to cave bar entrance
   - Players walk in through entrance one by one (staggered 0.3s apart)
   - Bartender acknowledges arrival (grunts)
   - 30-second timer starts

3. Data transfer:
   - Pass player scores from hunt to cave bar
   - Preserve player indices and colors
   - Transfer current session state (hunt #, total scores)

**Test Criteria:**
- Hunt victory screen displays correctly
- Smooth fade transition to cave bar
- Players enter with staggered timing
- Bartender reacts to arrival
- All player data preserved (scores, colors, weapons)
- Timer starts automatically on entry

**Files Modified:**
- `src/scenes/HuntScene.js` (or equivalent, victory screen)
- `src/scenes/CaveBarScene.js` (entry logic)
- `src/systems/SessionManager.js` (scene transitions)

---

### Task 11: Add Lighting & Atmosphere

**Priority:** Low (polish)
**Dependencies:** Task 1
**Estimated Time:** 1-2 hours

**Subtasks:**
1. Place torches:
   - Position torch-sconce props on walls
   - Distribute around room perimeter
   - ~6-8 torches for even lighting

2. Add torch flame animations:
   - Create flickering flame sprites (4-frame loop)
   - Attach to each torch sconce
   - Orange glow effect

3. Ambient lighting:
   - Add warm color overlay (orange/yellow tint)
   - Subtle vignette effect
   - Makes cave feel cozy, not dark

4. Particle effects (optional):
   - Torch smoke particles (subtle, upward drift)
   - Dust motes floating in light beams
   - Adds life to scene

**Test Criteria:**
- Torches placed evenly around room
- Flames flicker realistically
- Room has warm, inviting atmosphere
- Not too dark, all elements visible
- Performance remains at 60 FPS

**Files Modified:**
- `src/scenes/CaveBarScene.js` (lighting)

---

### Task 12: Polish & Bug Fixes

**Priority:** Medium
**Dependencies:** All tasks
**Estimated Time:** 2-3 hours

**Subtasks:**
1. Test all interactions:
   - Weapon rack purchase flow
   - Cave painting ability purchases
   - Bartender cocktail orders
   - Timer countdown
   - Transitions (entry, exit)

2. Fix depth sorting issues:
   - Ensure props render in correct order
   - Players should appear in front of floor, behind some walls
   - Bartender behind counter

3. UI polish:
   - Menu alignment and spacing
   - Button prompts appear/disappear smoothly
   - Consistent font and styling

4. Audio integration:
   - Bartender grunt sounds
   - Purchase confirmation sounds
   - Timer beeps
   - Ambient cave atmosphere

5. Performance optimization:
   - Ensure 60 FPS maintained
   - Optimize sprite loading
   - Reduce unnecessary updates

**Test Criteria:**
- All interactions work smoothly
- No visual glitches or z-fighting
- Audio plays at appropriate times
- Menus are clear and readable
- Performance is smooth (60 FPS)
- No console errors

---

## Testing Strategy

**Unit Tests:**
- Bartender entity behavior
- Shop menu logic (point deduction, purchase limits)
- Session state management
- Transition triggers

**Integration Tests:**
- Player movement within cave bar
- Interaction system (proximity, prompts, menus)
- Data persistence across scene transitions
- Timer and exit flow

**Manual Playtest Checklist:**
- [ ] 4 players can enter cave bar
- [ ] Players can move around freely
- [ ] Weapon rack opens and allows purchases
- [ ] Cave paintings allow ability purchases
- [ ] Bartender serves cocktails (max 2 per player)
- [ ] Scoreboard displays current standings
- [ ] Trophy wall shows defeated dinosaurs
- [ ] Timer counts down from 30 seconds
- [ ] Players exit smoothly at timer=0
- [ ] Next hunt scene loads with preserved data
- [ ] All visual elements render correctly
- [ ] No performance issues

---

## Implementation Order

**Phase 1 - Foundation (Tasks 0.1, 1, 2, 3):**
- ~~Generate bartender assets~~ ✅ Complete
- Add bartender to sprite sheet build system
- Build scene structure
- Add bar counter and bartender
- Enable player movement

**Phase 2 - Core Interactions (Tasks 4, 5, 6):**
- Weapon rack shop
- Cave painting abilities
- Bartender cocktails

**Phase 3 - Session Flow (Tasks 9, 10):**
- Timer system
- Entry/exit transitions
- Session management

**Phase 4 - Polish (Tasks 7, 8, 11, 12):**
- Scoreboard display
- Trophy wall
- Lighting and atmosphere
- Bug fixes and optimization

---

## Estimated Timeline

**With focused development:**
- Phase 1: 7.5-9.5 hours (saved 30-60 min on bartender generation)
- Phase 2: 9-12 hours
- Phase 3: 4-6 hours
- Phase 4: 4-6 hours

**Total: 24.5-33.5 hours (3-4 full days or 1-2 weeks part-time)**

---

## Success Criteria

**Minimum Viable Product (MVP):**
- ✅ Scene loads and displays cave bar environment
- ✅ Players can move around and interact with stations
- ✅ Weapon rack allows weapon purchases
- ✅ Bartender serves cocktails (max 2 per player)
- ✅ Timer counts down and triggers exit
- ✅ Smooth transitions to/from hunt scenes
- ✅ All purchases persist to next hunt

**Full Feature Set:**
- ✅ All MVP features
- ✅ Cave painting passive abilities
- ✅ Scoreboard displays rankings
- ✅ Trophy wall shows progress
- ✅ Lighting and atmosphere polish
- ✅ Audio integration
- ✅ All 4 players can interact simultaneously

---

## Dependencies & Risks

**External Dependencies:**
- ~~Bartender assets must be generated~~ ✅ Complete (Task 0)
- Bartender must be added to sprite sheet build system (Task 0.1)
- Existing Player entity must support weapon/ability/cocktail buffs
- SessionManager or equivalent must exist for scene transitions

**Technical Risks:**
- Depth sorting with many props may be complex
- Interaction zones must not overlap or conflict
- 4 players interacting simultaneously could cause UI conflicts
- Menu system must be gamepad-friendly (no mouse)

**Mitigation:**
- ~~Start with bartender asset generation immediately~~ ✅ Assets ready
- Use existing Entity framework for consistent depth sorting
- Implement interaction queue if multiple players approach same station
- Design menus for D-pad navigation from the start

---

## Future Enhancements (Post-MVP)

- Drop-in/drop-out player support during cave bar phase
- Animated bartender responses based on player performance
- More cocktail variety (seasonal specials)
- Visual loadout preview (see equipped items on character)
- Social animations (players can high-five, celebrate together)
- Minigames during cave bar phase (optional, if time permits)

---

**Plan Complete - Ready for Implementation**
