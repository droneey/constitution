# Biome

## biome-suppression-names-rule-and-reason → suppression-states-its-reason
A suppression is `// biome-ignore lint/<group>/<rule>: <reason>`: one rule and its reason; never a range or a whole file without one.

| Why | Check | Tags |
|---|---|---|
| a suppression that names its rule and reason can be judged; a blanket one silences rules nobody meant to. | tool/lint | [] |

## biome-warnings-fail-the-check → check-passes-before-hand-back
Warnings fail the check: every rule is an error, or the check passes `--error-on-warnings`.

| Why | Check | Tags |
|---|---|---|
| a warning that passes the check is ignored, and the rule it stands for is not held. | review | [] |

## biome-check-never-writes → check-only-checks
The check runs `biome check` without `--write`; `lint:fix` writes.

| Why | Check | Tags |
|---|---|---|
| a check that fixes what it checks passes code nobody reviewed. | review | [] |
