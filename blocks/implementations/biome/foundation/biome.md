# Biome

## biome-suppression-states-its-reason → suppression-states-its-reason
A `biome-ignore` comment states its reason after the colon.

| Why | Check | Tags |
|---|---|---|
| Biome refuses a suppression without a reason, so every silenced finding says why. | tool/lint | [] |

## biome-suppression-names-one-rule → suppression-silences-one-finding
A suppression is `// biome-ignore lint/<group>/<rule>: <reason>`; never a group alone, `biome-ignore-all` or `biome-ignore-start`.

| Why | Check | Tags |
|---|---|---|
| Biome also takes a group, a whole file and a range, so only this form names one rule on one line. | review | [] |

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
