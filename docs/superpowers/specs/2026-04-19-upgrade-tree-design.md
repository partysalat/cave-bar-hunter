# Upgrade Tree Design
**Design Date:** 2026-04-19
**Last Updated:** 2026-04-21

---

## Structure

- 3 paths: Brawler, Skirmisher, Tactician
- 4 tiers per path (12 nodes total)
- Sequential within a path — must unlock Tier N before Tier N+1
- Free cross-path entry — no prerequisites from other paths required
- No cross-path combo nodes (kept simple for v1)

A player unlocks roughly 8–12 nodes across a full 5-hunt session. T4 is reachable by a solid performer by Hunt 4 or 5.

---

## Upgrade Points

**Flat (guaranteed):** 3 points per player per hunt

**Team bonuses (+1 each):**
- Triggered at least one stagger
- No player went down

**Individual bonuses (+1 each):**
- Most perfect dodges that hunt
- Killing blow

**Range:** 3–6 points per hunt, 12–24 across a full session. Nodes cost 1 point each.

---

## Paths

### Brawler (Close Range)
*Hit harder → hit back when you tank → never waste a round → dominate weak points solo*

| Tier | Upgrade |
|-|-|
| 1 | Increased damage at Close zone |
| 2 | Brace also counterattacks automatically |
| 3 | Move and attack in the same round |
| 4 | Close zone attacks contribute to weak point stagger at 2× rate |

### Skirmisher (Mobility)
*Survive better → profit from movement → swap freely → go anywhere*

| Tier | Upgrade |
|-|-|
| 1 | Perfect dodge window extended slightly |
| 2 | Repositioning generates a bonus damage buff next round |
| 3 | Weapon swap costs a bonus action instead of a full round action |
| 4 | Shift two zones freely in any direction |

### Tactician (Support / Coordination)
*Coordinate attacks → keep the team alive → maximize the big moments → make staggers cascade*

| Tier | Upgrade |
|-|-|
| 1 | Mark a weak point — all teammates hitting it deal bonus damage this round |
| 2 | Revive as a bonus action (doesn't consume the full round) |
| 3 | Extend the stagger window by one additional round |
| 4 | When a stagger triggers, all players gain a free bonus action next round |

---

## Notes for Later Iteration

- Exact node counts per tier (currently 1 node per tier) may expand as gameplay is refined
- Node costs may vary by tier (e.g. Tier 4 costs 2 points) if pacing needs adjustment
- Cross-path combo nodes are deferred — add once base paths are proven in playtesting
- Specific bonus amounts (damage %, dodge window extension) to be tuned during implementation