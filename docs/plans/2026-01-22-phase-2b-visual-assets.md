# Prehistoric Hunter - Phase 2b: Visual Assets & Animation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Generate all visual assets using PixelLab MCP and implement sprite rendering to replace placeholder graphics.

**Duration:** 4-6 weeks (parallel with gameplay development)

**Dependencies:**
- Phase 2 complete (combat systems implemented)
- PixelLab MCP server configured and accessible
- Asset directory structure created

**Reference:**
- UI Design document: `docs/design/2026-01-19-ui-sprite-design.md`
- Game Design document: `docs/design/2026-01-18-prehistoric-hunter-bar-game-design.md`

---

## Asset & Animation Catalog

This section documents ALL assets needed and their animation requirements.

### Player Characters (4 color variants)

**Base Sprites:**
- Red Hero Champion
- Blue Hero Champion
- Yellow Hero Champion
- Green Hero Champion

**Animation Structure:**

Each character requires two categories of animations:
1. **Weapon-Agnostic Animations** - Same regardless of equipped weapon
2. **Weapon-Specific Animation Sets** - Full locomotion + attack for each weapon type

**Note:** These animations are for **combat during hunts** (fast-paced, running movement). Walking animations for the cave bar hub (slower exploration) can be added later if needed.

---

### Weapon-Agnostic Animations (6 animations × 4 colors = 24 total)

These animations don't change based on equipped weapon:

1. **Dodge Roll Animation**
   - **Template:** Custom `dodge-roll`
   - **Action:** "quick evasive roll"
   - **Duration:** 4-6 frames
   - **Use:** Invincibility frame dodge (0.5s duration)
   - **Loop:** No
   - **Status (Red Hero):** ✅ Complete

2. **Taking Damage Animation**
   - **Template:** `taking-punch`
   - **Action:** "recoiling from hit, brief stagger"
   - **Duration:** 3-4 frames
   - **Use:** When player takes damage (not downed yet)
   - **Loop:** No
   - **Status (Red Hero):** ✅ Complete

3. **Downed State Animation**
   - **Template:** `falling-back-death`
   - **Action:** "falling down injured, crawling on ground"
   - **Duration:** 8 frames (fall + crawl cycle)
   - **Use:** When player health reaches 0, crawling while downed
   - **Loop:** Yes (crawling portion)
   - **Status (Red Hero):** ✅ Complete

4. **Reviving Teammate Animation** (Performing Revive)
   - **Template:** `picking-up`
   - **Action:** "kneeling down helping fallen teammate, pulling them up"
   - **Duration:** 6-8 frames
   - **Use:** When holding X button to revive downed teammate (2-second action)
   - **Loop:** Yes (held during revive duration)
   - **Status (Red Hero):** ✅ Complete

5. **Being Revived Animation**
   - **Template:** `getting-up`
   - **Action:** "standing up after being helped by teammate"
   - **Duration:** 6 frames
   - **Use:** When teammate completes 2-second revive action
   - **Loop:** No
   - **Status (Red Hero):** ✅ Complete

6. **Victory Pose Animation**
   - **Template:** `fight-stance-idle-8-frames`
   - **Action:** "celebrating victory - unique per color: fist pump (red), spear raise (blue), cheer (yellow), triumphant stance (green)"
   - **Duration:** 8 frames
   - **Use:** Hunt victory screen, synchronized celebration
   - **Loop:** Yes (hold pose)
   - **Status (Red Hero):** 🔄 Generating (ETA: 2-4 minutes)

---

### Weapon-Specific Animation Sets

Each weapon requires a complete locomotion + attack set (4 animations per weapon: idle/run/jump/attack):

**Priority Weapons: Club, Spear, Slingshot** (3 weapons × 4 animations × 4 colors = 48 animations)

---

#### 1. Stone Spear Set (Default Weapon)

**Spear Idle Animation**
- **Template:** `breathing-idle`
- **Action:** "standing alert holding stone spear vertically, scanning for danger"
- **Weapon Visual:** Stone spear weapon with wrapped leather grip, primitive prehistoric spear
- **Duration:** 6-8 frames
- **Loop:** Yes
- **Status (Red Hero):** ✅ Complete

**Spear Run Animation**
- **Template:** `running-8-frames`
- **Action:** "running with stone spear held ready to throw, fast combat movement"
- **Weapon Visual:** Stone spear weapon with wrapped leather grip, primitive prehistoric spear
- **Duration:** 8 frames
- **Loop:** Yes
- **Status (Red Hero):** ✅ Complete

**Spear Jump Animation**
- **Template:** `jumping-1`
- **Action:** "jumping upward while holding stone spear"
- **Weapon Visual:** Stone spear weapon with wrapped leather grip, primitive prehistoric spear
- **Duration:** 6-8 frames
- **Loop:** No
- **Status (Red Hero):** ✅ Complete

**Spear Throw Attack Animation**
- **Template:** `custom-throw-a-spear`
- **Action:** "throwing stone spear with wind-up motion, ranged attack"
- **Weapon Visual:** Stone spear weapon with wrapped leather grip, primitive prehistoric spear
- **Duration:** 16 frames
- **Loop:** No
- **Status:** ✅ Complete (All Heroes)

---

#### 2. Wooden Club Set (Melee Weapon)

**Club Idle Animation**
- **Template:** `breathing-idle`
- **Action:** "standing alert holding wooden club over shoulder, ready stance"
- **Weapon Visual:** Primitive wooden club with thick rounded knob head, natural wood grain texture, rough bark on handle
- **Duration:** 6-8 frames
- **Loop:** Yes
- **Status (Red Hero):** 🔲 Not Started

**Club Run Animation**
- **Template:** `running-8-frames`
- **Action:** "running with wooden club held over shoulder, aggressive charge"
- **Weapon Visual:** Primitive wooden club with thick rounded knob head, natural wood grain texture, rough bark on handle
- **Duration:** 8 frames
- **Loop:** Yes
- **Status (Red Hero):** 🔲 Not Started

**Club Jump Animation**
- **Template:** `jumping-1`
- **Action:** "jumping upward while gripping wooden club"
- **Weapon Visual:** Primitive wooden club with thick rounded knob head, natural wood grain texture, rough bark on handle
- **Duration:** 6-8 frames
- **Loop:** No
- **Status (Red Hero):** 🔲 Not Started

**Club Swing Attack Animation**
- **Template:** `custom-swing-a-club`
- **Action:** "swinging wooden club in wide arc, powerful melee strike"
- **Weapon Visual:** Primitive wooden club with thick rounded knob head, natural wood grain texture, rough bark on handle
- **Duration:** 6 frames
- **Loop:** No
- **Status (Red Hero):** ✅ Complete

---

#### 3. Sling Set (Ranged Weapon)

**Sling Idle Animation**
- **Template:** `breathing-idle`
- **Action:** "standing alert holding leather sling, stone loaded in pouch"
- **Weapon Visual:** Leather sling with stone ammunition pouch, prehistoric ranged weapon
- **Duration:** 6-8 frames
- **Loop:** Yes
- **Status (Red Hero):** 🔲 Not Started

**Sling Run Animation**
- **Template:** `running-8-frames`
- **Action:** "running with sling held ready, stone loaded, fast combat movement"
- **Weapon Visual:** Leather sling with stone ammunition pouch, prehistoric ranged weapon
- **Duration:** 8 frames
- **Loop:** Yes
- **Status (Red Hero):** 🔲 Not Started

**Sling Jump Animation**
- **Template:** `jumping-1`
- **Action:** "jumping upward while holding leather sling"
- **Weapon Visual:** Leather sling with stone ammunition pouch, prehistoric ranged weapon
- **Duration:** 6-8 frames
- **Loop:** No
- **Status (Red Hero):** 🔲 Not Started

**Sling Throw Attack Animation**
- **Template:** `custom-throw-a-slingshot`
- **Action:** "spinning sling overhead and releasing stone projectile"
- **Weapon Visual:** Leather sling with stone ammunition pouch, prehistoric ranged weapon
- **Duration:** 8-10 frames
- **Loop:** No
- **Status:** ✅ Complete (All Heroes)

---

#### 4. Fire Spear Set (Future - Tier 2 Upgrade)

**Status:** 🔲 Deprioritized - Generate after core weapons complete

- Fire Spear Idle (with flaming tip visual)
- Fire Spear Run (with flaming tip visual)
- Fire Spear Jump (with flaming tip visual)
- Fire Spear Throw Attack (with fire trail effect)

---

#### 5. Net Launcher Set (Future - Support Weapon)

**Status:** 🔲 Deprioritized - Generate after core weapons complete

- Net Launcher Idle (crossbow-style weapon)
- Net Launcher Run (crossbow-style weapon)
- Net Launcher Jump (crossbow-style weapon)
- Net Launcher Throw Attack (launches net projectile)

---

### Animation Summary

**Weapon-Agnostic Animations:** 6 animations × 4 colors = **24 animations**

**Priority Weapon Sets (Spear/Club/Sling):**
- 3 weapons × 4 animations each × 4 colors = **48 animations**

**Future Weapon Sets (Fire Spear/Net Launcher):**
- 2 weapons × 4 animations each × 4 colors = **32 animations** (deprioritized)

**Total Player Animations:** 24 + 48 + 32 = **104 animations**
**Current Priority Total:** 24 + 48 = **72 animations** (focus on club/spear/sling)

**Total Player Assets:** 4 base characters + 72 priority animations = **76 generations**

---

### Current Progress

**Weapon-Agnostic Animations (Red Hero):**
- ✅ Dodge Roll
- ✅ Taking Damage
- ✅ Downed State
- ✅ Reviving Teammate
- ✅ Being Revived
- 🔄 Victory Pose (generating)

**Stone Spear Set (Red Hero):**
- ✅ Spear Idle
- ✅ Spear Run
- ✅ Spear Jump
- ✅ Spear Throw Attack

**Wooden Club Set (Red Hero):**
- 🔲 Club Idle (need to generate)
- 🔲 Club Run (need to generate)
- 🔲 Club Jump (need to generate)
- ✅ Club Swing Attack

**Sling Set (Red Hero):**
- 🔲 Sling Idle (need to generate)
- 🔲 Sling Run (need to generate)
- 🔲 Sling Jump (need to generate)
- ✅ Sling Throw Attack

**Status by Color:**
- **Red Hero:** 6/6 agnostic ✅, 4/4 spear ✅, 1/4 club, 1/4 sling
- **Blue/Yellow/Green Heroes:** 2/6 agnostic (spear throw, sling throw only)

**Next Priority:**
1. Generate Club idle/run/jump for Red Hero (3 animations)
2. Generate Sling idle/run/jump for Red Hero (3 animations)
3. Replicate all weapon sets to Blue/Yellow/Green Heroes (54 animations)

---

### Weapons (5 types)

**Implementation Note:** Weapons are NOT generated as separate sprites. Instead, weapons are integrated directly into character animation sprites. Each character animation includes the appropriate weapon being held/used.

**Weapon Visual Descriptions (for animation generation):**

These descriptions guide how weapons should appear in character animations:

1. **Stone Spear**
   - Visual: "Stone spear weapon with wrapped leather grip, primitive prehistoric spear"
   - Used in: Throw animation, idle/walking animations (held)

2. **Wooden Club**
   - Visual: "Primitive wooden club with thick rounded knob head, natural wood grain texture, rough bark on handle, simple prehistoric melee weapon"
   - Used in: Club swing animation, idle/walking animations (held)

3. **Sling**
   - Visual: "Leather sling with stone ammunition pouch, prehistoric ranged weapon"
   - Used in: Throw animation (`custom-throw-a-slingshot`), idle animations

4. **Fire Spear**
   - Visual: "Stone spear with flaming tip, burning prehistoric weapon with fire effect"
   - Used in: Throw animation variant (future), special animations

5. **Net Launcher**
   - Visual: "Crossbow-style net launcher weapon, prehistoric support weapon"
   - Used in: Throw animation variant (future), support animations

**Weapon Animation Variants:**
- Weapon-specific animations are generated as part of the character animation set
- Completed: `custom-swing-a-club` (club melee), `custom-throw-a-spear` (spear ranged), `custom-throw-a-slingshot` (sling ranged)
- Base animations (throw, idle, walk) use the default stone spear
- Additional weapon variants are generated as needed per weapon type
- Each weapon variant is a full character animation (8 directions) integrated with the weapon visual

**Total Weapon Assets:** 0 separate sprites (integrated into character animations)

---

### Dinosaurs (12 types across 5 tiers)

**Tier 1: Warm-up Hunts**

1. **Compy Pack**
   - Canvas: 96px (small)
   - Description: "Small compsognathus dinosaur, vicious pack hunter, sharp teeth and claws, green and brown coloring, aggressive stance"

2. **Dilophosaurus**
   - Canvas: 256px (medium)
   - Description: "Aggressive dilophosaurus with sharp teeth, fierce expression, distinctive neck frill raised, green and yellow coloring, menacing predatory stance, threatening theropod"

**Tier 2: Herbivores**

3. **Triceratops**
   - Canvas: 320px (large)
   - Description: "Triceratops with three horns and neck frill, stocky muscular build, gray and brown coloring, imposing herbivore with dangerous horns"

4. **Stegosaurus**
   - Canvas: 320px (large)
   - Description: "Stegosaurus with distinctive back plates and spiked tail, gray-green coloring, large armored dinosaur with dangerous tail weapon"

**Tier 3: Aggressive Carnivores**

5. **Raptor Alpha**
   - Canvas: 256px (medium)
   - Description: "Velociraptor alpha with intelligent cunning eyes, brown and orange stripes, lean athletic build, fierce pack leader"

6. **Carnotaurus**
   - Canvas: 384px (huge)
   - Description: "Carnotaurus with short horns and muscular build, red and dark brown coloring, aggressive bull-like carnivore, intimidating presence"

**Tier 4: Elite Predators**

7. **Spinosaurus**
   - Canvas: 384px (huge)
   - Description: "Spinosaurus with large sail on back, blue-green amphibious coloring, long crocodile-like snout, fearsome aquatic predator"

8. **Allosaurus**
   - Canvas: 384px (huge)
   - Description: "Allosaurus with pronounced brow ridges, purple and dark gray coloring, powerful carnivore with massive head, apex predator stance"

**Tier 5: Apex Bosses**

9. **Tyrannosaurus Rex**
   - Canvas: 512px (apex)
   - Description: "T-Rex with massive head and tiny arms, dark green and brown coloring, towering apex predator, intimidating presence, frightening dangerous boss, terrifying theropod"

10. **Giganotosaurus**
    - Canvas: 512px (apex)
    - Description: "Giganotosaurus, larger than T-Rex with longer skull, dark red and black coloring, aggressive apex carnivore, menacing stature"

11. **Quetzalcoatlus**
    - Canvas: 512px (apex)
    - Description: "Quetzalcoatlus pterosaur with massive wingspan, tan and orange coloring, prehistoric flying predator with long neck, formidable aerial hunter"

**Required Animations per Dinosaur (6 animations × 12 dinosaurs = 72 total):**

1. **Idle/Breathing Animation**
   - **Template:** `breathing-idle`
   - **Custom Prompt:** `standing menacingly with heavy breathing, slight body sway`
   - **Duration:** 8 frames
   - **Use:** Default state between attacks
   - **Loop:** Yes
   - **Notes:** Works for both bipedal and quadrupedal dinosaurs

2. **Walking/Stalking Animation**
   - **Template:** `scary-walk` or `walking-6-frames`
   - **Custom Prompt:** `stalking forward with predatory gait, hunting approach`
   - **Duration:** 6-8 frames
   - **Use:** Movement toward players
   - **Loop:** Yes
   - **Notes:** Quadrupeds use all four legs, bipeds use upright walking

3. **Attack Wind-up Animation (Telegraph)**
   - **Template:** `fight-stance-idle-8-frames`
   - **Custom Prompt:** `tensing body and coiling back, preparing to strike`
   - **Duration:** 8 frames (2-3 seconds)
   - **Use:** Attack telegraph phase
   - **Loop:** No
   - **Notes:** Body language shows impending attack

4. **Attack Execution - Bite**
   - **Template:** `cross-punch` (fast strike motion)
   - **Custom Prompt:** `lunging forward with jaws snapping, aggressive bite strike`
   - **Duration:** 4-6 frames
   - **Use:** Bite attack
   - **Loop:** No
   - **Notes:** Fast, aggressive forward motion

5. **Stagger/Stunned Animation**
   - **Template:** `taking-punch`
   - **Custom Prompt:** `stumbling backward dazed, off-balance and vulnerable`
   - **Duration:** 6 frames
   - **Use:** When weak point broken
   - **Loop:** No
   - **Notes:** Shows disorientation and loss of stability

6. **Death Animation**
   - **Template:** `falling-back-death`
   - **Custom Prompt:** `collapsing to ground dramatically, body going limp`
   - **Duration:** 8-10 frames
   - **Use:** Hunt complete
   - **Loop:** No
   - **Notes:** Can fall forward, backward, or sideways depending on dinosaur type

**Additional Attack Variants (for specific dinosaurs):**

7. **Tail Sweep Attack** (Stegosaurus, large theropods)
   - **Custom Prompt:** `swinging tail in wide horizontal arc, sweeping attack`
   - **Duration:** 4-6 frames
   - **Use:** Area-of-effect tail attack

8. **Charge Attack** (Triceratops, Carnotaurus)
   - **Custom Prompt:** `charging forward with head lowered, ramming attack`
   - **Duration:** 6-8 frames
   - **Use:** Rush attack with horns/head

9. **Stomp Attack** (T-Rex, large apex predators)
   - **Custom Prompt:** `lifting leg high and stomping down forcefully`
   - **Duration:** 4-6 frames
   - **Use:** Ground pound attack

10. **Wing Flap/Dive** (Quetzalcoatlus only)
    - **Custom Prompt:** `diving down from above with wings spread, aerial strike`
    - **Duration:** 6-8 frames
    - **Use:** Aerial dive bomb attack

**Note:** Plan for 1-2 additional attack animations per large/apex dinosaur based on their unique behaviors.

**Total Dinosaur Assets:** 12 base characters + 72 standard animations + ~10 special attacks = 94 generations

**Estimated Special Attack Breakdown:**
- Tail Sweep: 3 dinosaurs (Stegosaurus + select theropods)
- Charge: 2 dinosaurs (Triceratops, Carnotaurus)
- Stomp: 4 dinosaurs (T-Rex, Giganotosaurus, Allosaurus, Spinosaurus)
- Wing Dive: 1 dinosaur (Quetzalcoatlus)

---

### Bartender NPC

**Base Sprite:**
- Canvas: 128px
- Body Proportions: Chibi (stocky/muscular, wider build than players)
- Description: "Burly Neanderthal bartender with thick wild beard, muscular chibi build, stocky and wide, brown leather apron over fur tunic, dinosaur skull necklace trophy, bone beads, friendly welcoming smile, cave bar server with weathered hands"

**Required Animations (4 animations):**

1. **Idle Animation**
   - **Template:** `breathing-idle`
   - **Action:** "cleaning bone mug with rag, idle bartender"
   - **Loop:** Yes

2. **Serving Animation**
   - **Template:** `throw-object` (adapted)
   - **Action:** "sliding drink across bar counter"
   - **Loop:** No

3. **Celebrating Animation**
   - **Template:** `fight-stance-idle-8-frames`
   - **Action:** "celebrating and pumping fist excitedly"
   - **Loop:** Yes

4. **Disapproving Animation**
   - **Template:** `breathing-idle` (variant)
   - **Action:** "shaking head disapprovingly, arms crossed"
   - **Loop:** Yes

**Total Bartender Assets:** 1 base character + 4 animations = 5 generations

---

### Environment Tiles & Props

**Arena 1: Tar Pits (5 assets)**
- Base Ground Tile (64px)
- Tar Pool Tile (64px)
- Transition Tile (64px)
- Scattered Bones Prop (128px)
- Prehistoric Plant Prop (96px)

**Arena 2: Volcanic Rocks (5 assets)**
- Obsidian Ground Tile (64px)
- Lava Stream Edge Tile (64px)
- Geyser Tile (64px)
- Sharp Rock Formation Prop (128px)
- Steam Vent Prop (96px)

**Arena 3: Dense Jungle (6 assets)**
- Jungle Floor Tile (64px)
- Grass Patch Tile (64px)
- Root-Covered Ground Tile (64px)
- Large Tree Trunk Prop (192px)
- Rock Formation Prop (128px)
- Hanging Vines Prop (96px)

**Arena 4: Frozen Tundra (5 assets)**
- Snow Ground Tile (64px)
- Ice Patch Tile (64px)
- Frozen Rock Tile (64px)
- Icicle Formation Prop (128px)
- Snow Drift Prop (96px)

**Arena 5: Bone Graveyard (6 assets)**
- Dusty Ground Tile (64px)
- Bone Fragment Ground Tile (64px)
- Cracked Earth Tile (64px)
- Giant Rib Cage Prop (192px)
- Dinosaur Skull Prop (192px)
- Bone Pile Prop (128px)

**Arena 6: Open Savanna (4 assets)**
- Savanna Grass Tile (64px)
- Watering Hole Edge Tile (64px)
- Acacia Tree Prop (192px)
- Flat Rock Prop (96px)

**Cave Bar Hub (19 assets)**

**Floor Tiles (4 tiles):**
- Cave Stone Floor Tile (64px)
- Polished Cave Floor Tile (64px)
- Cave Wall Base Tile (64px)
- Decorative Floor Tile (64px)

**Bar Counter Tileset (4 block tiles):**
- Bar Counter Left End (64px block tile)
- Bar Counter Middle Platform (64px block tile, repeatable)
- Bar Counter Right End (64px block tile)
- Bar Counter Corner (64px block tile, L-shaped)

**Wall Tiles (2 tiles):**
- Cave Wall Vertical Section (64px block tile, shows vertical rock face)
- Cave Wall Corner Section (64px block tile, for room corners)

**Props (9 props):**
- Wooden Bar Stool Prop (96px)
- Weapon Rack Prop (192px)
- Cave Painting Panel Prop (128px)
- Trophy Skull Mount Prop (128px)
- Torch Sconce Prop (96px)
- Bone Mug Prop (64px)
- Scoreboard Stone Prop (192px)
- Cave Wall Barrier Prop (192×192px) - Vertical wall section
- Cave Wall Corner Prop (128×128px) - L-shaped corner wall

**Environmental Hazard Animations (3 animations):**

1. **Volcanic Geyser Eruption**
   - Canvas: 128px
   - Description: "Steam and lava erupting from ground, volcanic geyser blast"
   - Frames: 6-8 frame cycle
   - Loop: Yes

2. **Tar Pit Bubbling**
   - Canvas: 64px
   - Description: "Bubbling black tar surface, slow popping bubbles"
   - Frames: 4-6 frame loop
   - Loop: Yes

3. **Torch Flames**
   - Canvas: 64px
   - Description: "Flickering orange flame on torch, dancing fire"
   - Frames: 4 frame loop
   - Loop: Yes

**Total Environment Assets:** 50 tiles/props + 3 hazard animations = 53 generations

**Status:**
- ✅ Arena 1: Tar Pits (5 assets - 3 tiles, 2 props)
- ✅ Arena 2: Volcanic Rocks (5 assets - 3 tiles, 2 props)
- ✅ Arena 3: Dense Jungle (6 assets - 3 tiles, 3 props)
- ✅ Arena 4: Frozen Tundra (5 assets - 3 tiles, 2 props)
- ✅ Arena 5: Bone Graveyard (6 assets - 3 tiles, 3 props)
- ✅ Arena 6: Open Savanna (4 assets - 2 tiles, 2 props)
- ✅ Cave Bar Hub: Complete (19 assets - 10 tiles, 9 props)
- **Total Generated:** 50 environment assets (31 arena + 19 cave bar)

---

### Terrain Depth & Elevation Considerations

**Current Limitations:**

The initial arena generation provides minimal tile variety (2-3 ground tiles + 2-3 props per arena). For rich, visually interesting terrain, arenas need expansion:

**Needed for Rich Terrain:**
- **Ground Variations:** 4-6 texture variants per arena (currently 2-3)
- **Transition Tiles:** Corner/edge blending tiles for smooth terrain mixing
- **Prop Variety:** 6-10 decorative objects per arena (currently 2-3)
- **Size Diversity:** Small (32-64px), medium (96-128px), large (192-256px) props

**Elevation/Height Tiles for Jumping:**

The game uses 3D world coordinates with `worldZ` for elevation (0-10+ units). Players can jump to Z=2.0. Elevated terrain requires visual representation:

**Approach: Visual Elevation Tiles**

Generate tiles that show height differences through artwork while game logic handles actual Z-positioning:

**Low Platform (Z=1.0):**
- Canvas: 64px thick tile
- Prompt: `"low platform 1 unit high with visible vertical edge, gentle elevation"`
- Use: Small elevation changes, steps

**Mid Platform (Z=2.0 - Jump Height):**
- Canvas: 96px thick tile
- Prompt: `"platform 2 units tall with flat top and vertical face, jump-height elevation"`
- Use: Jump destinations, elevated combat zones

**High Platform (Z=3.0+):**
- Canvas: 128px thick tile
- Prompt: `"tall cliff platform 3 units high with steep face, elevated surface"`
- Use: High ground advantage, unreachable areas

**Ramp/Slope Tiles:**
- Canvas: 64-96px
- Prompt: `"gentle slope ramp upward, gradual incline"`
- Use: Visual transition between elevation levels

**Implementation:**
- Tile artwork shows the vertical faces/slopes visually
- Game entities use `worldZ` position for actual height logic
- Collision system checks Z-ranges for platform standing
- Camera depth sorting handles visual layering automatically

**Proposed Elevation Expansion (per arena):**
- 2-3 platform tiles at different heights
- 1-2 ramp/slope transition tiles
- Adds 3-5 tiles per arena × 6 arenas = 18-30 additional tiles

**Proposed Variety Expansion (per arena):**
- 2-3 additional ground texture variants
- 3-4 small decorative props (32-64px)
- 2-3 medium obstacles (96-128px)
- 1 additional large landmark (192-256px)
- Adds ~8-10 assets per arena × 6 arenas = 48-60 additional assets

**Expanded Total:** 31 base + 18-30 elevation + 48-60 variety = **97-121 total environment assets**

This expansion can be done incrementally as needed during gameplay development.

---

### UI Elements (Minimal Implementation)

**In-Game HUD:**

1. **Player Portraits** (48×48px, 4 variants)
   - Red, Blue, Yellow, Green caveman head icons

2. **Health Hearts** (16×16px, 3 states)
   - Full heart, half heart, empty heart

3. **Buff Icons** (24×24px each)
   - Speed boost icon
   - Attack boost icon
   - Shield icon
   - Regen icon

4. **Dinosaur Portraits** (64×64px, 12 total)
   - Head-only close-up for each dinosaur type

5. **Weak Point Indicators** (16×16px each)
   - Head icon
   - Tail icon
   - Legs icon

6. **Weapon Icons** (32×32px, 5 total)
   - Icon version of each weapon

7. **Target Reticle** (32×32px, 4 color variants)
   - Crosshair with player color coding

**Cave Bar UI:**

8. **Weapon Shop Panel** (320×240px)
   - Stone tablet menu background

9. **Cocktail Menu Panel** (280×320px)
   - Bar menu stone background

10. **Passive Ability Icons** (48×48px, 5 total)
    - Thick Hide, Swift Feet, Hunter's Eye, Pack Leader, Scavenger

**Menu Screens:**

11. **Game Logo** (800×200px)
    - Title screen logo

12. **Victory Banner** (600×150px)
    - "HUNT COMPLETE!" banner

13. **Scoreboard Frame** (400×300px)
    - Stone tablet for scores

**Total UI Assets:** ~50-60 small icons and panels

**Note:** UI generation has lower priority. Many UI elements can use Phaser's built-in graphics initially and be replaced with pixel art later.

---

## Asset Summary

### Total Asset Count

| Category | Base Sprites | Animations | Priority Gen | Full Target |
|----------|--------------|------------|--------------|-------------|
| **Players** | 4 | 72 (3 weapons) | 76 | 108 (5 weapons) |
| **Weapons** | 0 | 0 | 0* | 0* |
| **Dinosaurs** | 12 | 72 + ~10 special | 94 | 94 |
| **Bartender** | 1 | 4 | 5 | 5 |
| **Environments - Base** | 31 tiles/props | 3 hazards | 34 | 34 ✅ |
| **Environments - Elevation** | 0 | 0 | 0 | 18-30 |
| **Environments - Variety** | 0 | 0 | 0 | 48-60 |
| **Cave Bar Hub** | 0 | 0 | 0 | 12 |
| **UI Elements** | 50-60 | 0 | 50-60 | 50-60 |
| **TOTAL** | **98-108** | **153 priority** | **259-269** | **369-421** |

\* *Weapons are integrated into character animations, not generated as separate assets*

**Current Progress:**
- 🔄 Players: Partial (Red Hero spear set complete, club/sling attacks only, other colors incomplete)
  - Need: Club/Sling locomotion sets (idle/run/jump) for all 4 colors
  - Deprioritized: Fire Spear and Net Launcher weapon sets (32 animations)
- ✅ Environments Base: Complete (31 arena assets across 6 arenas)
- ✅ Cave Bar Hub: Complete (19 assets)
- 🔄 Dinosaurs: Not started (94 animations)
- 🔄 Bartender: Not started (5 animations)
- 🔄 Environment Expansion: Not started (elevation tiles, variety props)
- 🔄 UI Elements: Not started (50-60 icons/panels)

---

## Animation Type Reference

### Character Animation Templates (PixelLab)

**Locomotion:**
- `walking-8-frames` - Standard walking cycle
- `walking-6-frames` - Shorter walk cycle
- `scary-walk` - Menacing stalking movement
- `running-slide` - Quick sliding motion

**Combat:**
- `throw-object` - Throwing/launching motion
- `cross-punch` - Fast strike/lunge
- `fight-stance-idle-8-frames` - Combat ready stance
- `hurricane-kick` - Spinning/sweeping motion
- `leg-sweep` - Low sweeping attack
- `roundhouse-kick` - Wide arc attack
- `jumping-2` - Vertical slam motion

**Reactions:**
- `breathing-idle` - Idle breathing animation
- `taking-punch` - Stagger/hit reaction
- `falling-back-death` - Defeat animation
- `front-flip` - Acrobatic dodge

---

## Implementation Plan Structure

The plan will be divided into tasks following Phase 2's TDD approach:

### Phase 2b Tasks

**Task 0:** Setup PixelLab MCP and Asset Pipeline
**Task 1:** Generate Validation Set (3 assets)
**Task 2:** Implement Sprite Rendering System
**Task 3:** Generate & Integrate Player Characters
**Task 4:** Generate & Integrate Player Animations
**Task 5:** Generate & Integrate First Dinosaur (Dilophosaurus)
**Task 6:** Generate & Integrate Dinosaur Animations
**Task 7:** Generate & Integrate Cave Bar Environment
**Task 8:** Generate & Integrate Remaining Dinosaurs (Tiers 1-2)
**Task 9:** Generate & Integrate Apex Dinosaurs (Tiers 3-5)
**Task 10:** Generate & Integrate All Arenas
**Task 11:** Generate & Integrate UI Elements
**Task 12:** Polish & Optimization

**Note:** Weapons are integrated into character animations and do not require separate generation tasks.

Each task will follow TDD principles:
1. Write test expectations
2. Generate asset via PixelLab
3. Implement rendering code
4. Verify in-game
5. Commit

---

## PixelLab Generation Parameters

### Standard Parameters (All Assets)

**Locked Settings:**
- **Outline:** Single color black outline
- **Shading:** Basic shading
- **Detail:** Medium detail
- **View:** High top-down

**Character Settings:**
- **Directions:** 8 (S, SW, W, NW, N, NE, E, SE)
- **AI Freedom:** 750

**Environment Tile Settings:**
- **Canvas:** 64px
- **Tile Shape:** Thick tile
- **Text Guidance Scale:** 8

**Prop/Object Settings:**
- **Transparent Background:** Yes
- **Canvas:** Varies (96px, 128px, 192px, 256px)

---

## Next Steps

1. **Review this catalog** - Verify all needed assets are listed
2. **Create detailed implementation plan** - Task-by-task breakdown
3. **Setup PixelLab** - Test MCP server connection
4. **Begin with validation set** - Verify visual style before full production
5. **Iterative implementation** - Build and test incrementally

---

**Plan Complete - Ready for detailed task breakdown**
