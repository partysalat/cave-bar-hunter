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

**Required Animations per Character (11 animations × 4 colors = 44 total):**

1. **Walking Animation**
   - **Template:** `running-8-frames`
   - **Action:** "walking cautiously with weapon ready"
   - **Duration:** 8 frames
   - **Use:** Primary movement animation
   - **Loop:** Yes
   - **Status (Red Hero):** ✅ Complete

2. **Idle/Breathing Animation**
   - **Template:** `breathing-idle`
   - **Action:** "standing alert with weapon, scanning for danger"
   - **Duration:** 6-8 frames
   - **Use:** Default state when stationary
   - **Loop:** Yes
   - **Status (Red Hero):** ✅ Complete

3. **Jump Animation**
   - **Template:** `jumping-1`
   - **Action:** "jumping upward with weapon held"
   - **Duration:** 6-8 frames (covers 0.8s jump cycle)
   - **Use:** Vertical movement (Z=0 to Z=2.0), avoiding attacks, reaching platforms, jumping over hazards
   - **Loop:** No
   - **Status (Red Hero):** ✅ Complete

4. **Attack/Throw Animation**
   - **Template:** `throw-object`
   - **Action:** "throwing spear with wind-up motion"
   - **Duration:** 6-8 frames
   - **Use:** Spear throwing mechanic
   - **Loop:** No
   - **Status (Red Hero):** ✅ Complete

5. **Melee/Club Swing Animation**
   - **Template:** `custom-swing-a-club` (custom animation)
   - **Action:** "swinging club in wide arc, melee attack"
   - **Duration:** 6 frames
   - **Use:** Wooden club melee attack
   - **Loop:** No
   - **Status (Red Hero):** ✅ Complete

6. **Dodge Roll Animation**
   - **Template:** Custom `dodge-roll`
   - **Action:** "quick evasive roll"
   - **Duration:** 4-6 frames
   - **Use:** Invincibility frame dodge (0.5s duration)
   - **Loop:** No
   - **Status (Red Hero):** ✅ Complete

7. **Taking Damage Animation**
   - **Template:** `taking-punch`
   - **Action:** "recoiling from hit, brief stagger"
   - **Duration:** 3-4 frames
   - **Use:** When player takes damage (not downed yet)
   - **Loop:** No
   - **Status (Red Hero):** ✅ Complete

8. **Downed State Animation**
   - **Template:** `falling-back-death`
   - **Action:** "falling down injured, crawling on ground"
   - **Duration:** 8 frames (fall + crawl cycle)
   - **Use:** When player health reaches 0, crawling while downed
   - **Loop:** Yes (crawling portion)
   - **Status (Red Hero):** ✅ Complete

9. **Reviving Teammate Animation** (Performing Revive)
   - **Template:** `picking-up`
   - **Action:** "kneeling down helping fallen teammate, pulling them up"
   - **Duration:** 6-8 frames
   - **Use:** When holding X button to revive downed teammate (2-second action)
   - **Loop:** Yes (held during revive duration)
   - **Status (Red Hero):** ✅ Complete

10. **Being Revived Animation**
    - **Template:** `getting-up`
    - **Action:** "standing up after being helped by teammate"
    - **Duration:** 6 frames
    - **Use:** When teammate completes 2-second revive action
    - **Loop:** No
    - **Status (Red Hero):** ✅ Complete

11. **Victory Pose Animation**
    - **Template:** `fight-stance-idle-8-frames`
    - **Action:** "celebrating victory - unique per color: fist pump (red), spear raise (blue), cheer (yellow), triumphant stance (green)"
    - **Duration:** 8 frames
    - **Use:** Hunt victory screen, synchronized celebration
    - **Loop:** Yes (hold pose)
    - **Status (Red Hero):** 🔄 Generating (ETA: 2-4 minutes)

**Weapon-Specific Animations (Red Hero):**
- `custom-swing-a-club` - Club melee attack (replaces cross-punch)
- `custom-throw-a-slingshot` - Sling weapon specific throw

**Additional Bonus Animations (Red Hero):**
- `drinking` - Flavor/celebration animation
- `running-jump` - Advanced movement combo

**Total Player Assets:** 4 base characters + 44 animations = 48 generations

**Progress:**
- **Red Hero:** 11/11 animations complete (✅ 10 complete, 🔄 1 generating)

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
   - Used in: Throw animation variant (future), idle animations

4. **Fire Spear**
   - Visual: "Stone spear with flaming tip, burning prehistoric weapon with fire effect"
   - Used in: Throw animation variant (future), special animations

5. **Net Launcher**
   - Visual: "Crossbow-style net launcher weapon, prehistoric support weapon"
   - Used in: Throw animation variant (future), support animations

**Weapon Animation Variants:**
- Weapon-specific animations are generated as part of the character animation set
- Examples: `custom-swing-a-club` for club melee, `custom-throw-a-slingshot` for sling ranged
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
   - Description: "T-Rex with massive head and tiny arms, dark green and brown coloring, towering apex predator, intimidating presence, stylized chibi"

10. **Giganotosaurus**
    - Canvas: 512px (apex)
    - Description: "Giganotosaurus, larger than T-Rex with longer skull, dark red and black coloring, aggressive apex carnivore, menacing stature"

11. **Quetzalcoatlus**
    - Canvas: 512px (apex)
    - Description: "Quetzalcoatlus pterosaur with massive wingspan, tan and orange coloring, prehistoric flying predator with long neck, formidable aerial hunter"

**Required Animations per Dinosaur (6 animations × 12 dinosaurs = 72 total):**

1. **Idle/Breathing Animation**
   - **Template:** `breathing-idle`
   - **Action:** "standing in menacing pose with heavy breathing motion, slight body sway, predatory alertness"
   - **Duration:** 8 frames
   - **Use:** Default state between attacks
   - **Loop:** Yes
   - **Notes:** Works for both bipedal and quadrupedal dinosaurs

2. **Walking/Stalking Animation**
   - **Template:** `scary-walk` or `walking-6-frames`
   - **Action:** "stalking forward slowly with predatory movement, low prowling gait, hunting approach"
   - **Duration:** 6-8 frames
   - **Use:** Movement toward players
   - **Loop:** Yes
   - **Notes:** Quadrupeds use all four legs, bipeds use upright walking

3. **Attack Wind-up Animation (Telegraph)**
   - **Template:** `fight-stance-idle-8-frames`
   - **Action:** "winding up for attack, body tensing and coiling back, preparing to strike with building energy"
   - **Duration:** 8 frames (2-3 seconds)
   - **Use:** Attack telegraph phase
   - **Loop:** No
   - **Notes:** Body language shows impending attack

4. **Attack Execution - Bite**
   - **Template:** `cross-punch` (fast strike motion)
   - **Action:** "lunging forward explosively with jaws snapping open and shut, aggressive bite strike"
   - **Duration:** 4-6 frames
   - **Use:** Bite attack
   - **Loop:** No
   - **Notes:** Fast, aggressive forward motion

5. **Stagger/Stunned Animation**
   - **Template:** `taking-punch`
   - **Action:** "stumbling and reeling backward, dazed and off-balance, vulnerable stagger"
   - **Duration:** 6 frames
   - **Use:** When weak point broken
   - **Loop:** No
   - **Notes:** Shows disorientation and loss of stability

6. **Death Animation**
   - **Template:** `falling-back-death`
   - **Action:** "collapsing to ground dramatically, body going limp and falling, final defeated pose"
   - **Duration:** 8-10 frames
   - **Use:** Hunt complete
   - **Loop:** No
   - **Notes:** Can fall forward, backward, or sideways depending on dinosaur type

**Note:** Each dinosaur may need additional attack execution variants (charge, tail sweep, stomp) based on their unique attack patterns. Plan for 1-2 additional attack animations per large/apex dinosaur.

**Total Dinosaur Assets:** 12 base characters + 72 standard animations + ~8 special attacks = 92 generations

---

### Bartender NPC

**Base Sprite:**
- Canvas: 128px
- Description: "Burly Neanderthal bartender with thick beard, muscular build, brown fur outfit, cave bar server, friendly expression"

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

**Cave Bar Hub (12 assets)**
- Cave Stone Floor Tile (64px)
- Polished Cave Floor Tile (64px)
- Cave Wall Base Tile (64px)
- Decorative Floor Tile (64px)
- Stone Bar Counter Prop (256px)
- Wooden Bar Stool Prop (96px)
- Weapon Rack Prop (192px)
- Cave Painting Panel Prop (128px)
- Trophy Skull Mount Prop (128px)
- Torch Sconce Prop (96px)
- Bone Mug Prop (64px)
- Scoreboard Stone Prop (192px)

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

**Total Environment Assets:** 43 tiles/props + 3 hazard animations = 46 generations

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

| Category | Base Sprites | Animations | Total Generations |
|----------|--------------|------------|-------------------|
| **Players** | 4 | 44 | 48 |
| **Weapons** | 0 | 0 | 0* |
| **Dinosaurs** | 12 | 72 + ~8 special | 92 |
| **Bartender** | 1 | 4 | 5 |
| **Environments** | 43 | 3 | 46 |
| **UI Elements** | 50-60 | 0 | 50-60 |
| **TOTAL** | **110-120** | **123** | **241-251** |

\* *Weapons are integrated into character animations, not generated as separate assets*

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
