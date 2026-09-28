# Bun with package

> A repository of packages as a Bun workspace.

## own-packages-as-workspace-dependencies · SHOULD
The root installs the repository's own packages as `workspace:*` development dependencies.
**Why:** the root then uses each package as a consumer does, from the working tree.
**Check:** tool — versions
**Tags:** architecture
**Implements:** `root-dogfoods-every-package`
