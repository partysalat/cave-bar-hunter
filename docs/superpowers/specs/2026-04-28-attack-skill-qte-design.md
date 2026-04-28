# Attack Skill QTE Design
**Date:** 2026-04-28

---

## Overview

Attacking feels passive compared to dodging. This spec adds a skill component to offensive actions — a weapon-specific QTE that fires simultaneously with the dodge QTE, making every round a moment of simultaneous offense and defense.

Two weapons are in scope for the spike: **club** (timing press) and **bow** (directional reticle). Each player carries both and starts the hunt with the club active. Switching costs a full round action.

---

## Round Structure

The `dodge_qte` state in `RoundStateMachine` is replaced by `attack_and_dodge_qte`:

```
PLAN → SUBMIT → RESOLVE → ATTACK_AND_DODGE_QTE → PLAN
```

During `attack_and_dodge_qte`:
- Players who chose `attack` or `aimed_strike` see their weapon QTE
- Players in the dinosaur's attack zone see the dodge QTE
- A player can be doing both simultaneously — both widgets render in their panel
- Players who chose `reposition`, `brace`, `switch_weapon`, or `revive` see a dim result overlay
- The phase ends when all active QTEs resolve or a shared timeout expires

---

## Weapon System

### Types

```ts
type WeaponType = 'club' | 'bow'
```

### PlayerState additions

```ts
activeWeapon: WeaponType      // starts as 'club' for all players
inventory: WeaponType[]       // hardcoded ['club', 'bow'] for the spike
```

### Switch Weapon action

`switch_weapon` is added to `PlayerAction.type`. It costs the full round action. On resolve, `activeWeapon` swaps to whichever weapon in inventory is not currently active. No QTE — the switch executes immediately during resolution.

### RoundResult addition

```ts
attackingPlayers: { playerId: PlayerId, weaponType: WeaponType, action: 'attack' | 'aimed_strike' }[]
```

`ActionResolver` reads `activeWeapon` from `PlayerState` when resolving attack actions and populates this field so the view knows which QTE to render.

---

## Club Mechanic

A shrinking timing bar — the same input grammar as the dodge QTE.

**Visual:** A horizontal bar shrinks from both ends toward a highlighted sweet-spot window in the center. Press `A` / `Space` when the remaining bar is inside the window.

**Parameters:**
- Duration: ~1.5s
- Sweet-spot width: ~25% of bar, centered and static

**Outcomes:**

| Timing | Result |
|-|-|
| Inside window | Critical hit — 2× base damage |
| Outside window | Base damage |

No miss. The floor is always base damage.

**Critical hit + `aimed_strike`:** Counts as a weak point hit (full weak point damage, stagger contribution, 3 pt bonus).

**Critical hit + plain `attack`:** 2× damage only. No weak point bonus — the player hit hard but didn't target a weak point. This keeps `aimed_strike` meaningfully distinct.

---

## Bow Mechanic

A directional reticle the player steers onto the target.

**Visual:** The player's panel shows a dino silhouette with two highlighted zones — `head` and `legs`. A circular reticle starts centered on the body. D-pad moves it. Press `A` / `Space` to release the arrow.

**Parameters:**
- Duration: ~2s
- Reticle speed: fast enough to reach either zone from center in ~0.5s

**Outcomes:**

| Reticle position on release | Result |
|-|-|
| On a weak point zone | Weak point hit — full weak point damage, stagger contribution |
| On body | Base damage, no weak point progress |

No miss. Body hit always deals base damage.

**`aimed_strike` hint:** When the player chose a specific weak point during planning, the reticle starts pre-positioned near that zone as a visual hint.

---

## Event Bus

Three new events added to the logic → view contract:

| Event | Payload | Consumer |
|-|-|-|
| `AttackQTEStart` | `playerId, weaponType, action, targetWeakPoint?` | `PlayerPanel` — renders correct widget |
| `AttackQTEResult` | `playerId, weaponType, success, critical` | `PlayerPanel` — hit fx; `HuntScene` — applies damage |
| `WeaponSwitched` | `playerId, newWeapon` | `PlayerPanel` — updates weapon icon |

`AttackQTEStart` fires at the same moment as `QTEStart` (dodge) when `attack_and_dodge_qte` begins.

---

## HUD / PlayerPanel

**Weapon icon:** Small club or bow glyph next to the player's health bar, always visible. Updates immediately on `WeaponSwitched`.

**During `attack_and_dodge_qte`:**

| Situation | Panel content |
|-|-|
| Attacking only | Weapon QTE widget (full panel) |
| Dodging only | Dodge QTE widget (full panel) |
| Attacking + dodging | Attack widget above, dodge widget below |
| Neither | Dim result overlay |

Club QTE reuses the dodge timing bar widget with a distinct color. Bow QTE is a new widget: dino silhouette + zone highlights + reticle.

---

## Scoring

No new scoring categories. Existing table covers all outcomes:

| Event | Points |
|-|-|
| Damage dealt | 1 pt/hit |
| Weak point hit | 3 pts |
| Perfect dodge | 5 pts |
| Stagger contribution | 3 pts |
| Teammate revive | 10 pts |

Critical club hit on plain `attack` awards damage points only (1 pt/hit, doubled). Weak point hit bonus (3 pts) requires either bow-on-zone or club crit on `aimed_strike`.

---

## Late-Game Extension (Out of Scope for Spike)

- Weapon selection in cave bar (choose starting weapon per hunt)
- Dual-wield: carry two chosen weapons, switch mid-hunt
- Additional weapon types with their own QTE mechanics
- Weapon upgrades affecting QTE parameters (wider sweet spot, faster reticle, etc.)