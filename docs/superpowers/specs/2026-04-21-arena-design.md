# Arena Design
**Design Date:** 2026-04-21

---

## Structure

- 6 arenas total, randomly assigned to hunts each session
- All arenas use the same 3×3 positional grid (Close/Mid/Far × Left/Center/Right)
- Each arena adds environmental modifiers on top of the base grid
- Each arena has a unique entry sequence that sets the tone for the hunt

---

## Arenas

### Dense Jungle
**Entry:** Players swing in on lianas and drop into the arena floor.
**Modifier:** Far zone grants cover — incoming damage reduced 20%.

---

### Tar Pits
**Entry:** Players leap across stepping stones over bubbling tar to reach the arena floor.
**Modifier:** Moving through tar costs 2 zones instead of 1.

---

### Volcanic Rocks
**Entry:** Players rappel down a rocky cliff face as lava flows below.
**Modifier:** Geysers erupt on a timer — being in the affected zone deals damage but also contributes to the dinosaur's stagger threshold.

---

### Frozen Tundra
**Entry:** Players slide down an icy slope and scramble to their feet.
**Modifier:** Repositioning overshoots by one zone (slippery).

---

### Bone Graveyard
**Entry:** Players crawl through a narrow cave opening, emerging into the arena.
**Modifier:** An elevated platform is available as a 4th distance zone — immune to ground attacks, melee impossible from this position.

---

### Open Savanna
**Entry:** Players crest a hill and see the dinosaur below — dramatic pause before descending.
**Modifier:** None — pure skill, no environmental effects. Reserved for apex bosses.

---

## Notes for Later Iteration

- Entry animations are cinematic — players do not have control during entry
- Arena assignment is random per session; same arena can appear in different hunts across sessions
- Geyser timing in Volcanic Rocks and overshoot behavior in Frozen Tundra to be tuned during implementation
- Visual detail (lighting, props, background) is art direction, not spec