# M6: Asset Generation Plan

**Date:** 2026-02-15
**Purpose:** Sidescroller sprites for 4 hero characters, Compy enemy, and 5 arena tilesets.
**Only the `east` direction is used in-game** — all other directions can be ignored. The code flips `east` horizontally for left-facing.

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
| Red | `83d92089-d62e-48d0-a13b-6e16efd553fd` | `Heroic prehistoric champion in red fur cape and tribal war paint, thick wild beard, fierce confident grin, muscular chibi build, bone necklace trophy, red face paint stripes, legendary hunter, bold heroic stance` |
| Blue | `2967b50a-7e56-4635-b99e-15619ba333bf` | `Heroic prehistoric champion in blue fur cape and tribal war paint, thick wild black beard, hearty laugh, muscular chibi build, bone necklace trophy, blue face paint stripes, legendary hunter, bold heroic stance` |
| Yellow | `467727a6-88dd-4021-98c3-93f4ea34f10b` | `Heroic prehistoric champion in yellow fur cape and tribal war paint, thick wild blonde beard, bold confident smile, muscular chibi build, bone necklace trophy, yellow face paint stripes, legendary hunter, bold heroic stance` |
| Green | `c41dadbe-3c0c-4830-a017-d3454314eb12` | `Heroic prehistoric champion in green fur cape and tribal war paint, thick wild red beard, fierce grinning expression, muscular chibi build, bone necklace trophy, green face paint stripes, legendary hunter, bold heroic stance` |

### Compy

Settings: `view="side"`, `size=64`, `n_directions=4`, `body_type="quadruped"`, `template="dog"`

| ID | Description |
|---|---|
| `377b6fd7-cfc8-441c-88f7-bf4a5c3a664b` | `Small compsognathus dinosaur, vicious pack hunter, sharp claws and teeth, green and brown scaly skin, slender bipedal body, long tail for balance, aggressive predatory stance, reptilian eyes` |

---

## Hero Animations

Apply to **all 4 hero characters**. Use the `east` direction frames only.

### Without Weapon

|Red hero| Game Key | Template ID | Action Description |
||---|---|---|
|x| `idle` | `breathing-idle` | muscular prehistoric caveman standing in relaxed ready stance, both hands empty at sides, weight balanced on both feet, chest rising and falling with steady breathing, eyes alert and scanning, confident warrior posture |
|x| `run` | `running-8-frames` | prehistoric caveman sprinting at full speed with no weapon, arms pumping hard for momentum, knees driving high, body leaning forward, aggressive full-speed run |
|x| `jump` | `jumping-1` | caveman warrior leaping upward with explosive leg drive, both hands free and arms spread wide for balance, knees tucking up during apex, determined athletic jump |
|x| `attack` | `cross-punch` | caveman warrior throwing a powerful cross punch: weight shifting to back foot, torso rotating explosively, dominant fist driving forward with full shoulder and hip rotation, full body power behind the strike |
|x| `dodge` | `running-slide` | prehistoric warrior executing emergency evasive maneuver: dropping into rapid forward slide with body tucking low, arms protecting head, sliding across ground with momentum, instinctive survival reflex dodge |
|| `downed` | `falling-back-death` | injured warrior collapsing: falling backward with arms flailing, hitting ground hard on back, then desperately crawling forward on elbows dragging legs, reaching out with one hand for help, struggling to move while severely wounded, vulnerable prone position |
|| `get-up` | `getting-up` | wounded warrior recovering: starting from prone position, pushing up with one hand on ground, rising unsteadily, wobbling slightly but regaining stance, determined recovery with renewed resolve |

### With Club

| Game Key | Template ID | Action Description |
|---|---|---|
| `idle-club` | `fight-stance-idle-8-frames` | burly prehistoric warrior in aggressive melee stance, wooden club resting on right shoulder with handle gripped in hand, heavy club head visible behind shoulder, left hand clenched in fist at side, wide stable footing, chest puffed out, intimidating posture like ready to charge into close combat, weight shifting slightly with breathing |
| `run-club` | `running-8-frames` | muscular caveman charging forward at full speed, wooden club hoisted over right shoulder with one-handed grip, free arm pumping for momentum, aggressive bull-rush sprint with heavy footfalls, body leaning forward like a linebacker, fierce melee charge ready to close distance and bash |
| `jump-club` | `jumping-1` | powerful warrior launching upward with strong leg drive, wooden club gripped firmly in both hands and held diagonally across body, club head pointing up and to the side, knees tucking during jump, explosive athletic leap with weapon secure |
| `attack-club` | `throw-object` | caveman warrior executing powerful horizontal club swing: winding up with club pulled back high, torso twisting, then explosive forward arc with full body rotation, club head sweeping in wide horizontal strike at chest height, brutal melee bash with follow-through |

### With Spear

| Game Key | Template ID | Action Description                                                                                                                                                                                                                                                                                                   |
|---|---|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `idle-spear` | `fight-stance-idle-8-frames` | muscular prehistoric caveman hunter standing in ready stance, holding stone spear vertically at shoulder height with right hand gripping shaft mid-way, left hand resting near hip, weight balanced on both feet, chest rising and falling with steady breathing, eyes alert and scanning, confident warrior posture |
| `run-spear` | `running-8-frames` | prehistoric hunter running at full sprint, stone spear held horizontally at chest level with throwing hand back near head and front hand extended forward for balance, athletic running gait with knees pumping high, leaning slightly forward, aggressive pursuit run like chasing prey                             |
| `jump-spear` | `jumping-1` | caveman warrior leaping upward with both hands gripping a stone spear held diagonally across the body at chest level, spear angled forward and upward, knees driving high, body coiled and ready to thrust on landing, aggressive offensive leap                                                                     |
| `attack-spear` | `throw-object` | c                                                                                                                                                                                                                                                                                                                    |

### With Bow

| Game Key | Template ID | Action Description |
|---|---|---|
| `idle-bow` | `fight-stance-idle-8-frames` | nimble prehistoric hunter in alert skirmisher stance, primitive short bow held vertically in left hand at side, right hand resting near arrow quiver on back, weight on balls of feet ready to move, shoulders relaxed but ready, skilled ranged combatant posture, eyes tracking targets |
| `run-bow` | `running-8-frames` | agile hunter sprinting with quick light footwork, primitive short bow gripped in left hand at shoulder height, right arm pumping for speed, athletic runner's form with smooth efficient stride, bow and arrow ready for quick deployment, mobile skirmisher ready to kite and strike from range |
| `jump-bow` | `jumping-1` | lithe warrior springing upward with nimble athletic form, primitive short bow clutched in left hand, right arm extended for balance, body compact during jump, graceful evasive leap while maintaining weapon ready |
| `attack-bow` | `fireball` | skilled archer executing draw and release: reaching back to quiver to draw arrow, nocking arrow to bow string, pulling string back to cheek with full draw, bow arm extended forward with slight upward arc for ballistic trajectory, releasing with snap of fingers, arrow launching upward in arc, follow-through with bow arm, expert prehistoric ranged weapon technique |

### With Net Launcher

| Game Key | Template ID | Action Description |
|---|---|---|
| `idle-net` | `fight-stance-idle-8-frames` | tactical prehistoric hunter in careful support stance, primitive crossbow-style net launcher held horizontally across body at waist level with both hands gripping stock and barrel, weight balanced and steady, alert posture scanning for opportunities to assist teammates, patient supportive warrior ready to immobilize targets |
| `run-net` | `running-8-frames` | support hunter running with purposeful stride, primitive net launcher tucked under right arm with both hands securing it, left arm partially extended for balance, efficient movement prioritizing weapon safety, focused repositioning run like getting into optimal support position |
| `jump-net` | `jumping-1` | support warrior leaping with controlled form, primitive net launcher gripped firmly in both hands held close to chest during jump, knees tucking upward, careful to protect the weapon mechanism during the jump, deliberate athletic leap |
| `attack-net` | `throw-object` | hunter firing primitive crossbow-style net launcher: planting feet wide in stable firing stance, raising the crossbow net launcher to shoulder level with both hands gripping stock and barrel, squinting to aim down the length of the weapon, then squeezing trigger mechanism with right hand, crossbow recoiling slightly with the shot, net projectile launching forward trailing cords, follow-through holding aim position, skilled support weapon deployment |

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
        east/          ← the only direction used
          idle/
          run/
          jump/
          attack/
          ...
  enemies/
    compy-dino/
      side-view/
        east/
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

- All characters generated at `view="side"` with 4 directions — only `east` frames are used
- Left-facing is handled by `setFlipX(true)` in code; no separate left-facing sprites needed
- `attack-club`, `attack-spear`, `attack-net` all use `throw-object` as the base template — `action_description` drives the specific motion
- `attack-bow` uses `fireball` (two-handed raise + release motion fits bow draw better than `throw-object`)
- Compy uses quadruped template; available animations are limited (19 total)
- The `downed` animation for Compy (`sitting-on-belly`) is not a death animation — may need custom description like "collapsing sideways, legs splayed, motionless"
