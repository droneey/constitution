---
id: renovate
kind: implementation
summary: Dependency updates as scheduled pull requests from a bot.
chapters: []
requires: [git]
extends: null
abstract: false
checks: []
owns: [Renovate, renovate.json, renovate.json5, .renovaterc]
governs: ["renovate.json"]
status: stable
---

# Renovate

> The bot that opens dependency updates as pull requests.

## updates-from-the-shared-preset · SHOULD
`renovate.json` extends the fleet's preset, pinned to a release.
**Why:** one policy for every repository, changed in one place.
**Check:** review
**Tags:** security, workflow
**Implements:** `shared-tooling-from-pinned-packages`

## update-commits-in-the-commit-format · MUST
Update commits and titles follow the commit format: `chore: Update …`, no scope, sentence case.
**Why:** the bot's pull requests pass the same checks and read the same in history as everyone else's.
**Check:** review
**Tags:** workflow
**Implements:** `commit-header-type-and-subject`

## updates-grouped-and-scheduled · SHOULD
Minor and patch updates are grouped in one pull request, one per major update, on a schedule, with lockfile maintenance.
**Why:** a stream of single-package pull requests is ignored; a grouped, scheduled one is reviewed.
**Check:** review
**Tags:** security, workflow
**Implements:** `dependencies-updated-by-bot`

## update-cooldown-configured · SHOULD
A minimum release age of some days holds back every update except a fix for a vulnerability.
**Why:** most hijacked releases are found and pulled within days.
**Check:** review
**Tags:** security
**Implements:** `dependency-release-cooldown`

## peer-ranges-widened-others-bumped · SHOULD
Dependency ranges are bumped; a peer range is widened, so its floor stays.
**Why:** a bumped peer floor would drop support for versions the package still serves.
**Check:** review
**Tags:** workflow
**Implements:** `dependencies-updated-by-bot`
