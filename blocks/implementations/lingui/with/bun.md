# Lingui with Bun

> Lingui's command line in a Bun project.

## lingui-cli-on-bun-or-noted-exception · SHOULD
Lingui's command line extracts and compiles the catalogs under Bun; a step that fails there runs under Node from its package script, with the reason written beside it.
**Why:** the project keeps one runtime, and an exception is visible where it is made.
**Check:** review
**Tags:** workflow
**Implements:** `other-runtime-only-where-bun-cannot`
