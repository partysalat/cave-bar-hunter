# M6: Asset Generation Plan

**Date:** 2026-02-15
**Purpose:** Sidescroller sprites for 4 hero characters, Compy enemy, and 5 arena tilesets.
**Only the `west` direction is used in-game** — all other directions can be ignored. The code flips `west` horizontally for right-facing.

---

## Character Status

| Character | PixelLab ID | Status |
|---|---|---|
| Red Hero (Side) | `8326ca91-c721-49dc-9615-3e40c32bd81d` | ✅ rotations + idle processing |
| Blue Hero (Side) | — | ❌ needs creating |
| Yellow Hero (Side) | — | ❌ needs creating |
| Green Hero (Side) | — | ❌ needs creating |
| Compy (Side) | `377b6fd7-cfc8-441c-88f7-bf4a5c3a664b` | ✅ rotations, no animations yet |

---

## Character Creation Prompts

### Heroes

Settings: `view="side"`, `size=96`, `n_directions=4`, `body_type="humanoid"`, `proportions={"type":"preset","name":"chibi"}`

| Color | PixelLab ID | Description |
|---|---|---|
| Red | `8326ca91-c721-49dc-9615-3e40c32bd81d` | `Heroic prehistoric champion in red fur cape and tribal war paint, thick wild beard, fierce confident grin, muscular chibi build, bone necklace trophy, red face paint stripes, legendary hunter, bold heroic stance` |
| Blue | ❌ create | `Heroic prehistoric champion in blue fur cape and tribal war paint, thick wild black beard, hearty laugh, muscular chibi build, bone necklace trophy, blue face paint stripes, legendary hunter, bold heroic stance` |
| Yellow | ❌ create | `Heroic prehistoric champion in yellow fur cape and tribal war paint, thick wild blonde beard, bold confident smile, muscular chibi build, bone necklace trophy, yellow face paint stripes, legendary hunter, bold heroic stance` |
| Green | ❌ create | `Heroic prehistoric champion in green fur cape and tribal war paint, thick wild red beard, fierce grinning expression, muscular chibi build, bone necklace trophy, green face paint stripes, legendary hunter, bold heroic stance` |

### Compy

Settings: `view="side"`, `size=64`, `n_directions=4`, `body_type="quadruped"`, `template="dog"`

| ID | Description |
|---|---|
| `377b6fd7-cfc8-441c-88f7-bf4a5c3a664b` | `Small compsognathus dinosaur, vicious pack hunter, sharp claws and teeth, green and brown scaly skin, slender bipedal body, long tail for balance, aggressive predatory stance, reptilian eyes` |

---

## Hero Animations

Apply to **all 4 hero characters**. Use the `west` direction frames only.

### Without Weapon

| Game Key | Template ID | Action Description |
|---|---|---|
| `idle` | `breathing-idle` | standing relaxed, empty hands, resting between fights |
| `run` | `running-8-frames` | running at full speed, arms pumping, no weapon |
| `jump` | `jumping-1` | leaping upward with both feet, arms spread, no weapon |
| `attack` | `cross-punch` | throwing a hard forward punch with full body rotation |
| `dodge` | `running-slide` | low sliding dodge to evade an attack |
| `downed` | `falling-back-death` | knocked out and falling backward to ground |
| `get-up` | `getting-up` | slowly recovering, pushing up from the ground |

### With Club

| Game Key | Template ID | Action Description |
|---|---|---|
| `idle-club` | `fight-stance-idle-8-frames` | standing in combat ready stance, gripping a large bone club at side |
| `run-club` | `running-8-frames` | sprinting forward, clutching a large bone club while running |
| `jump-club` | `jumping-1` | jumping while holding bone club raised overhead, ready to slam |
| `attack-club` | `throw-object` | swinging bone club in a powerful horizontal arc with full follow-through |

### With Spear

| Game Key | Template ID | Action Description |
|---|---|---|
| `idle-spear` | `fight-stance-idle-8-frames` | standing ready, holding a wooden spear upright in hunter stance |
| `run-spear` | `running-8-frames` | running while carrying a spear horizontally at hip level |
| `jump-spear` | `jumping-1` | leaping upward, thrusting spear overhead with one hand |
| `attack-spear` | `throw-object` | winding up and hurling a wooden spear forward with full force |

---

## Compy Animations

**ID:** `377b6fd7-cfc8-441c-88f7-bf4a5c3a664b` — quadruped, 64×64, side view

| Game Key | Template ID | Action Description |
|---|---|---|
| `idle` | `idle` | small dinosaur standing alert, head bobbing slightly, twitching tail |
| `walk` | `slow-run` | cautious stalking walk, low to ground, predatory movement |
| `run` | `running-8-frames` | full sprint, legs pumping, body low, aggressive charge |
| `attack` | `angry` | lunging forward with open jaws, snapping bite attack |
| `jump` | `jump` | leaping forward toward target, airborne bite |
| `downed` | `sitting-on-belly` | collapsing onto belly, defeated, legs spread out |

---

## Arena Tilesets

Generate via `create_sidescroller_tileset`. Store in `assets/tilesets/`.

| Arena | Lower | Transition | Upper | Notes |
|---|---|---|---|---|
| Dense Jungle | `dense jungle dirt floor` | `tangled roots and leaf litter` | `lush tropical grass with large jungle leaves` | Hunt #1 |
| Volcanic Rocks | `black volcanic rock` | `glowing orange magma cracks` | `rough volcanic basalt surface` | Hunt #2 |
| Frozen Tundra | `frozen permafrost` | `crunchy snow layer` | `thick snow and ice` | Hunt #3 |
| Bone Graveyard | `dark mud and earth` | `scattered bone fragments` | `bleached dinosaur bones and fossils` | Hunt #4 |
| Open Savanna | `dry cracked earth` | `dry grass roots` | `tall golden savanna grass` | Hunt #5 |

Settings for all: `tile_size={"width":32,"height":32}`, `view="low top-down"`, `shading="basic shading"`

---

## Output Structure

```
assets/
  characters/
    {color}-hero/
      side-view/
        west/          ← the only direction used
          idle/
          run/
          jump/
          attack/
          ...
  enemies/
    compy-dino/
      side-view/
        west/
          idle/
          walk/
          run/
          attack/
          ...
  tilesets/
    sidescroller/
      jungle.png
      volcanic.png
      tundra.png
      graveyard.png
      savanna.png
```

---

## Notes

- All characters generated at `view="side"` with 4 directions — only `west` frames are used
- Right-facing is handled by `setFlipX(true)` in code; no separate right-facing sprites needed
- `attack-club` and `attack-spear` both use `throw-object` as the base template — the `action_description` drives the specific motion
- Compy uses quadruped template; available animations are limited (19 total)
- The `downed` animation for Compy (`sitting-on-belly`) is not a death animation — may need custom description like "collapsing sideways, legs splayed, motionless"
