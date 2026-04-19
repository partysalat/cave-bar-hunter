# Upgrade Tree Design
**Design Date:** 2026-04-19

---

## Structure

- 3 paths: Brawler, Skirmisher, Tactician
- 3 tiers per path (9 nodes total)
- Sequential within a path — must unlock Tier N before Tier N+1
- Free cross-path entry — no prerequisites from other paths required
- No cross-path combo nodes (kept simple for v1)

A player unlocks roughly 6–8 nodes across a full 5-hunt session.

---

## Upgrade Points

**Flat (guaranteed):** 2 points per player per hunt

**Team bonuses (+1 each):**
- Triggered at least one stagger
- No player went down

**Individual bonuses (+1 each):**
- Most perfect dodges that hunt
- Killing blow

**Range:** 2–5 points per hunt, 8–20 across a full session. Nodes cost 1 point each. A high-performing player can reach Tier 3 by the final hunt. A casual player finishes with 2–3 nodes.

---

## Paths

### Brawler (Close Range)
*Hit harder → hit back when you tank → never waste a round*

| Tier | Upgrade |
|-|-|
| 1 | Increased damage at Close zone |
| 2 | Brace also counterattacks automatically |
| 3 | Move and attack in the same round |

### Skirmisher (Mobility)
*Survive better → profit from movement → go anywhere*

| Tier | Upgrade |
|-|-|
| 1 | Perfect dodge window extended slightly |
| 2 | Repositioning generates a bonus damage buff next round |
| 3 | Shift two zones freely in any direction |

### Tactician (Support / Coordination)
*Coordinate attacks → keep the team alive → maximize the big moments*

| Tier | Upgrade |
|-|-|
| 1 | Mark a weak point — all teammates hitting it deal bonus damage this round |
| 2 | Revive as a bonus action (doesn't consume the full round) |
| 3 | Extend the stagger window by one additional round |

---

## Notes for Later Iteration

- Exact node counts per tier (currently 1 node per tier) may expand as gameplay is refined
- Node costs may vary by tier (e.g. Tier 3 costs 2 points) if pacing needs adjustment
- Cross-path combo nodes are deferred — add once base paths are proven in playtesting
- Specific bonus amounts (damage %, dodge window extension) to be tuned during implementation