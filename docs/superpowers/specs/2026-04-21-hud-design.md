# HUD Design
**Design Date:** 2026-04-21

---

## Information Architecture

### Shared Screen (owned once, not per-player)
- Dinosaur health bar
- Active weak points (all visible from the start; hidden weak points deferred to future iteration)
- Telegraph callout — dramatic animated announcement at round start, persists as a small reminder during planning

### Personal Panels (per player)
- Health bar
- Current position (zone and flank)
- Action menu (planning phase only)
- Equipped weapon
- Active buffs
- Teammate action indicators (visible once each teammate submits)

---

## Layout

- 4 equal-width panels across the bottom of the screen
- Arena fills the full screen above the panels — no header bar
- Telegraph callout and dinosaur health overlaid on the arena
- Inactive player slots show a dimmed silhouette (no text)
- Panel count is always 4; active panels are bright, inactive are dim

---

## Phase Transitions

### Planning
- Panels fully active: action menu, position indicator, teammate indicators, health, weapon, buffs

### Resolve
- Panels collapse to health bars only — clears visual space for the action

### QTE
- Affected players: panel expands with timing bar or smash counter front and center
- Unaffected players: panel stays collapsed (health bar only) with a dim "safe" overlay
- After QTE resolves, panels return to collapsed state until next planning phase

---

## Notes for Later Iteration

- Telegraph callout animation style and duration to be tuned during implementation
- Weak point visibility rules (hidden until discovered) deferred to future iteration
- Panel expand/collapse transitions should feel snappy, not drawn out