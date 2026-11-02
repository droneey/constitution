# Updates

> Governs the cooldown of updates and the pins of steps.

## General

### update-cooldown-configured → new-release-adopted-after-a-cooldown · MUST

A minimum release age of at least three days holds back every update. Renovate proposes a fix for a known vulnerability at once, past that age, so the update it proposes carries the package manager's exemption for the package, with its advisory.

| Why |
|---|
| most hijacked releases are found and pulled within a day or two, and the package manager refuses the fix until its cooldown names the package as exempt. |

### step-pins-updated-by-hash-and-version → download-pinned-by-version-and-checksum · MUST

Renovate updates a pinned step's hash and its version together. Its configuration updates, in one change, the full commit hash that pins a step of another repository and the version in the comment beside it.

| Why |
|---|
| a hash nobody updates holds the pipeline on a release with known flaws, and a version left behind beside a new hash tells its reader a release the step no longer runs. |
