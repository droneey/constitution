# Bun with package

## workspaces-follow-the-package-layout · SHOULD
The root's `workspaces` is `["packages/<language>/libs/*"]`, the homes the layout gives the packages.
**Why:** the workspace links exactly the packages the layout places, and a new language adds a folder and a glob.
**Check:** review
**Implements:** `package-repository-layout`
