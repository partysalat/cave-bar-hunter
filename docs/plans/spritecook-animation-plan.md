# SpriteCook Animation Plan — Player Characters
**Date:** 2026-04-21

All 4 heroes share the same animation set. Animate Red Hero first, then replicate to Blue/Yellow/Green using Red as `reference_asset_id`.

## Base Stills (approved)

| Hero | Asset ID | Hair | Cape |
|-|-|-|-|
| Red | `51afba74-798a-4952-b9ae-35feb044acca` | Brown | Red |
| Blue | `13a4a373-d306-452b-926c-e01342831625` | Black | Blue |
| Yellow | `57fe7b67-f40a-4b5d-a012-d765ca853194` | Blond | Yellow |
| Green | `620e8955-3ade-4ded-98e5-93e4d6f9dedb` | Red | Green |

---

## Animation List

### Weapon-Agnostic (9 animations × 4 heroes = 36 total)

| # | Name | Description | Frames | Loop |
|-|-|-|-|-|
| 1 | `idle` | Breathing, weight shifting, eyes scanning | 8 | Yes |
| 2 | `reposition` | Quick lateral dash step | 6 | No |
| 3 | `brace` | Transition into defensive stance, arms raising to guard | 6 | No |
| 3b | `brace-idle` | Already in guard stance — subtle breathing and arm trembling only, no transition movement | 8 | Yes |
| 4 | `revive` | Kneel and pull teammate to feet | 8 | No |
| 5 | `being-revived` | Pulled from prone back to standing | 6 | No |
| 6 | `hit` | Recoil from impact, stagger back | 4 | No |
| 7 | `downed` | Transition: collapse to ground, falling | 6 | No |
| 7b | `downed-idle` | Already prone — repeating elbow-crawl cycle with no fall transition, pure loop | 8 | Yes |
| 8 | `victory` | Fist pump celebration | 8 | Yes |
| 9 | `dodge` | Evasive leap/roll, QTE success | 6 | No |

### Weapon-Specific (12 animations × 4 heroes = 48 total)

Each weapon requires a **canonical weapon still** generated first (character holding the weapon in idle pose), then all four animations are derived from that still: **Idle** (holding weapon, planning phase), **Run** (repositioning in combat), **Attack** (fast/standard), and **Aimed Strike** (slower, deliberate).

> **Approval gate:** After generating weapon stills for a new hero, pause and show the stills to the user for approval before generating any weapon animations. Regenerate any that look off before proceeding.

> **Consistency note:** Generating a new still may introduce minor appearance variation. Check one still per weapon before committing to animations.

> **Attack animation notes:**
> - Always use `edge_margin=25` (max) for attack animations so the weapon has room to swing
> - Always use `auto_enhance_prompt=false` for ALL attack animations — auto-enhance causes the weapon to disappear mid-animation
> - Use minimum 6 frames for attacks — 4 frames causes the weapon to skip/disappear before impact
> - Key phrase: "weapon must remain fully visible throughout every frame"

#### Brawler

| Weapon | Animation | Description | Frames | Loop |
|-|-|-|-|-|
| Stone Axe | `axe-idle` | Standing ready, axe resting on shoulder | 8 | Yes |
| Stone Axe | `axe-run` | Running with axe held at side, ready to swing | 8 | Yes |
| Stone Axe | `axe-attack` | Horizontal chop swing — wind-up → arc → follow-through | 6 | No |
| Stone Axe | `axe-aimed` | Overhead precise downward strike | 6 | No |
| Shield + Club | `shield-idle` | Shield arm raised, club resting at side | 8 | Yes |
| Shield + Club | `shield-run` | Running with shield forward and club back | 8 | Yes |
| Shield + Club | `shield-attack` | Club bash with shield leading | 6 | No |
| Shield + Club | `shield-aimed` | Deliberate shield-push + club follow | 8 | No |

#### Skirmisher

| Weapon | Animation | Description | Frames | Loop |
|-|-|-|-|-|
| Spear | `spear-idle` | Spear held upright at side, alert stance | 8 | Yes |
| Spear | `spear-run` | Running with spear held horizontally, ready to thrust or throw | 8 | Yes |
| Spear | `spear-attack` | Forward thrust or throw — wind-up → motion → follow-through | 8 | No |
| Spear | `spear-aimed` | Slow wind-up, precise targeted throw | 8 | No |
| Torch | `torch-idle` | Torch held up, flame flickering, ready stance | 8 | Yes |
| Torch | `torch-run` | Running with torch raised, flame trailing behind | 8 | Yes |
| Torch | `torch-attack` | Wide swinging arc with flaming torch | 6 | No |
| Torch | `torch-aimed` | Deliberate jabbing burn strike | 6 | No |

#### Tactician

| Weapon | Animation | Description | Frames | Loop |
|-|-|-|-|-|
| Bow | `bow-idle` | Bow held loosely at side, arrow ready in other hand | 8 | Yes |
| Bow | `bow-run` | Running with bow in hand, arrow nocked and ready | 8 | Yes |
| Bow | `bow-attack` | Quick draw and loose | 8 | No |
| Bow | `bow-aimed` | Full draw, careful aim, release | 8 | No |
| Sling | `sling-idle` | Sling hanging from hand, pouch at rest | 8 | Yes |
| Sling | `sling-run` | Running with sling swinging loosely at side | 8 | Yes |
| Sling | `sling-attack` | Fast wind-up and release | 6 | No |
| Sling | `sling-aimed` | Deliberate slow wind-up, precise release | 8 | No |

---

## Totals

| Category | Per Hero | × 4 Heroes | Total |
|-|-|-|-|
| Weapon-agnostic | 11 | 4 | 44 |
| Weapon-specific | 24 | 4 | 96 |
| **Grand total** | **35** | | **140** |

---

## Generation Order

1. **Red Hero** — all 21 animations (validate style before other colors)
2. **Blue/Yellow/Green** — all 21 animations each, using Red Hero base as `reference_asset_id`

Run up to 5 concurrent jobs per batch.

### Red Hero batches

**Batch 1 (weapon-agnostic):** idle ✅, reposition ✅, brace ✅, revive ✅, hit ✅  
**Batch 2 (weapon-agnostic):** being-revived ✅, downed ✅, victory ✅, dodge ✅  
**Batch 2b (deferred):** brace-idle ⏸, downed-idle ⏸ — consistency issue (separate still changes character appearance)  
**Batch 3 (brawler):** axe-idle ✅, axe-run ✅, axe-attack ✅, axe-aimed ✅, shield-idle ✅, shield-run ✅, shield-attack ✅, shield-aimed ✅  
**Batch 4 (skirmisher):** spear-idle ✅, spear-run ✅, spear-attack ✅, spear-aimed ✅, torch-idle ✅, torch-run ✅  
**Batch 5 (skirmisher + tactician):** torch-attack ✅, torch-aimed ✅, bow-idle ✅, bow-attack ✅, bow-aimed ✅  
**Batch 6 (tactician):** sling-idle ✅, sling-attack ✅, sling-aimed ✅

### Blue Hero batches

**Batch 1 (weapon-agnostic):** idle ✅, reposition ✅, brace ✅, revive ✅, hit ✅  
**Batch 2 (weapon-agnostic):** being-revived ✅, downed ✅, victory ✅, dodge ✅  
**Batch 2b (deferred):** brace-idle ⏸, downed-idle ⏸  
**Weapon stills:** axe ✅ (two-handed), shield ✅, spear ✅, torch ✅, bow ✅, sling ✅  
**Batch 3 (brawler):** axe-idle ✅, axe-run ✅, axe-attack ✅, axe-aimed ✅, shield-idle ✅, shield-run ✅, shield-attack ✅, shield-aimed ✅  
**Batch 4 (skirmisher):** spear-idle ✅, spear-run ✅, spear-attack ✅, spear-aimed ✅, torch-idle ✅, torch-run ✅, torch-attack ✅, torch-aimed ✅  
**Batch 5 (tactician):** bow-idle ✅, bow-run ✅, bow-attack ✅, bow-aimed ✅, sling-idle ✅, sling-run ✅, sling-attack ✅, sling-aimed ✅

### Yellow Hero batches

**Weapon stills:** axe ⏳ (pending approval), shield ⏳, spear ⏳, torch ⏳, bow ⏳, sling ⏳  
**Batch 1 (weapon-agnostic):** not started  
**Batch 2 (weapon-agnostic):** not started  
**Batch 2b (deferred):** brace-idle ⏸, downed-idle ⏸  
**Batch 3 (brawler):** not started  
**Batch 4 (skirmisher):** not started  
**Batch 5 (tactician):** not started  

Then repeat for Green.

---

## Weapon Still Generation Prompts

Common parameters: `pixel=true`, `theme="prehistoric stone age caveman dinosaur hunting"`, `width=64`, `height=96`, `model=gemini-3.1-flash-image-preview`, `reference_asset_id=<hero base still>`

Character description tokens per hero:
| Hero | Cape/paint | Hair | Face paint |
|-|-|-|-|
| Red | red fur cape and tribal war paint | thick brown hair and beard | red face paint stripes |
| Blue | blue fur cape and tribal war paint | thick black hair and beard | blue face paint stripes |
| Yellow | yellow fur cape and tribal war paint | thick blond hair and blond beard | yellow face paint stripes |
| Green | green fur cape and tribal war paint | thick red hair and beard | green face paint stripes |

Weapon prompt templates (substitute character tokens above):

| Weapon | Style | Prompt suffix |
|-|-|-|
| axe-still | extreme chibi, big head small body | holding a primitive stone axe in one hand with the axe resting on shoulder, side profile view |
| shield-still | extreme chibi, big head small body | holding a round primitive shield on left arm and a wooden club in right hand, side profile view |
| spear-still | moderate chibi, slightly large head | holding a long wooden spear upright in right hand, side profile view |
| torch-still | extreme chibi, big head small body | holding a flaming torch raised in right hand with orange fire at the top, side profile view |
| bow-still | moderate chibi, slightly large head | holding a primitive short bow in left hand with arrow nocked and ready, side profile view |
| sling-still | extreme chibi, big head small body | holding a leather sling with a stone in the pouch, ready to swing, side profile view |

Full prompt structure: `Heroic prehistoric champion, {chibi style}, bold heroic stance, {cape/paint}, {hair}, fierce confident grin, bone necklace trophy, {face paint}, {weapon suffix}`

---

## Manifest Location

`assets/spritecook/manifest.json`