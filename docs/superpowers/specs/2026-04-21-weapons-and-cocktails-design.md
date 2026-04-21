# Weapons & Cocktails Design
**Design Date:** 2026-04-21

---

## Weapons

### Structure
- Each player carries up to two weapons into a hunt
- Weapons affect damage profile and which zones actions are effective in
- Weapons do not change the action menu — all players use the same actions (Attack, Aimed Strike, Reposition, Brace, Use Ability, Revive)
- Swapping weapons mid-hunt costs the full round action
- Future Skirmisher upgrade node: reduce or eliminate weapon swap cost

### Weapon Selection
- Before Hunt 1: players pick one weapon (second slot locked)
- Before Hunt 2: second weapon slot unlocks — players can pick a second weapon at the weapon rack
- Weapons can be swapped at the weapon rack between hunts

### Weapon Roster

**Brawler (Close Range)**

| Weapon | Profile |
|-|-|
| Stone Axe | Fast, Close range damage — lower per-hit damage, higher attack frequency |
| Shield + Club | Defensive — reduces incoming damage, pairs with Brace (Tier 2: Brace counterattacks) |

**Skirmisher (Mobility)**

| Weapon | Profile |
|-|-|
| Spear | Hybrid — melee at Close, throwable at Mid/Far; bridges zones for mobile players |
| Torch | Close range, applies burn status effect |

**Tactician (Support)**

| Weapon | Profile |
|-|-|
| Bow | Far range, precise — best for Aimed Strike at weak points without entering danger |
| Sling | Far range, stagger-focused — low damage but strong contribution to stagger threshold |

### Range Rules
- **Melee weapons** (Stone Axe, Shield + Club, Torch): Attack and Aimed Strike only effective at Close/Mid range
- **Ranged weapons** (Bow, Sling): Attack and Aimed Strike effective at any range; cannot use melee actions at Close range
- **Spear**: hybrid — melee at Close, throwable at Mid/Far

---

## Cocktails

### Thematic Premise
Hunting dinosaurs yields rare ingredients — the premise of the game is that the best cocktail ingredients come from where the dinosaurs are. Defeating bosses unlocks new cocktails on the bartender's menu.

### Structure
- Available from Hunt 2 onward (no cocktails before Hunt 1)
- Limit: 2 cocktails per player per hunt
- Fixed menu that expands as bosses are defeated — each defeated dinosaur unlocks new options
- Cocktails are consumable buffs, purchased from the bartender in the cave bar

### Cocktail Roster

All names are in German. 5 cocktails total — one unlocked after each hunt, cumulatively available.

| Unlocks after | Name | Translation | Effect |
|-|-|-|-|
| Hunt 1 | **Urzeitblut** | Primeval Blood | Extended dodge window this hunt |
| Hunt 2 | **Krallentrank** | Claw Brew | Bonus damage on perfect dodge this hunt |
| Hunt 3 | **Sturmläufer** | Storm Runner | Next repositioning move is free (no action cost) |
| Hunt 4 | **Herdenschrei** | Pack Roar | Group-wide stagger assist — your hits count double toward stagger threshold this hunt |
| Hunt 5 | **Tyrannenblut** | Tyrant's Blood | Once per hunt, automatically survive a hit that would down you |

---

## Notes for Later Iteration

- Exact damage values, burn duration, and stagger contribution amounts to be tuned during implementation
- Weapon unlock progression (starting with a subset, unlocking more) could be added in a future iteration
- Skirmisher upgrade to reduce weapon swap cost is a natural Tier 2 or Tier 3 node candidate