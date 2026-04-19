# Prehistoric Hunter — Round-Based Edition
**Design Date:** 2026-04-19
**Session Length:** 30–44 minutes
**Players:** 1–4 cooperative, simultaneous input

---

## Executive Summary

Prehistoric Hunter is a cooperative boss-battle game where 1–4 players take on the roles of caveman hunters defeating five escalating dinosaur bosses in a single session. Combat is round-based with simultaneous planning: every player commits their action at the same time, then watches the consequences play out — followed by a reflex dodge window when the dinosaur strikes back.

Players start identical and specialize through an upgrade tree between hunts, naturally diverging into different roles without being forced into them.

**Core appeal for bar environment:**
- Spectator-friendly: clear planning UI, dramatic resolution moments
- Social: players verbally coordinate during the planning phase
- Accessible: simple turn structure, visual telegraphs for everything
- High energy: dodge QTEs keep everyone engaged even when it's not "their turn"
- Thematic: cave bar setting mirrors the real bar, cocktails as power-ups

---

## Core Loop

Each round follows four phases:

```
PLAN → SUBMIT → RESOLVE → DODGE QTE
```

### 1. Plan
- Dinosaur **telegraphs its next attack** at the start of each round
  - Attack type, affected zone, and timing are shown clearly
  - Example: *"TAIL SWEEP — hits Close range, left flank"*
- Each player simultaneously chooses one action on their gamepad panel (shown at the bottom of the screen)
- A short timer counts down (8–12 seconds depending on boss)
- Players can see each other's choices as they're made, enabling verbal coordination

### 2. Submit
- When all players confirm (or timer expires), the round locks in
- Brief dramatic pause before resolution

### 3. Resolve
- Player actions execute: attacks, repositioning, abilities
- Weak point hits, damage numbers, and status effects all appear
- If the dinosaur was **staggered** (accumulated enough hits on weak points): resolution skips straight to a free damage window — no incoming attack this round

### 4. Dodge QTE
- Dinosaur's telegraphed attack executes
- Players in the affected zone get a timed input window to dodge
- Players who **repositioned out of the zone** during planning skip the QTE entirely
- Two QTE types depending on situation:
  - **Timing press** (shrinking bar): for standard dodges — rewards reading the telegraph, scales with skill
  - **Button smasher**: for escape situations — grabbed by a raptor, pinned underfoot, tangled in vines — frantic energy, great for spectators
- **Perfect dodge** (input in the final moment of the timing window): bonus points + free counterattack opportunity
- Miss: full damage, possible downed state

### Later Iteration: Combo Attacks
During a stagger window, players will be able to trigger a **cooperative combo finisher** — a shared QTE where two or more players input a sequence together to land a massive strike. High spectator payoff, deep coordination reward.

---

## Positioning System

Instead of a full 2D grid, positioning uses two axes:

**Distance** (3 zones):
| Zone | Risk | Damage |
|------|------|--------|
| Close | High — harder to dodge, bigger hits incoming | High |
| Mid | Balanced | Balanced |
| Far | Low — easy to dodge | Low |

**Flank** (3 positions):
- Left / Center / Right relative to the dinosaur

This creates a 3×3 positional grid that's easy to understand but deep enough for real decisions. Dinosaur attacks have zone profiles — *"tail sweep hits Close+Mid, left flank"* — so where you stand matters every round.

**Movement rules:**
- Moving is a free action but limited: shift one zone per round (distance or flank, not both)
- Repositioning out of an attack zone during planning means no QTE — rewarding good reads
- Some abilities let players move further or instantly reposition

---

## Player Actions (Per Round, Choose One)

| Action | Effect |
|--------|--------|
| **Attack** | Strike current target — damage based on zone and equipped weapon |
| **Aimed Strike** | Target a specific weak point — slower, higher reward |
| **Reposition** | Move two zones instead of one |
| **Brace** | Reduce incoming damage this round, automatically succeed dodge |
| **Use Ability** | Activate an unlocked special (varies by specialization) |
| **Revive** | Bring back a downed teammate in the same zone |

---

## Stagger System

The primary cooperative reward is the **stagger**:

- Each weak point has a stagger threshold (accumulated damage)
- When a weak point breaks: the dinosaur staggers
- **Stagger round:** no incoming attack, all weak points exposed, 3× damage multiplier
- Screen effect: slow-motion flash, *"STAGGER!"* callout
- Encourages verbal coordination: *"Everyone hit the legs — two more hits and it staggers"*

Stagger thresholds reset (partially) after each stagger, so later rounds require more coordination to trigger again.

---

## Session Structure

A full session consists of **5 hunts**, one dinosaur each, with cave bar phases in between:

| Hunt | Dinosaur | Est. Time |
|------|----------|-----------|
| 1 | Compy Pack / Dilophosaurus | 4 min |
| 2 | Triceratops / Stegosaurus | 6 min |
| 3 | Raptor Alpha / Carnotaurus | 7 min |
| 4 | Spinosaurus / Allosaurus | 8 min |
| 5 | T-Rex / Giganotosaurus / Quetzalcoatlus | 10 min |

Each hunt is a self-contained boss fight. Total hunt time: ~35–45 minutes plus cave bar phases.

---

## Cave Bar Phase (Between Hunts)

After each hunt players return to the **cave bar hub** — a prehistoric cave interior with stone furniture, torchlight, cave paintings, and a gruff Neanderthal bartender.

**There is no time limit in the cave bar.** Players stay as long as they like, strategize, argue about upgrades, and leave when everyone confirms ready. This is a deliberate social moment — the bar equivalent of halftime.

### Upgrade Tree (Cave Paintings on the Wall)
- All players start identical
- Earn upgrade points from hunt performance
- Spend points on a branching tree — personal choices diverge naturally
- By hunt 3 a team typically has a close-range brawler, a ranged attacker, a support, and a flexible hybrid without anyone being forced into a role

### Cocktails (From the Bartender)
- Consumable buffs purchased before each hunt
- Limit: 2 per player per hunt
- Examples: bonus damage on perfect dodge, extended dodge window, group-wide stagger assist

### Weapon Rack
- Swap or upgrade primary weapon between hunts
- Weapons affect which actions are available and their damage profiles

### Scoreboard (Carved Stone)
- Live standings updated after each hunt
- MVP crown for current leader
- Stat highlights: most staggers triggered, most perfect dodges, most revives

### Trophy Wall
- Defeated dinosaurs shown in full art with checkmark
- Upcoming boss shown as glowing silhouette — builds anticipation

### Bartender Character
- Gruff but friendly Neanderthal, communicates through grunts and gestures
- Reacts to player performance: cheers good hunts, skeptical grunts for poor ones
- Idle: cleaning a bone mug
- Serving: slides drink across the stone bar

### Drop-In / Drop-Out
- New players join through the cave entrance during the cave bar phase
- Leaving players walk out the exit
- Not possible mid-hunt — hunts are committed once started

---

## Specialization Tree

Everyone starts with the same base stats. The tree has three broad paths that can be mixed freely:

### Brawler (Close Range)
- Increased damage at Close zone
- Brace also counterattacks automatically
- Late unlock: move and attack in the same round

### Skirmisher (Mobility)
- Shift two zones freely in any direction
- Perfect dodge window extended slightly
- Repositioning generates a bonus damage buff next round

### Tactician (Support / Coordination)
- Revive as a bonus action (doesn't consume the full round)
- Mark a weak point — all teammates hitting it this round deal bonus damage
- Extend the stagger window by one additional round

No path is locked out. Players can mix across trees — a Close-range Tactician or a mobile support are both valid.

---

## Dinosaur Roster

### Hunt 1 — Warm-Up

**Compy Pack**
- Multiple small targets — teaches the planning loop before complexity arrives
- Attacks are simple single-zone strikes with long telegraphs
- Stagger threshold very low: rewards early coordination
- Weak points: any body hit counts, focus fire one at a time

**Dilophosaurus**
- Health: Low
- Attacks: Poison spit (blurs affected players' screens), bite
- Behavior: Maintains Mid range, spits when players cluster, retreats if cornered
- Weak points: Head (spit source), legs
- Strategy: spread across flanks to avoid multi-spit, rush during spit recovery

### Hunt 2 — Herbivores

**Triceratops**
- Health: Medium-high
- Attacks: Horn Charge (full Center column, any distance), Tail Whip (Close+Mid, right flank)
- Behavior: Charges the most-stacked column — baitable
- Weak points: Rear legs (exposed during charge recovery), Horn (only during stagger)
- Strategy: stack Center to bait the charge, split to flanks immediately after

**Stegosaurus**
- Health: Medium
- Attacks: Tail Sweep (270° arc, hits Close+Mid on both flanks), Stomp (Close, Center only)
- Behavior: Slow to turn — positions its tail toward threats
- Weak points: Head (opposite the tail, hard to reach), legs
- Strategy: split team to attack head and tail simultaneously, bait sweeps

### Hunt 3 — Aggressive Carnivores

**Raptor Alpha**
- Health: Medium
- Attacks: Pounce (button smasher QTE — pins a player), Claw Slash, Howl (summons 2 adds at 66% and 33% HP)
- Behavior: Targets isolated players, circles at Mid range
- Weak points: Head, Back (only while pouncing)
- Strategy: stay grouped to deny pounce opportunities, kill adds immediately

**Carnotaurus**
- Health: High
- Attacks: Bull Rush (full Far→Close column charge), Ground Pound (Close, all flanks), Bite
- Behavior: Relentless forward pressure, enrages at 50% HP — shorter telegraphs
- Weak points: Legs (causes stumble), Head (during charge recovery)
- Strategy: use Far zone to buy planning time, coordinate leg hits to slow the enrage phase

### Hunt 4 — Elite Predators

**Spinosaurus**
- Health: High
- Attacks: Water Spray (cone, pushes players one zone back), Bite, Dive (submerges and repositions — skips the QTE phase entirely)
- Behavior: Uses arena water features, amphibious repositioning
- Weak points: Sail (back), Head
- Strategy: deny water access, punish Dive repositions with immediate Aimed Strikes

**Allosaurus**
- Health: Medium-high
- Attacks: Leap Bite (button smasher QTE if caught), Roar (summons 2 raptors), Claw Combo (3-hit sequence targeting one zone)
- Behavior: Coordinates with summoned adds, tests player spacing
- Weak points: Legs (breaks coordination AI), Head (during leap)
- Strategy: spread to deny the combo, focus main boss over adds when possible

### Hunt 5 — Apex Bosses

**Tyrannosaurus Rex** (Two phases)
- **Phase 1 (100–50% HP):** Predictable pattern, long telegraphs — learn the boss
  - Bite (single target, Close), Stomp (Close+Mid, Center), Tail Sweep (Far, both flanks), Roar (slows all players 1 extra zone cost for 2 rounds)
  - Pattern repeats: Bite → Stomp → Tail → Roar
- **Phase 2 (50–0% HP — Enraged):** Pattern accelerates, telegraphs shorten
  - New: Tremor Charge (hits all distances, Center column)
  - Stagger becomes the only reliable safe damage window
- Weak points: Head, Legs

**Giganotosaurus**
- Health: Very high
- Attacks: Charge Bite (forward rush, full column), Spin Attack (360° sweep, hits all flanks at Close), Ground Slam (shockwave — pushes all players one zone back)
- Behavior: More aggressive than T-Rex, minimal recovery windows, no predictable pattern loop
- Weak points: Back (exposed during spin — requires Left or Right flank), Legs (hard to break)
- Strategy: master perfect dodges, coordinate staggers — the only breathing room

**Quetzalcoatlus** (Flying boss, unique mechanics)
- Health: Medium-high
- Behavior: Immune to damage while airborne, only vulnerable during dives and brief ground phases
- Attacks: Dive Bomb (targets one zone — timing press QTE, perfect dodge opens a counterattack), Wing Gust (pushes all Far-zone players to Mid), Aerial Grab (button smasher QTE — teammates must Aimed Strike wings to free the grabbed player)
- Weak points: Wings (airborne only), Body (grounded only)
- Strategy: force landings with coordinated wing Aimed Strikes, maximize damage during brief ground phases, rescue grabbed allies fast

---

## Arena Environments

Each arena modifies how the positioning system works:

| Arena | Tactical twist |
|-------|---------------|
| **Tar Pits** | Moving through tar costs 2 zones instead of 1 |
| **Dense Jungle** | Far zone grants cover — incoming damage reduced 20% |
| **Volcanic Rocks** | Geysers erupt on a timer — being in the zone deals damage but also contributes to stagger |
| **Frozen Tundra** | Repositioning overshoots by one zone (slippery) |
| **Bone Graveyard** | Elevated platform available as a 4th distance zone — immune to ground attacks, melee impossible |
| **Open Savanna** | No environmental modifiers — pure skill, used for apex bosses |

---

## Scoring

**Individual points per round:**
| Action | Points |
|--------|--------|
| Damage dealt | 1 pt/hit |
| Weak point hit | 3 pts |
| Perfect dodge | 5 pts |
| Stagger contribution (present and hitting) | 3 pts |
| Teammate revive | 10 pts |
| First blood / killing blow | 20 pts |

**Session end:**
- Total across all 5 hunts
- MVP crowned (highest score)
- Stat highlights: most staggers triggered, most perfect dodges, most revives
- Daily leaderboard, initials entry

---

## Input & HUD

**Each player's panel (bottom of screen):**
- Current position indicator (zone and flank)
- Action menu: D-pad to browse, A to confirm, B to change before submit
- Teammate action indicators — visible once each player submits, encouraging last-second coordination
- Health bar, equipped weapon, active buffs

**During QTE:**
- Affected players: flashing prompt with input type (timing bar or smash counter)
- Safe players: dim overlay showing they're out of range
- Perfect dodge window shown as a shrinking highlight on the timing bar

**Gamepad layout:**
| Input | Action |
|-------|--------|
| D-pad | Browse action menu / select zone during Reposition |
| A | Confirm action |
| B | Cancel / change selection before submit |
| Start | View upgrade tree (cave bar only) |

---

## Design Principles

1. **Positioning is the core decision** — where you stand changes every action's risk/reward
2. **Telegraphs are never punishing to read** — the fun is coordinating the response, not decoding the signal
3. **Stagger is the cooperation payoff** — breaking a weak point as a team should feel earned and explosive
4. **Specialization happens naturally** — no one is assigned a role; it emerges from upgrade choices
5. **The cave bar has no clock** — it's a genuine social pause, not a timer to beat
6. **Every QTE involves everyone** — either you're dodging, escaping, or watching your teammate sweat
