# Workspace

> Governs the manifests of a workspace's packages and of its root.

## Manifests

### unit-package-named-under-the-scope → package-name-under-the-repositorys-namespace · SHOULD

The `name` of every package's `package.json` is `@<scope>/<name>`, the scope being the repository's.

| Why |
|---|
| a registry takes one slash in a name, the scope's, so a package named any other way either leaves the repository's scope or cannot be published under its folder's name. |

### private-set-where-nobody-installs → package-nobody-installs-marked-unpublishable · MUST

Every `package.json` of a package nobody outside the repository installs sets `"private": true`. The root's manifest is among them.

| Why |
|---|
| a manifest without the mark is published by the first publish run over the workspace, and whoever installs the root gets the repository's tooling; a package manager refuses to publish a manifest marked private. |
