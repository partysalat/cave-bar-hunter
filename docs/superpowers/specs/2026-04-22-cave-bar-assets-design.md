# Cave Bar Assets Design
**Date:** 2026-04-22

---

## Overview

The cave bar is a fixed-width hub scene displayed between hunts. All 6 stations are visible simultaneously on screen. Players move freely left to right via gamepad, walk up to a station to interact. No menus, no grid — pure spatial navigation.

Art style: side-profile pixel art, matching the player hero sprites.

---

## Approach

**Tileable background + distinct station props.**

- Two tileable background tiles (wall + floor) fill the scene at any resolution without upscaling artifacts.
- Each station is an independent sprite layered on top, enabling highlight/glow effects on player proximity.
- Station props are generated using the background tile as `reference_asset_id` for visual consistency.
- Bartender is a separate animated character sprite, not part of any prop or background.

---

## Asset List

### Background Tiles (4 assets)

Three parallax layers, each tiling independently at different scroll speeds:

| Asset | Size | Layer | Scroll speed | Description |
|-|-|-|-|-|
| Cave stone floor | 64×64 | Near | 1.0× | Worn flat stone floor, subtle cracks, earthy brown/grey, tileable |
| Cave stone wall | 64×64 | Mid | 0.6× | Rough cave rock wall, dark grey/brown, faint torch-lit warmth, tileable |
| Torch sconce | 64×96 | Mid | 0.6× | Wall-mounted stone bracket with wooden torch and orange flame, placed at intervals on mid layer |
| Far cave depth | 256×128 | Far | 0.3× | Deep cave darkness, stalactites, distant rock formations, blue-grey with faint orange glow, tileable |

The far layer uses a wider tile (256px) so the repeat is not obvious at slow scroll speeds.

---

### Station Props (6 assets)

Arranged left to right in the scene:

| Asset | Size | Station | Description |
|-|-|-|-|
| Trophy Wall | 192×192 | Trophy Wall | Stone-mounted dinosaur skull display, empty slots for future trophies, glowing outline slot for next boss |
| Scoreboard Stone | 128×192 | Scoreboard | Large carved stone tablet, primitive tally marks, crown icon at top |
| Bar Counter | 192×96 | Bartender | Wooden/bone bar counter with bone mugs on top — bartender stands behind this |
| Upgrade Wall | 192×192 | Upgrade Wall | Cave wall section with 5 carved rectangular frames for painting slots |
| Weapon Rack | 128×192 | Weapon Rack | Wooden rack with slots for 6 weapons (axe, shield, spear, torch, bow, sling) |
| Cave Exit Arch | 128×192 | Exit | Natural cave opening/arch, space above for "X/Y Ready" indicator |

---

### Bartender Character (4 assets)

Distinct animated NPC. Same extreme chibi proportions as player heroes. Stands behind the bar counter, faces left toward players.

**Base still:**
Burly neanderthal bartender, extreme chibi proportions, brown leather apron over fur tunic, thick wild beard, friendly welcoming smile, bone necklace, wiping a bone mug, side profile facing left.

**Animations** (derived from base still):

| Animation | Frames | Loop | Description |
|-|-|-|-|
| `idle` | 8 | Yes | Subtle breathing, occasional mug-wipe, weight shift |
| `cheer` | 6 | No | Raises mug, pumps fist — triggered on good hunt result |
| `grunt` | 6 | No | Crosses arms, skeptical headshake — triggered on poor hunt result |

---

### Cave Painting Upgrade Props (5 assets)

Displayed inside the Upgrade Wall's carved frames. Flat primitive art in ochre/red/brown earth tones on rough stone. Must be readable at 64×64.

| Asset | Size | Ability | Visual |
|-|-|-|-|
| Thick Hide | 64×64 | +1 max health | Primitive painted shield with geometric patterns |
| Swift Feet | 64×64 | Dodge cooldown -1s | Trail of running footprints |
| Hunter's Eye | 64×64 | Weak point hitboxes +30% | Large watchful eye |
| Pack Leader | 64×64 | Revive speed +50% | Stick figures hunting together |
| Scavenger | 64×64 | +25% bonus points | Pile of gems and treasure |

---

## Generation Order

1. **Background tiles** (4: floor, wall, torch sconce, far depth) — establish palette and style reference
2. **Station props** (6) — reference background tile for consistency
3. **Bartender still** (1) — reference background tile; approve before animating
4. **Bartender animations** (3) — derived from bartender still
5. **Cave painting props** (5) — reference Upgrade Wall prop for frame consistency

All still images use `generate_game_art`. Animations use `animate_game_art` from approved stills.
Apply approval gate before animating the bartender (same rule as weapon stills for heroes).

---

## File Locations

- Background tiles: `assets/spritecook/cavebar/tiles/`
- Station props: `assets/spritecook/cavebar/props/`
- Bartender: `assets/spritecook/cavebar/bartender/`
- Cave paintings: `assets/spritecook/cavebar/paintings/`
- Manifest entries: `assets/spritecook/manifest.json` under `"cavebar"` key

---

## Credit Estimate

| Category | Count | Credits each | Total |
|-|-|-|-|
| Background tiles | 4 | 12 | 48 |
| Station props | 6 | 12 | 72 |
| Bartender still | 1 | 12 | 12 |
| Bartender animations | 3 | 20 | 60 |
| Cave painting props | 5 | 12 | 60 |
| **Total** | **17** | | **228** |

Current balance: ~1,024 credits. Well within budget.
