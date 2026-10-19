# Updates

> Governs the cooldown of updates and the pins of steps.

## General

### update-cooldown-configured → new-release-adopted-after-a-cooldown · MUST

A minimum release age of at least three days holds back every update. Renovate proposes a fix for a known vulnerability at once, past that age, so the update it proposes carries the package manager's exemption for the package, with its advisory.

| Why | Tags |
|---|---|
| most hijacked releases are found and pulled within a day or two, and the package manager refuses the fix until its cooldown names the package as exempt. | [] |

### step-pins-updated-by-hash-and-version → download-pinned-by-version-and-checksum · MUST

Renovate's configuration pins a step of another repository by its commit's full hash, with its version in a comment beside it, and updates the two together.

| Why | Tags |
|---|---|
| a hash nobody updates holds the pipeline on a release with known flaws, and a step left on a tag is a download no digest holds. | [security] |
