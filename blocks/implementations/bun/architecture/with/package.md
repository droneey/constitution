# Bun with package

## workspaces-declared-in-the-root · SHOULD
The root `package.json` is `private` and declares `"workspaces": ["packages/<language>/libs/*"]`.
**Why:** the workspace links every package from the working tree, and the private root can never be published.
**Check:** review
**Tags:** architecture
**Implements:** `package-root-private-and-shared`
