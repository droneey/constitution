# DCLint

## dclint-over-the-whole-repository → docker-files-linted-in-the-check
The check runs dclint with `--recursive` over the repository and the archive's `presets/dclint/foundation/docker.yaml` as `--config`, whose rules are all errors.

| Why | Check | Tags |
|---|---|---|
| a recursive run finds every Compose file, and a rule left at a warning passes the check unfixed. | tool — lint | [] |

## dclint-suppression-names-rule-and-reason → suppression-states-its-reason
A suppression is `# dclint disable-line <rule>` or `# dclint disable-next-line <rule>`, with the reason beside it; never a rule disabled for the whole file.

| Why | Check | Tags |
|---|---|---|
| a suppression at its line can be judged there; one for the whole file silences the rule for every service. | review | [] |
