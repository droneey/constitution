# Biome

## project-grit-rules-scoped · SHOULD
A project's own GritQL rule lives in `biome/<name>.grit`, scoped by an override, until a shared preset carries it: devkit's, or the constitution's when the rule names the constitution's folders.
**Why:** a rule of the project's own is found in one place and moves to the preset as one file.
**Check:** review
**Tags:** process
**Implements:** `shared-tooling-from-pinned-packages`
