# Biome

## biome-suppression-names-rule-and-reason · MUST
A suppression is `// biome-ignore lint/<group>/<rule>: <reason>`: one rule and its reason; never a range or a whole file without one.
**Why:** a suppression that names its rule and reason can be judged; a blanket one silences rules nobody meant to.
**Check:** tool — lint
**Tags:** workflow
**Implements:** `suppression-states-its-reason`

## biome-warnings-fail-the-check · MUST
Warnings fail the check: every rule is an error, or the check passes `--error-on-warnings`.
**Why:** a warning that passes the check is ignored, and the rule it stands for is not held.
**Check:** review
**Tags:** workflow
**Implements:** `check-passes-before-hand-back`

## biome-check-never-writes · MUST
The check runs `biome check` without `--write`; `lint:fix` writes.
**Why:** a check that fixes what it checks passes code nobody reviewed.
**Check:** review
**Tags:** workflow
**Implements:** `check-only-checks`
