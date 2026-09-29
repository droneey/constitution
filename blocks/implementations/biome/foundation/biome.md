# Biome

## biome-suppression-states-its-reason → suppression-states-its-reason
A `biome-ignore` comment states its reason after the colon.

| Why | Check | Tags |
|---|---|---|
| Biome refuses a suppression without a reason, so every silenced finding says why. | tool/lint | [] |

## biome-suppression-names-one-rule · MUST
A suppression names one rule, `// biome-ignore lint/<group>/<rule>: <reason>`; never a group, the whole linter, a range or a whole file.

| Why | Check | Tags |
|---|---|---|
| a suppression of one rule can be judged; a blanket one silences rules nobody meant to. | review | [] |

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
