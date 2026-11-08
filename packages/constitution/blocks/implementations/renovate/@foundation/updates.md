# Updates

> Governs the cooldown of updates, the pins Renovate updates, the shared Renovate preset and the ranges of packages never published.

## General

### renovate-minimum-release-age-set → new-release-adopted-after-a-cooldown · MUST

Every update Renovate proposes waits out its `minimumReleaseAge`, set to the cooldown or longer. Exempt: a fix for a known vulnerability, as the cooldown's Exempt allows.

| Why |
|---|
| an update proposed the day its release appears brings in a release that may still be pulled as hijacked, and the package manager's own cooldown refuses its lockfile, so the change request waits red; Renovate's fixes for a known vulnerability skip the age by default. |

### step-pin-version-updated-with-its-hash → download-pinned-to-its-version · MUST

Every Renovate update to the full commit hash pinning another repository's step changes the version beside it in the same change. That version stands in the comment beside the hash.

| Why |
|---|
| a version left behind beside a new hash tells its reader a release the step no longer runs. |

### updates-from-the-shared-preset · SHOULD

Every repository takes its update policy from one shared Renovate preset its `renovate.json` extends, never from a copy of its own.

| Why |
|---|
| a policy copied into each repository drifts, so each updates by its own rules and a fix to the policy reaches none of the copies — a single source of truth. |

### shared-preset-pinned-to-its-release-tag → download-pinned-to-its-version · MUST

Every Renovate preset `renovate.json` extends from a repository is named with the tag of the version it pins, as `github>owner/repository#v1.2.3`. It is never named by a branch or by its name alone.

| Why |
|---|
| a Renovate preset at a branch runs whatever policy that branch holds on the day the bot reads it, so a change to it reaches every repository at once, unreviewed by any of them. |

### range-floor-raised-to-the-adopted-release · SHOULD

Every dependency range of a package never published to a registry has its floor raised to each release Renovate adopts.

| Why |
|---|
| a floor left behind names versions the lockfile no longer installs, so a reader of the manifest takes for supported a release nobody has run the code against. |
