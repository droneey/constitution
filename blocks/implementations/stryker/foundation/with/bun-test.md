# Stryker with Bun test

> Mutation testing over specs that `bun test` runs.

## stryker-drives-bun-test-by-command · SHOULD
Stryker drives the specs through its command runner — `bun --config=./bunfig.mutation.toml test --bail` — with coverage off, the end-to-end specs left out, and `coverageAnalysis: "off"`.
**Why:** Stryker has no runner for `bun test`, and a run per mutant must be fast and stop at the first failure.
**Check:** review
**Tags:** testing
**Implements:** `mutants-all-killed`

## stryker-runs-on-node · SHOULD
Stryker itself runs on Node — its code generator fails under Bun — so the script removes Bun's `node` shim from the PATH.
**Why:** it is the one tool Bun cannot run, and the script says so where it makes the exception.
**Check:** review
**Tags:** workflow
**Implements:** `other-runtime-only-where-bun-cannot`
