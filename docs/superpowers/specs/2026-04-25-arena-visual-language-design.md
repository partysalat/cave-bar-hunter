# Arena Visual Language Design
**Design Date:** 2026-04-25

---

## Overview

The hunt arena uses a persistent diegetic 3×3 positional grid. The dino is fixed on the right edge of the screen. Players occupy cells to its left. The grid is always visible via environmental cues — no UI overlay, no explicit gridlines.

**Perspective: flat side view.** The arena is not isometric or 3/4. All three flank lanes sit at the same visual depth — no per-lane sprite scaling, no occlusion sorting, no perspective-projected ground. Player sprites are east-facing side profiles throughout. Depth cues (subtle scale, slight Y offset by lane) can be layered in later without restructuring the system.

Two axes:

| Axis | Direction | Visual treatment |
|-|-|-|
| Distance | Horizontal (Far=left, Close=right) | Lighting + ground texture columns |
| Flank | Vertical (Left=top, Right=bottom) | Terrain seams + background anchors |

---

## Grid Layout

```
           FAR      MID     CLOSE
            │        │        │     🦕
 [anchor1] ─ · · · · · · · · · ─ Left (top)
            ·┄┄┄┄┄┄ seam ┄┄┄┄┄·
 [anchor2] ─ · · · · · · · · · ─ Center
            ·┄┄┄┄┄┄ seam ┄┄┄┄┄·
 [anchor3] ─ · · · · · · · · · ─ Right (bottom)
            │        │        │
          dark     mid      bright
```

Cell boundaries are implied — not explicit. Distance column is read from lighting and texture. Flank lane is read from seam position and anchor alignment. The dino is fixed and never shifts vertically.

---

## Distance Bands (columns)

Three vertical columns distinguished by lighting and ground texture. Column boundaries are marked by natural vertical props (vine curtains, rock ridges) — not lines.

| Column | Lighting | Ground texture | Feel |
|-|-|-|-|
| Far | Cool, dim, shadowed | Thick moss, dense ferns | Safe, hidden |
| Mid | Neutral, dappled | Mixed dirt and roots | Transitional |
| Close | Warm, bright, torchlit | Bare dirt, scorch marks | Dangerous |

The lighting gradient reinforces the risk gradient: moving right toward the dino means hotter, more exposed terrain.

---

## Flank Lanes (rows)

Three horizontal rows divided by two seams. Seams are subtle environmental features — a line of stones, a root crack, a texture shift — present enough to read, not dominant.

Each row has a distinct background anchor on the far-left edge. Anchors are the primary mnemonic: players say "I'm in the boulder lane" rather than "I'm in center flank." Anchors must be visually distinct in silhouette to read at bar distance.

| Row | Seam type (Dense Jungle) | Anchor (Dense Jungle) |
|-|-|-|
| Left (top) | Skull-rock line | Twisted dead tree |
| Center | Root crack | Mossy boulder |
| Right (bottom) | Vine tangle | Bone pile |

```
[dead tree] ══════════════════════════════  Left
             · · · · skull rocks · · · ·       ← seam
[boulder]   ══════════════════════════════  Center
             · · · · root crack  · · · ·       ← seam
[bone pile] ══════════════════════════════  Right
```

---

## Player Occupancy Markers

Each player has a persistent glowing ring on the ground beneath their sprite. Rings move with the player tween when repositioning.

| Property | Detail |
|-|-|
| Shape | Circle, ground-level |
| Size | Fits within one cell, does not touch seams |
| Color | Per-player color, matches HUD panel color |
| Style | Bioluminescent moss glow — soft pulse |
| Behavior | Pulse rate increases in Close column |

Two rings never share a cell. If the positioning system allows adjacency, rings are visually offset slightly to remain individually readable. Ring color is the cross-view identity link — same color in ring and HUD panel.

---

## Attack Telegraphs

Two-stage highlight when the dino announces an attack:

**Stage 1 — Shape overlay (~1.5s):** Appears immediately over affected cells. Shape communicates attack type.

| Attack type | Shape |
|-|-|
| Tail sweep (full row) | Horizontal arc spanning the row |
| Stomp (single cell) | Circle/splat on that cell |
| Bite (Close column) | Cone pointing left from dino |
| Roar (full grid) | Expanding ring outward from dino |

**Stage 2 — Ground pulse (until attack resolves):** Shape fades, replaced by red-amber ground glow over affected cells. Anchor props and column lighting in affected cells pulse slowly as countdown reminder.

Players who reposition out of affected cells during planning see the danger color leave their ring — immediate confirmation they're safe.

```
  Telegraph: "TAIL SWEEP — Center row"

  Stage 1:
  [rock]  ══[arc ══════════════════ arc]══  Center

  Stage 2:
  [rock]  ──[▒▒▒▒▒]──[▒▒▒▒▒]──[▒▒▒▒▒]──  Center
```

---

## Arena Theming

The visual grammar is fixed. What changes per arena is the skin — props, textures, seam types.

| Element | Dense Jungle | Tar Pits | Volcanic Rocks | Frozen Tundra | Bone Graveyard | Open Savanna |
|-|-|-|-|-|-|-|
| Far column | Deep moss, ferns | Dark mud | Ash and shadow | Ice shelf | Bone dust | Dry grass, shade |
| Close column | Torchlit dirt | Bubbling tar edge | Lava-lit rock | Cracked ice | Bleached bone | Harsh sunlight |
| Column dividers | Vine curtains, rock ridge | Tar flow lines | Lava cracks | Ice ridges | Rib cage arches | Dust drifts |
| Row seams | Skull rocks / root crack | Stepping stones | Obsidian shards | Snow ridges | Spine rows | Grass tufts |
| Lane anchors (L/C/R) | Dead tree / boulder / bone pile | Skull post / tar geyser / submerged log | Volcanic vent / rock spire / lava pool | Frozen mammoth / ice column / snow drift | Giant skull / pelvis / claw | Termite mound / watering hole / dead tree |

**Rule for new arenas:** fill in the theming table. The positional grammar — three columns, two seams, three anchors — never changes. Players who learn Dense Jungle can read any other arena immediately.