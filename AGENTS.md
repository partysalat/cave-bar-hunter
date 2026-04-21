# Agent Instructions


## ExecPlans

When writing complex features or significant refactors, use an ExecPlan (as described in .agents/PLANS.md) from design to implementation.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## How To Start Work

Before editing code in a new session:

```bash
git status --short --branch
bd ready --allow-stale --no-auto-import --no-daemon
bd show <id> --allow-stale --no-auto-import --no-daemon
```

- Read the active ExecPlan before changing architecture or scene flow.
- Check whether the worktree is already dirty and preserve unrelated local edits.
- Prefer picking up the current slice instead of creating parallel implementation tracks.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Beads Working Notes

- If `bd` appears to hang or tries to re-import stale git-backed state, prefer direct mode commands:

```bash
bd ready --allow-stale --no-auto-import --no-daemon
bd show <id> --allow-stale --no-auto-import --no-daemon
```

- Keep `.beads/issues.jsonl` aligned with the work you actually completed in the session.
- When a slice is too large, split follow-up work into new beads tasks instead of leaving undocumented TODOs in code.

## Runtime Entry And Scene Flow

- The current runtime entry is `src/main.js`.
- The game currently boots into `HuntScene`, with `CaveBarScene` wired as the between-hunts follow-up scene.
- If you add or change session-flow scenes, update both runtime wiring and the active ExecPlan acceptance notes so the playable flow stays obvious.

## Current Controls

- Keyboard player 1 controls: `Left/Right` move, `Up` or `Space` jump, `Shift` dodge, `Z` melee, `X` throw, `C` interact.
- `InputManager` also supports gamepad input, but keyboard fallback for player 0 is the fastest verification path during development.

## Quality Gates

If you changed code, run the relevant checks from the repo root before wrapping up:

```bash
npm test
npm run build
```

For targeted iteration, prefer running the smallest useful Vitest scope first, then finish with the full test suite before landing.

## Verification Guide

Use both automated and manual verification when gameplay code changes.

### Automated

- Run `npm test` after logic changes. The current suite covers player movement/state, physics, combat, input handling, camera behavior, pack coordination, session flow, and cave-bar persistence.
- If you changed a narrow subsystem, run the smallest relevant test file first, then re-run `npm test` before finishing. Useful entry points include:

```bash
npx vitest run tests/InputManager.test.js
npx vitest run tests/CombatSystem.test.js
npx vitest run tests/SessionManager.test.js tests/CaveBarSession.test.js
```

- Run `npm run build` before landing any user-facing scene or asset-loading change to catch bundling errors.

### Manual Smoke Test

When scenes, controls, or game flow change, run the game locally:

```bash
npm run dev
```

Then verify the current rebuild loop in the browser:

- `HuntScene` loads first.
- Arrow keys move, jump still works, and combat inputs still respond.
- Killing all Compys transitions to `CaveBarScene`.
- The cave bar countdown runs, station prompts appear near the three upgrade stations, and pressing `C` can purchase an upgrade when the player has enough score.
- Leaving the cave bar returns to `HuntScene` with persistent score and upgrades.
- Losing the hunt by damage or timeout resets the session cleanly instead of leaving the game in a broken transition state.

If you change scene routing, HUD text, or session persistence, explicitly verify both the success path (hunt completion) and failure path (player death or timer expiry).

## When To Update Tests

- Update or add Vitest coverage when you change gameplay logic, combat rules, input mapping, persistence, AI behavior, or other deterministic systems.
- Manual verification alone is acceptable for clearly visual-only tweaks, but document what you checked.
- Changes to session flow, hunt outcomes, or cave-bar persistence should usually include both automated test updates and a manual smoke test of the full loop.

## Working Conventions

- Prefer placeholder visuals and simple scene scaffolding over blocking implementation on final assets.
- End each slice with player-visible behavior, not just new abstractions or managers.
- If you discover extra work while implementing a slice, record it in the ExecPlan and beads instead of leaving it implicit.

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

<!-- bv-agent-instructions-v1 -->

---

## Beads Workflow Integration

This project uses [beads_viewer](https://github.com/Dicklesworthstone/beads_viewer) for issue tracking. Issues are stored in `.beads/` and tracked in git.

### Essential Commands

```bash
# View issues (launches TUI - avoid in automated sessions)
bv

# CLI commands for agents (use these instead)
bd ready              # Show issues ready to work (no blockers)
bd list --status=open # All open issues
bd show <id>          # Full issue details with dependencies
bd create --title="..." --type=task --priority=2
bd update <id> --status=in_progress
bd close <id> --reason="Completed"
bd close <id1> <id2>  # Close multiple issues at once
bd sync               # Commit and push changes
```

### Workflow Pattern

1. **Start**: Run `bd ready` to find actionable work
2. **Claim**: Use `bd update <id> --status=in_progress`
3. **Work**: Implement the task
4. **Complete**: Use `bd close <id>`
5. **Sync**: Always run `bd sync` at session end

### Key Concepts

- **Dependencies**: Issues can block other issues. `bd ready` shows only unblocked work.
- **Priority**: P0=critical, P1=high, P2=medium, P3=low, P4=backlog (use numbers, not words)
- **Types**: task, bug, feature, epic, question, docs
- **Blocking**: `bd dep add <issue> <depends-on>` to add dependencies

### Session Protocol

**Before ending any session, run this checklist:**

```bash
git status              # Check what changed
git add <files>         # Stage code changes
bd sync                 # Commit beads changes
git commit -m "..."     # Commit code
bd sync                 # Commit any new beads changes
git push                # Push to remote
```

### Best Practices

- Check `bd ready` at session start to find available work
- Update status as you work (in_progress → closed)
- Create new issues with `bd create` when you discover tasks
- Use descriptive titles and set appropriate priority/type
- Always `bd sync` before ending session

<!-- end-bv-agent-instructions -->
