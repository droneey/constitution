# Workspace

> Governs the manifests of a workspace's packages and of its root.

## Manifests

### unit-package-named-under-the-scope → unit-named-after-its-folder · SHOULD

The `name` of a unit's `package.json` is `@<scope>/<name>`.

| Why | Tags |
|---|---|
| a registry takes one slash in a name, the scope's, so the unit's own name is all that follows it. | [] |

### root-manifest-private → root-and-internal-units-private · MUST

The root `package.json` of a workspace sets `"private": true`.

| Why | Tags |
|---|---|
| a package manager refuses to publish a manifest marked private, so the root can never be published by mistake. | [] |
