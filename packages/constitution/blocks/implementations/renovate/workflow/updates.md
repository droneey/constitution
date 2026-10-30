# Updates

> Governs how the bot's updates arrive: their preset and ranges.

## General

### dependencies-updated-by-the-bot · SHOULD

Dependency updates arrive as change requests from the bot, each passing the check before it is merged.

| Why |
|---|
| updates that arrive on their own, small and checked, keep the project current without a risky update all at once. |

### updates-from-the-shared-preset · SHOULD

`renovate.json` extends the fleet's preset, pinned to a release.

| Why |
|---|
| one policy for every repository, changed in one place. |

### peer-ranges-widened-others-bumped · SHOULD

Dependency ranges are bumped; a peer range is widened, so its floor stays.

| Why |
|---|
| a bumped peer floor would drop support for versions the package still serves. |
