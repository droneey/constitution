# Manifest

> Governs how `package.json` maps a package's further entries.

## Entries

### further-entry-is-a-subpath-named-after-what-it-offers → further-entry-sits-beside-the-surface · MUST

A further entry is an `exports` subpath named after what it offers, `./testing`, mapped to its file beside `src/index.ts`.

| Why |
|---|
| a subpath named otherwise, or mapped to a file deep in the tree, gives the consumer a specifier that does not say what it opens and the package's reader a door where they do not look for one. |
