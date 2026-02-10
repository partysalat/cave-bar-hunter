# Prehistoric Hunter - UI & Sprite Design Document

**Project:** Prehistoric Hunter - Isometric Pixel Art Bar Game
**Art Pipeline:** PixelLab MCP Server
**Target Resolution:** 2560×1440 (128×64 isometric tiles)
**Design Date:** 2026-01-19
**Version:** 1.1 (Updated for 2K resolution)

## Table of Contents

1. [Visual Style Foundation](#visual-style-foundation)
2. [Validation Set Specifications](#validation-set-specifications)
3. [Full Sprite Catalog](#full-sprite-catalog)
4. [Dinosaur Roster](#dinosaur-roster)
5. [Arena Environments](#arena-environments)
6. [Character Animations](#character-animations)
7. [UI Elements & HUD](#ui-elements--hud)
8. [Asset Generation Pipeline](#asset-generation-pipeline)
9. [File Organization & Asset Management](#file-organization--asset-management)
10. [Design Consistency Guidelines](#design-consistency-guidelines)
11. [Asset Tracking & Project Management](#asset-tracking--project-management)
12. [Summary & Next Steps](#summary--next-steps)

---

## Visual Style Foundation

### Core Visual Identity

**Art Style: Stylized Cartoon Isometric Pixel Art**

The game uses a consistent "Flintstones meets Monster Hunter" aesthetic with:

- **Outline Style:** Single color black outlines on all sprites (characters, dinosaurs, objects)
- **Shading Approach:** Basic shading (2-3 tone values per color)
- **Detail Level:** Medium detail throughout
- **Color Palette:** Bold, high-saturation colors for bar visibility
  - Earth tones for environments (browns, grays, greens, oranges)
  - Vibrant accent colors for players (red, blue, yellow, green)
  - Glowing effects for interactive elements (bright yellow/orange)

### Camera Perspective

**High top-down isometric view (60-75° angle)**
- Provides tactical clarity for positioning and combat
- Shows weapons, dodge rolls, and hazards clearly
- Better spectator visibility for 4-player action
- Matches 8-directional D-pad movement system

### Scale Relationships

**Character Scale Chart (2K Resolution - 2× Scale):**
```
Chibi Player:     128px canvas → ~76px tall
Weapons:          64-96px      → handheld size
Small Dino:       96-128px     → 1-1.5× player
Medium Dino:      256px        → 2× player
Large Dino:       320px        → 2.5× player
Huge Dino:        384px        → 3× player
Apex Dino:        512px        → 4× player
Small Props:      96px         → decorative
Medium Props:     128px        → obstacles
Large Props:      192-256px    → cover/platforms
Environment Tile: 64px         → ground unit
```

---

## Validation Set Specifications

Before generating the full sprite catalog, we'll create a validation set to ensure visual consistency and style cohesion across all asset types.

### Validation Set Contents

#### 1. Red Hero Champion (Player 1)

**Generation Parameters:**
- **Canvas Size:** 128px (2× for 2K resolution)
- **Directions:** 8 (south, south-west, west, north-west, north, north-east, east, south-east)
- **Body Proportions:** Chibi (large head, muscular build)
- **View Angle:** High top-down
- **Outline:** Single color black outline
- **Shading:** Basic shading
- **Detail:** Medium detail
- **AI Freedom:** 750
- **Description:** "Heroic prehistoric champion in red fur cape and tribal war paint, thick wild brown beard, fierce confident grin, muscular chibi build, bone necklace trophy, red face paint stripes, legendary hunter, bold heroic stance"
- **Generation Time:** 3-5 minutes

#### 2. Dilophosaurus Enemy

**Generation Parameters:**
- **Canvas Size:** 256px (2× for 2K resolution)
- **Directions:** 8 (matching player directions)
- **View Angle:** High top-down
- **Outline:** Single color black outline
- **Shading:** Basic shading
- **Detail:** Medium detail
- **AI Freedom:** 750
- **Description:** "Aggressive dilophosaurus with sharp teeth, fierce expression, distinctive neck frill raised, green and yellow coloring, menacing predatory stance, threatening theropod"
- **Generation Time:** 3-5 minutes

#### 3. Cave Bar Floor Tile

**Generation Parameters:**
- **Canvas Size:** 64px (2× for 2K resolution)
- **Tile Shape:** Thick tile (~25% height for isometric depth)
- **Outline:** Single color black outline
- **Shading:** Basic shading
- **Detail:** Medium detail
- **Text Guidance Scale:** 8
- **Description:** "Ancient cave floor with rough stone blocks, torch-lit dungeon style, gray and brown tones"
- **Generation Time:** 10-20 seconds

### Validation Success Criteria

- ✓ Character scale feels appropriate relative to environment tiles
- ✓ Dinosaur reads as threatening but not overwhelming
- ✓ Black outlines provide clear definition from bar distance (15+ feet)
- ✓ Color palette is cohesive across all three asset types
- ✓ Chibi proportions maintain "fun, not scary" aesthetic
- ✓ Isometric tile depth matches expected 3D appearance

---

## Full Sprite Catalog

### Player Characters (Priority 1)

**4 Color Variants Required:** Red, Blue, Yellow, Green

Each player needs:
- **Canvas Size:** 128px (2× for 2K resolution)
- **Directions:** 8 per character
- **Body Proportions:** Chibi
- **View Angle:** High top-down
- **Outline:** Single color black outline
- **Shading:** Basic shading
- **Detail:** Medium detail
- **AI Freedom:** 750

**Heroic Character Design:**
All players are legendary barbarian hunters with distinctive heroic features. Each should look like a main character - bold, confident, and immediately recognizable as heroes.

**Shared Heroic Elements (All Players):**
- Thick wild beard (barbarian warrior style)
- Fierce confident grin or laugh (jovial, likes to drink and have fun)
- Fur cape/mantle (heroic silhouette)
- Bone trophy necklace (legendary hunter status)
- Tribal war paint stripes (color-coded)
- Muscular chibi build
- Bold heroic stance
- **NO WEAPONS in base sprite** (weapons added as overlays)

**Individual Character Variations:**

- **Player 1 (Red Hero):** Red fur cape, red tribal war paint stripes on face, thick brown beard, red outfit, bone necklace trophy, fierce confident grin

- **Player 2 (Blue Hero):** Blue fur cape, blue tribal war paint stripes on face, thick black beard, blue outfit, bone necklace trophy, hearty laughing expression

- **Player 3 (Yellow Hero):** Yellow fur cape, yellow tribal war paint stripes on face, thick blonde beard, yellow outfit, bone necklace trophy, bold confident smile

- **Player 4 (Green Hero):** Green fur cape, green tribal war paint stripes on face, thick red beard, green outfit, bone necklace trophy, fierce grinning expression

**Base Descriptions:**
- Red: "Heroic prehistoric barbarian champion in red fur cape and tribal war paint, thick wild brown beard, fierce confident grin, muscular chibi build, bone necklace trophy, red face paint stripes, legendary hunter, bold heroic stance"
- Blue: "Heroic prehistoric barbarian champion in blue fur cape and tribal war paint, thick wild black beard, hearty laugh, muscular chibi build, bone necklace trophy, blue face paint stripes, legendary hunter, bold heroic stance"
- Yellow: "Heroic prehistoric barbarian champion in yellow fur cape and tribal war paint, thick wild blonde beard, bold confident smile, muscular chibi build, bone necklace trophy, yellow face paint stripes, legendary hunter, bold heroic stance"
- Green: "Heroic prehistoric barbarian champion in green fur cape and tribal war paint, thick wild red beard, fierce grinning expression, muscular chibi build, bone necklace trophy, green face paint stripes, legendary hunter, bold heroic stance"

**Total Player Character Generations:** 4 characters (one per color)

### Weapons (Priority 2)

**DECISION: Using weapon overlay approach** - Generate weapons as separate sprites that layer on top of base characters at runtime. This is more efficient than regenerating full characters for each weapon.

**Weapon Sprites Needed (as separate map objects):**

Each weapon sprite:
- **Canvas Size:** 96-128px (weapon-sized for visibility, 2× scale)
- **View Angle:** High top-down
- **Transparent Background:** Yes
- **Outline:** Single color black outline
- **Shading:** Basic shading
- **Detail:** Medium detail

**Weapon List:**

1. **Stone Spear** (Reference from base character)
   - Description: "Stone spear weapon with wrapped leather grip, primitive prehistoric spear"
   - Size: 96px

2. **Bone Club**
   - Description: "Large bone club weapon with thick head, prehistoric melee weapon"
   - Size: 96px

3. **Sling**
   - Description: "Leather sling with stone ammunition pouch, prehistoric ranged weapon"
   - Size: 96px

4. **Fire Spear**
   - Description: "Stone spear with flaming tip, burning prehistoric weapon with fire effect"
   - Size: 96px

5. **Net Launcher**
   - Description: "Crossbow-style net launcher weapon, prehistoric support weapon"
   - Size: 96px

**Total Weapon Generations:** 5 weapons

### Bartender NPC

**Cave Bar Bartender Character:**
- **Canvas Size:** 128px (same as players, 2× scale)
- **Directions:** 8
- **Body Proportions:** Chibi (stocky/muscular, wider build than players)
- **View Angle:** High top-down
- **Outline:** Single color black outline
- **Shading:** Basic shading
- **Detail:** Medium detail
- **Description:** "Burly Neanderthal bartender with thick beard, muscular build, brown fur outfit, cave bar server, friendly expression"

**Total Bartender Generations:** 1 character

---

## Dinosaur Roster

Your design doc specifies 12 unique dinosaurs across 5 tiers. All dinosaurs use consistent specifications with size variations.

### Dinosaur Generation Specifications

**Universal Settings:**
- **Directions:** 8 (matching player/camera perspective)
- **View Angle:** High top-down
- **Outline:** Single color black outline
- **Shading:** Basic shading
- **Detail:** Medium detail
- **AI Freedom:** 750

**Size Categories by Canvas (2K Resolution - 2× Scale):**
- **Small (Tier 1 - Swarm):** 96-128px canvas → ~1x1 world units
- **Medium (Tier 1-2):** 256px canvas → ~2x2 world units
- **Large (Tier 2-3):** 320px canvas → ~3-4x3 world units
- **Huge (Tier 4):** 384px canvas → ~4-5x4 world units
- **Apex (Tier 5):** 512px canvas → ~6x4 world units

### Tier 1: Warm-up Hunts (2 dinosaurs)

**1. Compy Pack** - 96px canvas (2× scale)
- **Description:** "Small compsognathus dinosaur, pack hunter, green and brown coloring, stylized chibi proportions"
- **Note:** Generate as individual enemy, spawn 5× in-game

**2. Dilophosaurus** - 256px canvas (VALIDATION SET, 2× scale)
- **Description:** "Aggressive dilophosaurus with sharp teeth, fierce expression, distinctive neck frill raised, green and yellow coloring, menacing predatory stance, threatening theropod"

### Tier 2: Herbivores (2 dinosaurs)

**3. Triceratops** - 320px canvas (2× scale)
- **Description:** "Triceratops with three horns and neck frill, stocky muscular build, gray and brown coloring, imposing herbivore with dangerous horns"

**4. Stegosaurus** - 320px canvas (2× scale)
- **Description:** "Stegosaurus with distinctive back plates and spiked tail, gray-green coloring, large armored dinosaur with dangerous tail weapon"

### Tier 3: Aggressive Carnivores (2 dinosaurs)

**5. Raptor Alpha** - 256px canvas (2× scale)
- **Description:** "Velociraptor alpha with intelligent cunning eyes, brown and orange stripes, lean athletic build, fierce pack leader"

**6. Carnotaurus** - 384px canvas (2× scale)
- **Description:** "Carnotaurus with short horns and muscular build, red and dark brown coloring, aggressive bull-like carnivore, intimidating presence"

### Tier 4: Elite Predators (2 dinosaurs)

**7. Spinosaurus** - 384px canvas (2× scale)
- **Description:** "Spinosaurus with large sail on back, blue-green amphibious coloring, long crocodile-like snout, fearsome aquatic predator"

**8. Allosaurus** - 384px canvas (2× scale)
- **Description:** "Allosaurus with pronounced brow ridges, purple and dark gray coloring, powerful carnivore with massive head, apex predator stance"

### Tier 5: Apex Bosses (3 dinosaurs)

**9. Tyrannosaurus Rex** - 512px canvas (2× scale)
- **Description:** "T-Rex with massive head and tiny arms, dark green and brown coloring, towering apex predator, intimidating presence, stylized chibi"

**10. Giganotosaurus** - 512px canvas (2× scale)
- **Description:** "Giganotosaurus, larger than T-Rex with longer skull, dark red and black coloring, aggressive apex carnivore, menacing stature"

**11. Quetzalcoatlus** - 512px canvas (2× scale)
- **Description:** "Quetzalcoatlus pterosaur with massive wingspan, tan and orange coloring, prehistoric flying predator with long neck, formidable aerial hunter"

**Total Dinosaur Generations:** 12 unique dinosaurs

---

## Arena Environments

Your design doc specifies 6 arena environments plus the Cave Bar hub. Each arena needs ground tiles and environmental props.

### Universal Environment Specifications

**Ground Tiles:**
- **Canvas Size:** 64px (2× for 2K resolution)
- **Tile Shape:** Thick tile (~25% height for isometric depth)
- **Outline:** Single color black outline
- **Shading:** Basic shading
- **Detail:** Medium detail
- **Text Guidance Scale:** 8

**Props (rocks, trees, obstacles):**
- **Canvas Size:** 96-192px (varies by prop size, 2× scale)
- **View Angle:** High top-down (matching game perspective)
- **Transparent Background:** Yes (for placement flexibility)
- **Outline:** Single color black outline
- **Shading:** Basic shading or Medium shading
- **Detail:** Medium detail

### Arena 1: Tar Pits

**Ground Tiles:**
1. **Base Ground** (64px, 2× scale)
   - Description: "Prehistoric dirt ground with sparse grass, dry earth tones, brown and tan"

2. **Tar Pool** (64px, 2× scale)
   - Description: "Bubbling black tar pit surface, glossy dark texture, prehistoric tar"

3. **Transition Tile** (64px, 2× scale)
   - Description: "Ground edge blending into tar pit, half dirt half tar"

**Props:**
4. **Scattered Bones** (128px, 2× scale)
   - Description: "Prehistoric animal skeleton bones scattered on ground, white and gray weathered bones"

5. **Prehistoric Plant** (96px, 2× scale)
   - Description: "Small prehistoric fern plant, green foliage, primitive vegetation"

### Arena 2: Volcanic Rocks

**Ground Tiles:**
6. **Obsidian Ground** (64px, 2× scale)
   - Description: "Cracked obsidian volcanic rock floor, orange and red glow from cracks, dark gray stone"

7. **Lava Stream Edge** (64px, 2× scale)
   - Description: "Volcanic rock bordering glowing lava, bright orange molten rock, dangerous terrain"

8. **Geyser Tile** (64px, 2× scale)
   - Description: "Volcanic geyser vent in stone floor, steam effects, circular opening"

**Props:**
9. **Sharp Rock Formation** (128px, 2× scale)
   - Description: "Jagged volcanic rock spike, dark gray with orange glow, pointed stone"

10. **Steam Vent** (96px, 2× scale)
    - Description: "Small volcanic steam vent with smoke, glowing crater"

### Arena 3: Dense Jungle

**Ground Tiles:**
11. **Jungle Floor** (64px, 2× scale)
    - Description: "Lush jungle ground with fallen leaves, rich brown dirt, tropical forest floor"

12. **Grass Patch** (64px, 2× scale)
    - Description: "Dense green grass and ferns, vibrant jungle vegetation, thick undergrowth"

13. **Root-Covered Ground** (64px, 2× scale)
    - Description: "Jungle floor with exposed tree roots, brown roots over dirt"

**Props:**
14. **Large Tree Trunk** (192px, 2× scale)
    - Description: "Massive prehistoric tree trunk with thick bark, brown and gray, provides cover"

15. **Rock Formation** (128px, 2× scale)
    - Description: "Moss-covered jungle rock, green moss on gray stone"

16. **Hanging Vines** (96px, 2× scale)
    - Description: "Dangling jungle vines, green leafy vines, decorative foliage"

### Arena 4: Frozen Tundra

**Ground Tiles:**
17. **Snow Ground** (64px, 2× scale)
    - Description: "Snow-covered tundra ground, white and light blue, frozen wasteland"

18. **Ice Patch** (64px, 2× scale)
    - Description: "Slippery ice surface, glossy blue-white ice, transparent reflective texture"

19. **Frozen Rock** (64px, 2× scale)
    - Description: "Ice-covered stone ground, blue-gray frost on rocks"

**Props:**
20. **Icicle Formation** (128px, 2× scale)
    - Description: "Hanging icicles cluster, sharp blue ice formations"

21. **Snow Drift** (96px, 2× scale)
    - Description: "Small snow pile mound, white powdery snow accumulation"

### Arena 5: Bone Graveyard

**Ground Tiles:**
22. **Dusty Ground** (64px, 2× scale)
    - Description: "Bone graveyard dirt, dusty gray and tan earth, ancient burial ground"

23. **Bone Fragment Ground** (64px, 2× scale)
    - Description: "Ground littered with small bone fragments, dusty with scattered bones"

24. **Cracked Earth** (64px, 2× scale)
    - Description: "Dry cracked desert ground, deep fissures, barren wasteland"

**Props:**
25. **Giant Rib Cage** (192px, 2× scale)
    - Description: "Massive dinosaur rib bones forming structure, white weathered bones, climbable"

26. **Dinosaur Skull** (192px, 2× scale)
    - Description: "Large prehistoric skull half-buried in ground, dramatic fossil"

27. **Bone Pile** (128px, 2× scale)
    - Description: "Stack of various bones, white and gray skeletal remains"

### Arena 6: Open Savanna

**Ground Tiles:**
28. **Savanna Grass** (64px, 2× scale)
    - Description: "Golden savanna grassland, yellow-green tall grass, African plains"

29. **Watering Hole Edge** (64px, 2× scale)
    - Description: "Muddy ground at water's edge, brown wet earth, waterside terrain"

**Props:**
30. **Acacia Tree** (192px, 2× scale)
    - Description: "Small acacia tree at edge, iconic African tree silhouette, sparse foliage"

31. **Flat Rock** (96px, 2× scale)
    - Description: "Smooth savanna stone, gray flat rock, simple obstacle"

### Cave Bar Hub

**Ground Tiles:**
32. **Cave Stone Floor** (64px, 2× scale) - VALIDATION SET
    - Description: "Ancient cave floor with rough stone blocks, torch-lit dungeon style, gray and brown tones"

33. **Polished Cave Floor** (64px, 2× scale)
    - Description: "Smoother cave stone floor, worn path, gray stone with slight shine"

34. **Cave Wall Base** (64px, 2× scale)
    - Description: "Cave wall bottom edge tile, rough stone texture, creates depth"

35. **Decorative Floor** (64px, 2× scale)
    - Description: "Cave floor with primitive tribal patterns carved in, ceremonial stone"

**Props:**
36. **Stone Bar Counter** (256px, 2× scale)
    - Description: "Prehistoric bar counter, wide stone surface, cave bar centerpiece"

37. **Wooden Bar Stool** (96px, 2× scale)
    - Description: "Primitive wooden stool, log seat, rustic furniture"

38. **Weapon Rack** (192px, 2× scale)
    - Description: "Stone and wood weapon display rack, holds spears and clubs"

39. **Cave Painting Panel** (128px, 2× scale)
    - Description: "Cave wall with tribal art, animal paintings, upgrade station marker"

40. **Trophy Skull Mount** (128px, 2× scale)
    - Description: "Dinosaur skull mounted on wall, hunter trophy display"

41. **Torch Sconce** (96px, 2× scale)
    - Description: "Wall-mounted torch with flame, orange glowing light source"

42. **Bone Mug** (64px, 2× scale)
    - Description: "Primitive drinking mug made from bone, bar prop"

43. **Scoreboard Stone** (192px, 2× scale)
    - Description: "Carved stone tablet displaying scores, stone leaderboard"

**Total Environment Assets:** 43 tiles and props

---

## Character Animations

PixelLab supports character animation using template-based generation. After generating base characters, you can create animations that work across all directional views.

### Player Character Animations (Priority)

**Required Animations per Character:**

1. **Walking** (locomotion)
   - **Template:** `walking-8-frames`
   - **Action Description:** "walking cautiously with weapon ready"
   - **Duration:** 8 frames
   - **Use:** Primary movement animation

2. **Idle/Breathing** (stationary)
   - **Template:** `breathing-idle`
   - **Action Description:** "standing alert with weapon, scanning for danger"
   - **Use:** Default state when not moving

3. **Attack/Throw** (combat)
   - **Template:** `throw-object`
   - **Action Description:** "throwing spear with wind-up motion"
   - **Use:** Primary ranged attack

4. **Dodge Roll** (defensive)
   - **Template:** `front-flip` or `running-slide`
   - **Action Description:** "quick evasive roll"
   - **Use:** Invincibility frame dodge mechanic

5. **Downed State** (damage)
   - **Template:** `taking-punch`
   - **Action Description:** "falling down injured, crawling"
   - **Use:** When player loses all HP

**Total Character Animations:** 4 colors × 5 animations = 20 animation generations
**Generation Time:** 2-4 minutes each

### Dinosaur Animations (All PixelLab Generated)

**Required Animations per Dinosaur:**

1. **Idle/Breathing**
   - **Template:** `breathing-idle` (8 frames)
   - **Action Description:** "standing menacingly, heavy breathing"
   - **Use:** Default state between attacks

2. **Walking/Stalking**
   - **Template:** `scary-walk` or `walking-6-frames`
   - **Action Description:** "stalking prey slowly, predatory movement"
   - **Use:** Movement toward players

3. **Attack Wind-up** (Telegraph)
   - **Template:** `fight-stance-idle-8-frames`
   - **Action Description:** "preparing to attack, charging up"
   - **Use:** 2-3 second telegraph phase

4. **Attack Execution**
   - **Template:** Varies by attack type:
     - Bite: `cross-punch` (fast strike motion)
     - Charge: `hurricane-kick` or `flying-kick` (forward rush)
     - Tail sweep: `leg-sweep` or `roundhouse-kick` (sweeping motion)
     - Stomp: `jumping-2` (vertical slam)
   - **Action Description:** Customize per dinosaur attack pattern
   - **Use:** Main attack animation

5. **Stagger/Stunned**
   - **Template:** `taking-punch`
   - **Action Description:** "stumbling, dazed and vulnerable"
   - **Use:** When weak point broken or threshold reached

6. **Death**
   - **Template:** `falling-back-death`
   - **Action Description:** "collapsing dramatically, defeated"
   - **Use:** Hunt complete animation

**Total Dinosaur Animations:** 12 dinosaurs × 6 animations = 72 animation generations
**Generation Time:** 2-4 minutes each

### Bartender NPC Animations

**Required Animations:**

1. **Idle** - Cleaning mug
   - **Template:** `breathing-idle`
   - **Action Description:** "cleaning bone mug with rag, idle bartender"

2. **Serving** - Sliding drink across bar
   - **Template:** `throw-object` (adapted)
   - **Action Description:** "sliding drink across bar counter"

3. **Celebrating** - Fist pump approval
   - **Template:** `fight-stance-idle-8-frames`
   - **Action Description:** "celebrating and pumping fist excitedly"

4. **Disapproving** - Head shake/arms crossed
   - **Template:** Custom pose or `breathing-idle` variant
   - **Action Description:** "shaking head disapprovingly, arms crossed"

**Total Bartender Animations:** 1 character + 4 animations = 5 generations

### Projectile & Weapon Animations

**Spear/Weapon Projectiles:**
- **Approach:** Simple sprite rotation in Phaser (no PixelLab generation needed)
- **Alternative:** Create as map object animation if complex effects needed

**Needed:**
1. Stone Spear flight rotation (sprite rotation)
2. Fire Spear flight with flame trail (may use PixelLab for flame effect)
3. Sling stone projectile (sprite rotation)
4. Net projectile expanding (may use PixelLab animation)

### Environmental Hazard Animations

**Interactive Environment Elements:**

1. **Volcanic Geyser Eruption** (128px, 2× scale)
   - **Description:** "Steam and lava erupting from ground, volcanic geyser blast"
   - **Frames:** 6-8 frame cycle

2. **Tar Pit Bubbling** (64px, 2× scale)
   - **Description:** "Bubbling black tar surface, slow popping bubbles"
   - **Frames:** 4-6 frame loop

3. **Torch Flames** (64px, 2× scale)
   - **Description:** "Flickering orange flame on torch, dancing fire"
   - **Frames:** 4 frame loop (cave bar lighting)

**Total Environmental Animations:** ~10-15 effect loops

### Item & Trap Animations

**Consumable Items (if animated):**

1. **Bear Trap** (96px, 2× scale)
   - Open state → Closing animation → Closed state
   - 3-4 frames mechanical snap

2. **Smoke Bomb** (128px, 2× scale)
   - Expanding smoke cloud effect
   - 6-8 frame dissipation

3. **Damage Totem** (96px, 2× scale)
   - Pulsing glow effect
   - 4 frame loop

**Generation:** PixelLab map objects or simple sprite effects

### UI & Feedback Animations

**Visual Feedback Elements:**

1. **Weak Point Glow** (varies)
   - Pulsing yellow/orange glow on dinosaur parts
   - 4 frame pulse loop

2. **Perfect Dodge Flash** (player-sized)
   - Brief white glow around player
   - 3 frame flash effect

3. **Stagger Break Effect** (192px, 2× scale)
   - Radiating impact lines
   - 6 frame burst

**Generation:** Mix of PixelLab effects and Phaser particle systems

---

**Animation Summary:**
- Player characters: 20 animations
- Dinosaurs: 72 animations
- Bartender: 5 animations
- Environmental effects: ~10-15 loops
- Item/trap effects: ~8-10 effects

**Grand Total:** ~115-125 animation generations with PixelLab

---

## UI Elements & HUD

The game needs minimal on-screen UI to maintain visibility of the isometric gameplay. All UI elements should use pixel art style consistent with game assets.

### In-Game HUD Elements

**Top Bar (Player Status):**

1. **Player Portraits** (48×48px each, 4 total)
   - **Description:** "Small chibi caveman head portrait, [color] face paint, pixel art icon"
   - **Generate:** 4 color variants (red, blue, yellow, green)
   - **Shows:** Health hearts, score numbers, buff icons

2. **Health Hearts** (16×16px each)
   - Full heart, half heart, empty heart
   - **Description:** "Pixel art heart icon, red, simple design"
   - Simple pixel art icons (3 states)

3. **Buff Icons** (24×24px each)
   - Cocktail effects: Speed boost, attack boost, shield, etc.
   - **Examples:**
     - Speed: "Running boot icon, blue, pixel art"
     - Attack: "Crossed weapons icon, red, pixel art"
     - Shield: "Round shield icon, yellow, pixel art"
     - Regen: "Green heart with plus sign, pixel art"

4. **Session Progress Display**
   - Text: "HUNT 3/5" in pixel font
   - Trophy/checkmark icons for completed hunts
   - **Trophy Icon:** "Small trophy icon, gold, pixel art" (16×16px)

**Center-Bottom Bar (Dinosaur Status):**

5. **Large Health Bar Frame** (128×32px)
   - **Description:** "Prehistoric stone bar frame with tribal carvings, pixel art UI element"
   - Stone/bone frame border

6. **Dinosaur Portrait** (64×64px each, 12 total)
   - **Description:** "[Dinosaur name] head portrait, facing forward, pixel art icon"
   - **Generate:** 12 dinosaur head-only close-ups
   - **Examples:**
     - "Dilophosaurus head portrait with neck frill, facing forward, pixel art icon"
     - "T-Rex head portrait with open mouth, facing forward, pixel art icon"

7. **Weak Point Indicators** (16×16px each)
   - Small icons showing body parts (head, tail, legs)
   - **Examples:**
     - "Dinosaur head icon, simple silhouette, pixel art"
     - "Dinosaur tail icon, simple silhouette, pixel art"
     - "Dinosaur leg icon, simple silhouette, pixel art"

**Bottom-Right (Player Controls):**

8. **Weapon Icons** (32×32px each, 5 total)
   - Current equipped weapon close-up
   - **Generate:** Icon versions of each weapon
   - Shows ammo/charges if applicable

9. **Dodge Cooldown Indicator** (24×24px)
   - Circular progress icon
   - Simple arc animation (4-6 frames)

**Floating Combat Elements:**

10. **Target Reticle** (32×32px)
    - Auto-aim indicator pointing at weak points
    - Animated crosshair with player color
    - **Description:** "Crosshair reticle with arrows pointing inward, [color], pixel art"
    - Generate 4 color variants

11. **"SAVE!" Prompt** (48×24px banner)
    - Appears over downed players
    - Flashing alert banner
    - **Description:** "Stone banner with SAVE text carved in, urgent warning banner, pixel art"

### Cave Bar Scene UI

**Shop/Upgrade Menus:**

12. **Weapon Shop Panel** (320×240px)
    - **Description:** "Stone tablet menu with weapon icons, prehistoric shop interface, carved stone UI"
    - Shows: 5 weapons with prices and stats
    - Style: Carved stone aesthetic

13. **Cocktail Menu Panel** (280×320px)
    - **Description:** "Cave bar drink menu on stone, tribal art border, 6 cocktail icons"
    - Shows: Bone mug icons with colored liquids
    - Style: Bar menu on stone/wood

14. **Passive Ability Icons** (48×48px each, 5 total)
    - **Thick Hide:** "Shield icon with hide texture, brown, pixel art"
    - **Swift Feet:** "Running boot with speed lines, blue, pixel art"
    - **Hunter's Eye:** "Eye with crosshair target, yellow, pixel art"
    - **Pack Leader:** "Two caveman silhouettes together, green, pixel art"
    - **Scavenger:** "Gold coins and gems icon, yellow, pixel art"

**Scoreboard Display:**

15. **Stone Scoreboard** (400×300px)
    - **Description:** "Carved stone tablet with tribal number markings, prehistoric scoreboard"
    - Shows: 4 player scores ranked with crown for MVP

16. **Trophy Wall Silhouettes** (96×96px per dinosaur, 12 total)
    - **Defeated:** Full color dinosaur icon with checkmark
    - **Upcoming:** Glowing silhouette outline
    - **Locked:** Dark shadowed silhouette
    - Generate silhouette variants for each of 12 dinosaurs

**Interaction Prompts:**

17. **Button Prompts** (32×32px each)
    - Controller buttons: A, B, X, Y, LT, RT
    - **Description:** "Stone carved [button name] button icon, pixel art"
    - Style: Stone carved buttons with symbols

### Menu Screens UI

**Attract Mode / Title Screen:**

18. **Game Logo** (800×200px)
    - **Description:** "Prehistoric Hunter game logo with dinosaur skull, stone carved text, tribal style"
    - Style: Dramatic stone carved title

19. **"Press Start" Button** (200×64px)
    - Pulsing animated prompt
    - **Description:** "Stone button with PRESS START carved text, pulsing glow, pixel art"
    - Stone button aesthetic with 4-frame pulse

**Victory / Game Over Screens:**

20. **Victory Banner** (600×150px)
    - **Description:** "Prehistoric victory banner with tribal decorations, stone carved celebration"
    - Text: "HUNT COMPLETE!" or "MIGHTY HUNTERS!"

21. **Game Over Stone** (400×300px)
    - **Description:** "Cracked stone tablet game over screen, defeated warrior theme"
    - Text: "TRY AGAIN?" with countdown

**Leaderboard Display:**

22. **Leaderboard Frame** (500×700px)
    - **Description:** "Large stone tablet with tribal carvings, top 10 list carved in stone"
    - Shows: Ranks, initials, scores
    - Style: Ancient monument aesthetic

**Total UI Elements:** ~70-80 assets (including variants and icons)

---

## Asset Generation Pipeline

This section outlines the recommended workflow for generating all sprites using PixelLab MCP server.

### Phase 1: Validation Set (Week 1)

**Purpose:** Confirm visual style cohesion before full production

**Generation Order:**
1. Cave Bar floor tile (10-20 seconds)
2. Red Caveman character (3-5 minutes)
3. Dilophosaurus dinosaur (3-5 minutes)

**Validation Checklist:**
- [ ] Character scale feels appropriate relative to tile
- [ ] Dinosaur reads as threatening but cartoonish
- [ ] Black outlines provide clarity
- [ ] Colors are vibrant and cohesive
- [ ] Chibi proportions maintain fun aesthetic
- [ ] Isometric perspective matches expectations

**If validation fails:** Adjust parameters (outline style, shading, detail level) and regenerate before proceeding.

### Phase 2: Core Gameplay Assets (Week 2-3)

**Priority 1 - Playable Characters:**
1. Complete player color variants (Blue, Yellow, Green) - 3 generations
2. Generate 5 weapon overlay sprites - 5 generations
3. Generate Red player animations (walking, idle, attack, dodge, downed) - 5 generations

**Priority 2 - First Enemy:**
4. Complete Dilophosaurus animations (idle, walk, attack variants, stagger, death) - 6 generations

**Priority 3 - Test Environment:**
5. Cave Bar remaining tiles (3 more) - 3 generations
6. Cave Bar props (8 props) - 8 generations

**Milestone:** Functional prototype with 1 player color, 1 weapon, 1 enemy, 1 environment

### Phase 3: Full Character Roster (Week 4-5)

**Player Characters:**
- Complete animations for Blue, Yellow, Green players (15 animations total)
- Generate bartender character + animations (5 generations)

**Total:** 20 generations

### Phase 4: Complete Dinosaur Roster (Week 6-8)

**Tier 1-2 Dinosaurs:**
- Generate Compy, Triceratops, Stegosaurus (3 base characters)
- Generate animations for all Tier 1-2 dinosaurs (4 dinos × 6 animations = 24 animations)

**Tier 3-5 Dinosaurs:**
- Generate Raptor Alpha, Carnotaurus, Spinosaurus, Allosaurus, T-Rex, Giganotosaurus, Quetzalcoatlus (8 base characters)
- Generate animations (8 dinos × 6 animations = 48 animations)

**Total:** 11 dinosaur characters + 72 animations = 83 generations

### Phase 5: All Arena Environments (Week 9-10)

**Generation Order by Arena:**
1. Tar Pits (5 assets)
2. Volcanic Rocks (5 assets)
3. Dense Jungle (6 assets)
4. Frozen Tundra (5 assets)
5. Bone Graveyard (6 assets)
6. Open Savanna (4 assets)

**Total:** 31 environment assets

### Phase 6: UI & Polish Assets (Week 11)

**UI Elements:**
- Player portraits (4)
- Dinosaur portraits (12)
- Menu backgrounds (5-6)
- Icons and buttons (20-30 small assets)

**Effects:**
- Environmental hazards (10-15)
- Combat effects (8-10)

**Total:** ~70-80 smaller generations

---

**Estimated Total Generation Time:**
- Characters: ~40 generations × 3-5 min = 2-3.5 hours
- Animations: ~115 generations × 2-4 min = 4-8 hours
- Environments: ~31 generations × 15-30 sec = 8-15 minutes
- UI/Effects: ~80 generations × 10-20 sec = 13-27 minutes

**Grand Total Generation Time:** ~7-12 hours of PixelLab generation spread over 11 weeks

---

## File Organization & Asset Management

Proper file structure ensures efficient asset loading and maintainability throughout development.

### Directory Structure

```
cave-bar-hunter/
├── assets/
│   ├── characters/
│   │   ├── players/
│   │   │   ├── red/
│   │   │   │   ├── red_caveman_base.png
│   │   │   │   ├── red_caveman_walk.png
│   │   │   │   ├── red_caveman_idle.png
│   │   │   │   ├── red_caveman_attack.png
│   │   │   │   ├── red_caveman_dodge.png
│   │   │   │   └── red_caveman_downed.png
│   │   │   ├── blue/ (same structure)
│   │   │   ├── yellow/ (same structure)
│   │   │   └── green/ (same structure)
│   │   ├── weapons/
│   │   │   ├── stone_spear.png
│   │   │   ├── bone_club.png
│   │   │   ├── sling.png
│   │   │   ├── fire_spear.png
│   │   │   └── net_launcher.png
│   │   └── bartender/
│   │       ├── bartender_base.png
│   │       └── bartender_animations/
│   ├── dinosaurs/
│   │   ├── tier1/
│   │   │   ├── compy_base.png
│   │   │   ├── compy_animations/
│   │   │   ├── dilophosaurus_base.png
│   │   │   └── dilophosaurus_animations/
│   │   ├── tier2/ (triceratops, stegosaurus)
│   │   ├── tier3/ (raptor_alpha, carnotaurus)
│   │   ├── tier4/ (spinosaurus, allosaurus)
│   │   └── tier5/ (t_rex, giganotosaurus, quetzalcoatlus)
│   ├── environments/
│   │   ├── cave_bar/
│   │   │   ├── tiles/
│   │   │   └── props/
│   │   ├── tar_pits/
│   │   ├── volcanic_rocks/
│   │   ├── dense_jungle/
│   │   ├── frozen_tundra/
│   │   ├── bone_graveyard/
│   │   └── open_savanna/
│   ├── ui/
│   │   ├── hud/
│   │   │   ├── player_portraits/
│   │   │   ├── health_hearts/
│   │   │   ├── buff_icons/
│   │   │   └── weapon_icons/
│   │   ├── menus/
│   │   │   ├── shop_panels/
│   │   │   ├── scoreboard/
│   │   │   └── leaderboard/
│   │   └── screens/
│   │       ├── title_logo.png
│   │       ├── victory_banner.png
│   │       └── game_over_stone.png
│   └── effects/
│       ├── environmental/
│       ├── combat/
│       └── particles/
```

### Naming Conventions

**Characters:**
- Format: `{type}_{color/name}_{animation}.png`
- Examples: `player_red_walk.png`, `dilophosaurus_attack.png`

**Environments:**
- Format: `{arena}_{type}_{variant}.png`
- Examples: `tar_pits_ground_base.png`, `cave_bar_prop_stool.png`

**UI Elements:**
- Format: `ui_{category}_{element}.png`
- Examples: `ui_hud_health_heart.png`, `ui_menu_shop_panel.png`

**Animations:**
- Format: `{entity}_{animation}_{framecount}frames.png`
- Stored as sprite sheets with metadata JSON

### PixelLab Export Integration

**After Each Generation:**
1. Download PNG from PixelLab
2. Rename according to convention
3. Place in appropriate directory
4. Log in asset tracking spreadsheet (character ID, generation date, parameters used)

**Sprite Sheet Creation:**
- PixelLab exports animations as sprite sheets automatically
- 8-directional characters come as single sheet with all directions
- Metadata includes frame positions and timing

### Phaser 3 Asset Loading

**Preload Structure (2K Resolution - 2× Scale):**
```javascript
// Example preload in Phaser scene
preload() {
  // Character sprite sheets (8 directions, multiple animations)
  this.load.spritesheet('player_red_walk',
    'assets/characters/players/red/red_caveman_walk.png',
    { frameWidth: 128, frameHeight: 128 }); // 2× scale

  // Dinosaur sprite sheets
  this.load.spritesheet('dilophosaurus_idle',
    'assets/dinosaurs/tier1/dilophosaurus_idle.png',
    { frameWidth: 256, frameHeight: 256 }); // 2× scale

  // Environment tiles
  this.load.image('cave_floor',
    'assets/environments/cave_bar/tiles/cave_stone_floor.png'); // 64×64px
}
```

**Sprite Atlas Optimization (Later):**
- Combine multiple small sprites into texture atlases
- Reduces HTTP requests
- Use TexturePacker or similar tool
- Implement after initial development phase

---

## Design Consistency Guidelines

To maintain visual cohesion across all 200+ assets, follow these strict parameters for every PixelLab generation.

### Locked Parameters (Never Change)

**For ALL Assets:**
- **Outline:** Single color black outline
- **Shading:** Basic shading
- **Detail:** Medium detail
- **View:** High top-down

**For Characters (Players, Dinosaurs, Bartender):**
- **Directions:** 8 (south, south-west, west, north-west, north, north-east, east, south-east)
- **AI Freedom:** 750 (balanced between prompt adherence and natural variation)

**For Environment Tiles:**
- **Size:** 64px canvas (2× for 2K resolution)
- **Tile Shape:** Thick tile
- **Text Guidance Scale:** 8 (standard prompt adherence)

### Color Palette Standards

**Earth Tones (Environments):**
- Browns: #8B4513, #A0522D, #CD853F
- Grays: #696969, #808080, #A9A9A9
- Greens: #556B2F, #6B8E23, #8FBC8F
- Oranges/Reds: #D2691E, #CD5C5C, #FF6347

**Player Colors (Vibrant):**
- Red: #DC143C, #B22222
- Blue: #4169E1, #1E90FF
- Yellow: #FFD700, #FFA500
- Green: #32CD32, #228B22

**Effect Colors:**
- Weak Point Glow: #FFD700, #FFA500 (bright yellow/orange)
- Fire: #FF4500, #FF6347 (orange-red)
- Ice: #87CEEB, #B0E0E6 (light blue)
- Poison: #9ACD32, #ADFF2F (yellow-green)

### Size Relationships Reference

**Character Scale Chart (2K Resolution - 2× Scale):**
```
Chibi Player:     128px canvas → ~76px tall
Weapons:          64-96px      → handheld size
Small Dino:       96-128px     → 1-1.5× player
Medium Dino:      256px        → 2× player
Large Dino:       320px        → 2.5× player
Huge Dino:        384px        → 3× player
Apex Dino:        512px        → 4× player
Small Props:      96px         → decorative
Medium Props:     128px        → obstacles
Large Props:      192-256px    → cover/platforms
Environment Tile: 64px         → ground unit
```

### Visual Style Checklist

Before approving any generated asset, verify:

- [ ] **Outline:** Consistent black outline thickness
- [ ] **Proportions:** Matches size chart above
- [ ] **Colors:** Uses established palette, high saturation
- [ ] **Readability:** Clear silhouette from 15 feet away
- [ ] **Style:** Cartoon/stylized, not realistic
- [ ] **Perspective:** High top-down isometric angle
- [ ] **Shading:** 2-3 tone basic shading visible
- [ ] **Integration:** Looks cohesive with validation set

### Common Pitfalls to Avoid

**Don't:**
- Mix outline styles (selective vs black outline)
- Use low detail or highly detailed (stick to medium)
- Generate realistic/scary dinosaurs (keep cartoon style)
- Use muted/desaturated colors
- Change viewing angle mid-production
- Generate characters at inconsistent canvas sizes

**Do:**
- Reference validation set before each generation
- Keep descriptions concise and clear
- Use color names explicitly ("red", "green", not "crimson")
- Mention "cartoon" or "stylized" in descriptions
- Test new assets in-game early to catch scale issues

---

## Asset Tracking & Project Management

With 200+ assets to generate, proper tracking prevents duplicates and ensures nothing is missed.

### Asset Generation Tracker Spreadsheet

**Recommended Columns:**

| Asset ID | Category | Name | Description | Canvas Size | Status | PixelLab ID | Date Generated | File Path | Notes |
|----------|----------|------|-------------|-------------|--------|-------------|----------------|-----------|-------|
| CHAR-001 | Character | Red Caveman | Cute prehistoric hunter... | 64px | ✅ Complete | char_abc123 | 2026-01-20 | assets/characters/players/red/red_caveman_base.png | Validation sprite |
| DINO-001 | Dinosaur | Dilophosaurus | Cartoon dilophosaurus... | 128px | ✅ Complete | char_def456 | 2026-01-20 | assets/dinosaurs/tier1/dilophosaurus_base.png | Validation sprite |
| ENV-001 | Environment | Cave Floor | Ancient cave floor... | 32px | ✅ Complete | tile_ghi789 | 2026-01-20 | assets/environments/cave_bar/tiles/cave_stone_floor.png | Validation sprite |

**Status Values:**
- 🔴 Not Started
- 🟡 In Generation (PixelLab processing)
- 🟢 Complete (downloaded and filed)
- 🔵 Needs Revision (regenerate with adjusted parameters)
- ⚫ Deprecated (replaced by better version)

### Generation Batch Planning

**Weekly Batches:**
- Week 1: Validation set (3 assets)
- Week 2: Core gameplay (21 assets)
- Week 3: Player animations (15 assets)
- Week 4-5: Character roster completion (20 assets)
- Week 6-8: Dinosaur roster (83 assets)
- Week 9-10: Environments (31 assets)
- Week 11: UI/Polish (70-80 assets)

**Daily Generation Limits:**
- Free tier: Limited generations per day
- Pro tier: Higher capacity (confirm current limits)
- Batch 5-10 assets per session to avoid fatigue
- Test integrated assets before generating next batch

### Quality Control Process

**After Each Generation:**

1. **Visual Inspection** - Does it match style guide?
2. **Scale Test** - Import into Phaser, check relative size
3. **Integration Test** - Place in scene with validation assets
4. **Approval Gate** - Mark complete or flag for revision

**Revision Triggers:**
- Wrong perspective/viewing angle
- Incorrect outline style
- Off-model colors or proportions
- Unclear silhouette
- Doesn't match validation set aesthetic

### Backup and Version Control

**PixelLab Asset IDs:**
- Keep PixelLab character/tile IDs in tracker
- Enables regeneration if files lost
- Allows animation addition to existing characters

**File Backups:**
- Commit assets to git repository (if repo size allows)
- OR use cloud storage (Google Drive, Dropbox)
- Version original PixelLab exports separately from edited versions

**Git LFS Consideration:**
- Large file storage for game assets
- Prevents repo bloat with binary files
- Recommended for 200+ PNG files

---

## Summary & Next Steps

### Asset Generation Summary

**Total Assets Required:**

| Category | Base Assets | Animations | Total Generations | Estimated Time |
|----------|-------------|------------|-------------------|----------------|
| Player Characters | 4 | 20 | 24 | ~2 hours |
| Weapons | 5 | 0 | 5 | ~15 min |
| Dinosaurs | 12 | 72 | 84 | ~5-7 hours |
| Bartender | 1 | 4 | 5 | ~20 min |
| Environment Tiles | 35 | 0 | 35 | ~15-20 min |
| Environment Props | 30 | 0 | 30 | ~10-15 min |
| UI Elements | 50-60 | 0 | 50-60 | ~15-25 min |
| Effects/Hazards | 20-25 | 15 | 35-40 | ~30-45 min |
| **TOTAL** | **157-172** | **111** | **268-283** | **~9-12 hours** |

### Validation Set (Start Here)

**Immediate Next Steps:**

1. ✅ Generate Cave Bar floor tile (32px thick tile)
   - Description: "Ancient cave floor with rough stone blocks, torch-lit dungeon style, gray and brown tones"

2. ✅ Generate Red Caveman character (64px, 8 directions, chibi)
   - Description: "Cute prehistoric hunter in red tribal outfit, red face markings, wielding stone spear, caveman style"

3. ✅ Generate Dilophosaurus dinosaur (128px, 8 directions)
   - Description: "Cartoon dilophosaurus with distinctive neck frill, green and yellow coloring, medium-sized theropod dinosaur"

4. ⚡ **Validate style cohesion** - Import all three into Phaser prototype
5. ⚡ **Test in-game** - Verify scale, readability, aesthetic match

### After Validation Success

**Phase 2 Priority Order:**
1. Complete 4 player colors (Blue, Yellow, Green)
2. Generate 5 weapon overlays
3. Generate walking animation for Red player
4. Complete Cave Bar tiles and props (environment testing)
5. Generate Dilophosaurus idle and attack animations

**Milestone Goal:** Playable prototype with 1 arena, 4 players, 1 enemy, basic combat

### Long-term Production

**11-Week Generation Schedule:**
- Weeks 1-3: Core gameplay assets (validation + essential characters/animations)
- Weeks 4-5: Complete character roster
- Weeks 6-8: Full dinosaur roster (12 enemies + animations)
- Weeks 9-10: All 6 arena environments
- Week 11: UI polish and effects

### Critical Success Factors

- ✅ Maintain strict style guide adherence (black outline, basic shading, medium detail)
- ✅ Test assets in-engine regularly (catch scale issues early)
- ✅ Track all PixelLab IDs for future regeneration/animation
- ✅ Batch generations efficiently (5-10 per session)
- ✅ Use weapon overlay approach for efficiency
- ✅ Generate all animations through PixelLab (no manual sprite work)

### Design Document Complete

This UI design document provides:
- ✅ Complete sprite catalog (268-283 assets)
- ✅ Consistent visual style guidelines
- ✅ PixelLab generation specifications for every asset
- ✅ File organization structure
- ✅ Asset tracking methodology
- ✅ 11-week production pipeline

---

**Ready to begin validation set generation!**

**Next Action:** Use PixelLab MCP tools to generate the 3 validation assets.

---

## Appendix: Quick Reference

### PixelLab Generation Parameters Template

**Character Generation (2K Resolution - 2× Scale):**
```
Canvas Size: [128px / 256px / 384px / 512px]
Directions: 8
Proportions: chibi / default / cartoon
View: high top-down
Outline: single color black outline
Shading: basic shading
Detail: medium detail
AI Freedom: 750
Description: "[Entity description with style keywords]"
```

**Environment Tile Generation (2K Resolution - 2× Scale):**
```
Canvas Size: 64px
Tile Shape: thick tile
Outline: single color black outline
Shading: basic shading
Detail: medium detail
Text Guidance Scale: 8
Description: "[Tile description with material and atmosphere]"
```

**Map Object/Prop Generation (2K Resolution - 2× Scale):**
```
Canvas Size: [96px / 128px / 192px / 256px]
View: high top-down
Transparent Background: Yes
Outline: single color black outline
Shading: basic shading / medium shading
Detail: medium detail
Description: "[Object description with size and context]"
```

**Animation Generation:**
```
Character ID: [PixelLab character ID]
Template: [animation template name]
Action Description: "[Movement description focused on action]"
Animation Name: [descriptive name]
```

---

**End of UI & Sprite Design Document**

**Version:** 1.0
**Last Updated:** 2026-01-19
**Author:** Design collaboration with user

**Contact:** For questions about this design, refer to the main game design document or asset tracker.
