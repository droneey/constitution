# DCLint

## dclint-over-the-whole-repository → docker-files-linted-in-the-check
The check runs dclint with `--recursive` over the repository and the archive's `presets/common/dclint/foundation/docker.yaml` as `--config`, whose rules are all errors.

| Why | Check | Tags |
|---|---|---|
| a recursive run finds every Compose file, and a rule left at a warning passes the check unfixed. | tool/lint | [] |

## dclint-suppression-names-rule-and-reason → suppression-silences-one-finding
A suppression is `# dclint disable-line <rule>` or `# dclint disable-next-line <rule>`, with the reason beside it.

| Why | Check | Tags |
|---|---|---|
| dclint's other comments disable a rule for the whole file, which silences it for every service. | review | [] |

