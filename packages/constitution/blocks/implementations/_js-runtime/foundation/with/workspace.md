# Workspace

> Governs the manifests of a workspace's packages and of its root.

## Manifests

### unit-package-named-under-the-scope → unit-named-after-its-folder · SHOULD

The `name` of a unit's `package.json` is `@<scope>/<name>`.

| Why |
|---|
| a registry takes one slash in a name, the scope's, so a unit named any other way either leaves the repository's scope or cannot be published under its folder's name. |

### root-manifest-private → root-and-internal-units-private · MUST

The root `package.json` of a workspace sets `"private": true`.

| Why |
|---|
| a root without the mark is published by the first publish run over the workspace, and whoever installs it gets the repository's tooling; a package manager refuses to publish a manifest marked private. |
