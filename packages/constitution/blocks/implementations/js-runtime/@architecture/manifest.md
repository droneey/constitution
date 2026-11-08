# Manifest

> Governs how `package.json` maps a package's further entries.

## Entries

### further-entry-is-a-subpath-named-after-what-it-offers → further-entry-named-after-what-it-offers · SHOULD

Every further entry is an `exports` subpath named after what it offers, such as `./testing`.

| Why |
|---|
| a subpath named otherwise gives the consumer a specifier that does not say what it opens. |

### further-entry-subpath-mapped-beside-the-index → further-entry-sits-beside-the-surface · SHOULD

Every further entry that serves no framework the package plugs into maps its `exports` subpath to its file beside `src/index.ts`.

| Why |
|---|
| a subpath mapped to a file deep in the tree gives the package's reader a door where they do not look for one. |
