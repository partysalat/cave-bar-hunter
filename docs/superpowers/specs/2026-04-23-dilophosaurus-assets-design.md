# Dilophosaurus Assets Design
**Date:** 2026-04-23

---

## Overview

Dilophosaurus is the Hunt #1 solo boss. Realistic pixel art proportions — not chibi — to read as threatening against the chibi player heroes. Side profile facing left, combat-ready.

**Full target animation set (C):** still → idle → spit attack → bite → stagger → telegraph → walk/reposition → death. This spec covers phase A only (still + idle). Remaining animations added in follow-up sessions.

---

## Visual Design

- **Proportions:** Realistic anatomical dinosaur — long tail, digitigrade legs, visible musculature. Not chibi.
- **Distinctive features:** Twin head crests (vivid yellow-orange), neck frill partially raised in threat display
- **Coloring:** Dark green/brown mottled skin, yellow-orange crests, pale underbelly
- **Pose:** Weight shifted forward, head slightly lowered, combat-ready stance
- **Facing:** Left (toward players)
- **Size:** 192×192

---

## Asset List — Phase A

| Asset | Type | Frames | Loop | Description |
|-|-|-|-|-|
| `still` | Image | 1 | — | Base combat-ready pose, used as reference for all animations |
| `idle` | Animation | 8 | Yes | Slow predatory breathing, ribcage expanding, head scanning, tail sweep, frill pulsing subtly |

---

## Generation

1. Generate `still` with `generate_game_art` — pause for user approval before animating
2. Generate `idle` with `animate_game_art` from approved still

---

## File Locations

- `assets/spritecook/enemies/dilophosaurus/still.png`
- `assets/spritecook/enemies/dilophosaurus/idle.webp`
- Manifest: `assets/spritecook/manifest.json` under `"enemies" > "dilophosaurus"`

---

## Credit Estimate (Phase A)

| Asset | Credits |
|-|-|
| Still | 12 |
| Idle animation | 20 |
| **Total** | **32** |

Current balance: ~624 credits. Well within budget.
