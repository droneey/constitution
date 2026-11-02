# Updates

> Governs how the bot's updates arrive: their preset and ranges.

## General

### dependencies-updated-by-the-bot · SHOULD

Dependency updates arrive as change requests from the bot, each passing the check before it is merged.

| Why |
|---|
| updates left to a person pile up until one large update breaks many things at once, and an update merged unchecked ships whatever its release broke. |

### updates-from-the-shared-preset · SHOULD

`renovate.json` extends the fleet's preset, pinned to a release.

| Why |
|---|
| a policy copied into each repository drifts, so each updates by its own rules and a fix to the policy reaches none of the copies — a single source of truth. |

### peer-ranges-widened-others-bumped · SHOULD

Dependency ranges are bumped and peer ranges widened. A peer range is widened, so its floor stays.

| Why |
|---|
| a bumped peer floor would drop support for versions the package still serves. |
