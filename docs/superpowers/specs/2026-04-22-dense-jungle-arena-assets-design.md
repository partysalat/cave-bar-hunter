# Dense Jungle Arena Assets Design
**Date:** 2026-04-22

---

## Overview

The Dense Jungle is Hunt #1's arena. Side-profile pixel art, bright tropical day lighting. Uses the same tileable parallax layer structure as the cave bar: three independently scrolling background tiles plus distinct prop sprites layered on top.

The Far gameplay zone grants 20% damage reduction (cover mechanic). This is reinforced visually — the far parallax layer (canopy) is noticeably darker and denser than the mid layer, so players instinctively read "I'm hidden in here."

---

## Approach

**Tileable background layers + distinct props**, matching the cave bar rendering pattern. No new rendering code required.

---

## Asset List

### Background Tiles (3 assets)

| Asset | Size | Layer | Scroll | Description |
|-|-|-|-|-|
| Jungle floor | 64×64 | Near | 1.0× | Mud/dirt/roots, earthy brown-green, subtle grass tufts, tileable |
| Jungle mid | 64×128 | Mid | 0.6× | Tree trunks, tangled undergrowth, leafy bushes, bright tropical green, tileable |
| Jungle canopy | 256×128 | Far | 0.3× | Dense overhead canopy, dappled sunlight filtering through, darker and denser than mid to signal cover zone, wide tile to avoid obvious repeat |

---

### Props (3 assets)

| Asset | Size | Description |
|-|-|-|
| Large tree | 128×256 | Tall jungle tree, full trunk and leafy crown, placed at intervals across the scene |
| Liana | 32×192 | Hanging vine from above, used for entry sequence and ambient atmosphere |
| Foreground bush | 96×64 | Dense tropical fern/bush for near-layer decoration |

---

## Generation Order

1. **Jungle floor** — establishes palette and ground style
2. **Jungle mid** — references floor for palette consistency
3. **Jungle canopy** — references floor; must read visually darker/denser than mid
4. **Large tree** — references floor tile as `reference_asset_id`
5. **Liana** — references floor tile
6. **Foreground bush** — references floor tile

All assets use `generate_game_art`.

---

## File Locations

- Tiles: `assets/spritecook/arena/dense-jungle/tiles/`
- Props: `assets/spritecook/arena/dense-jungle/props/`
- Manifest entries: `assets/spritecook/manifest.json` under `"arenas" > "dense-jungle"` key

---

## Credit Estimate

| Category | Count | Credits each | Total |
|-|-|-|-|
| Background tiles | 3 | 12 | 36 |
| Props | 3 | 12 | 36 |
| **Total** | **6** | | **72** |

Current balance: ~732 credits. Well within budget.
