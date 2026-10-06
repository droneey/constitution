# Renovate

### updates-from-the-shared-preset → hooks-and-release-automation-from-the-shared-source
`renovate.json` extends the fleet's preset, pinned to a release.

| Why | Tags |
|---|---|
| one policy for every repository, changed in one place. | [] |

### update-commits-in-the-commit-format → commit-header-type-and-subject
Update commits and titles follow the commit format: `chore: Update …`, no scope, sentence case.

| Why | Tags |
|---|---|
| the bot's pull requests pass the same checks and read the same in history as everyone else's. | [] |

### peer-ranges-widened-others-bumped → dependencies-updated-by-bot
Dependency ranges are bumped; a peer range is widened, so its floor stays.

| Why | Tags |
|---|---|
| a bumped peer floor would drop support for versions the package still serves. | [] |
