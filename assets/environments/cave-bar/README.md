# Cave Bar Assets

Generated: 2026-01-30

## Floor Tiles (4 assets)

Located in `tiles/`

1. **cave-stone-floor.png** (64×64px) - Rough ancient rock surface for main floor areas
2. **polished-cave-floor.png** (64×64px) - Smooth worn stone for high-traffic areas
3. **cave-wall-base.png** (64×64px) - Dark stone wall surface
4. **decorative-floor.png** (64×64px) - Floor with primitive cave paintings and ancient symbols

## Props (8 assets)

Located in `props/`

1. **bar-counter.png** (256×256px) - Stone bar counter, main serving area
2. **bar-stool.png** (96×96px) - Wooden bar stool for seating
3. **weapon-rack.png** (128×192px) - Wall-mounted rack displaying spears
4. **cave-painting.png** (128×128px) - Decorative cave art panel
5. **trophy-skull.png** (128×128px) - Mounted dinosaur skull trophy
6. **torch-sconce.png** (64×96px) - Wall torch in stone holder with flame
7. **bone-mug.png** (64×64px) - Drinking vessel made from hollowed bone
8. **scoreboard.png** (192×192px) - Stone tablet for displaying scores

## Bartender Character

Located in `../../characters/bartender/`

**Character ID:** b6ea9651-6548-46fa-8aa6-2e91709b7f1e

### Specifications
- **Canvas Size:** 128×128px
- **Directions:** 8 (south, south-west, west, north-west, north, north-east, east, south-east)
- **Style:** Single color black outline, basic shading, medium detail
- **View:** High top-down

### Animations

1. **breathing-idle** (6 frames) - Default idle state, cleaning bone mug
2. **throw-object** (7 frames) - Serving animation, sliding drink across bar
3. **fight-stance-idle-8-frames** (8 frames) - Celebrating, pumping fist excitedly
4. **crouching** (varies) - Disapproving gesture, shaking head with arms crossed

### Files Structure
```
bartender/
  rotations/           # 8 directional static sprites
    south.png
    south-east.png
    east.png
    north-east.png
    north.png
    north-west.png
    west.png
    south-west.png
  animations/          # Animation frames by type and direction
    breathing-idle/
    throw-object/
    fight-stance-idle-8-frames/
    crouching/
  metadata.json        # Generation metadata
```

## Generation Settings

All assets generated using PixelLab MCP with consistent parameters:

- **Outline:** Single color outline / Single color black outline
- **Shading:** Basic shading / Medium shading
- **Detail:** Medium detail
- **View:** High top-down
- **AI Freedom:** 750 (for character)
- **Tile Shape:** Thick tile (for floor tiles)

## Usage Notes

- All props have transparent backgrounds for easy compositing
- Tiles are designed for isometric placement
- Bartender animations match the 8-directional player character system
- Assets use pixel art style consistent with player characters and arena tiles
