# mise

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
