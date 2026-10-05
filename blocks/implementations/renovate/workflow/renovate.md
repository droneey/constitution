# Renovate

## updates-from-the-shared-preset → hooks-and-release-automation-from-the-shared-source
`renovate.json` extends the fleet's preset, pinned to a release.

| Why | Check | Tags |
|---|---|---|
| one policy for every repository, changed in one place. | review | [] |

## update-commits-in-the-commit-format → commit-header-type-and-subject
Update commits and titles follow the commit format: `chore: Update …`, no scope, sentence case.

| Why | Check | Tags |
|---|---|---|
| the bot's pull requests pass the same checks and read the same in history as everyone else's. | review | [] |

## updates-grouped-and-scheduled → dependencies-updated-by-bot
Minor and patch updates are grouped in one pull request, one per major update, on a schedule, with lockfile maintenance.

| Why | Check | Tags |
|---|---|---|
| a stream of single-package pull requests is ignored; a grouped, scheduled one is reviewed. | review | [] |

## peer-ranges-widened-others-bumped → dependencies-updated-by-bot
Dependency ranges are bumped; a peer range is widened, so its floor stays.

| Why | Check | Tags |
|---|---|---|
| a bumped peer floor would drop support for versions the package still serves. | review | [] |
