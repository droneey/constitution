# Bun with package

> A repository of packages as a Bun workspace.

## workspaces-declared-in-the-root · SHOULD
The root `package.json` is `private` and declares `"workspaces": ["packages/<language>/libs/*"]`.
**Why:** the workspace links every package from the working tree, and the private root can never be published.
**Check:** review
**Tags:** architecture
**Implements:** `package-root-private-and-shared`

## own-packages-as-workspace-dependencies · SHOULD
The root installs the repository's own packages as `workspace:*` development dependencies.
**Why:** the root then uses each package as a consumer does, from the working tree.
**Check:** tool — versions
**Tags:** architecture
**Implements:** `root-dogfoods-every-package`

## version-written-to-every-manifest · SHOULD
The version command writes the version into the root's and every package's manifest.
**Why:** one version across the repository is kept by a command, not by hand.
**Check:** review
**Tags:** workflow
**Implements:** `one-version-for-all-packages`
