---
id: mise
kind: implementation
summary: Pins the developer and CI toolchain to exact, locked versions.
chapters: []
requires: []
extends: null
abstract: false
checks: []
owns: [mise, mise.toml, mise.lock, mise.local.toml, mise-action]
governs: ["mise.toml", "mise.lock"]
status: stable
---

# mise

> Pins the tools outside the package manager. A newcomer runs `mise trust && mise install`.

## toolchain-pinned-and-locked · MUST
Every tool outside the package manager — the runtime, the package manager itself, other languages' linters — is pinned exactly in `mise.toml`, with `mise.lock` committed and `locked = true`. Personal overrides live in the ignored `mise.local.toml`.
**Why:** everyone, and CI, then runs the same tools, and a tool's download is verified against the lock.
**Check:** review
**Tags:** security, workflow
**Implements:** `dependencies-pinned-by-lockfile`

## ci-runs-the-pinned-toolchain · SHOULD
CI installs the toolchain from `mise.toml`, so the check runs on the pinned versions, never on the runner's.
**Why:** a check on another version of a tool checks another thing than the developer ran.
**Check:** review
**Tags:** workflow
**Implements:** `one-check-command`
