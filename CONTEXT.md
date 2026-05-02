# Cave Bar Hunter Context

This file records the domain vocabulary that architectural work in this repository should use.

## Hunt

A Hunt is one dinosaur encounter in the Dense Jungle arena. A Hunt begins when players leave the Cave Bar and enter the arena, and it ends when the dinosaur is defeated, the party wipes, or the team retreats back to the Cave Bar.

## Cave Bar

The Cave Bar is the between-Hunt hub scene. It receives persisted player health, score, and weapon state from the Hunt and later hands that state back into the next Hunt.

## Dense Jungle

The Dense Jungle is the current Hunt arena. It is rendered by the arena rendering modules and is the place where telegraphs, player positions, and QTE prompts are shown during a Hunt.

## Telegraph

A Telegraph is the dinosaur's declared incoming attack for the current round. It tells the team what threat is coming before the round resolves and before any dodge QTE begins.

## Attack QTE

An Attack QTE is the timing or targeting interaction attached to a hunter's outgoing attack. In the current spike, club attacks care about timing and bow attacks care about weak-point selection.

## Dodge QTE

A Dodge QTE is the timing interaction for hunters who are standing in a threatened zone after the dinosaur telegraph resolves.

## Stagger Window

A Stagger Window is the temporary round state opened when enough weak-point damage has accumulated. During a Stagger Window the dinosaur does not land its incoming attack and hunters get a bonus-damage round.

## Hunt Round Loop

The Hunt Round Loop is the full cadence that repeats inside a Hunt: telegraph, planning, submit, resolve, attack QTE, dodge QTE, stagger window when triggered, and Hunt-end handoff when the encounter is over.
