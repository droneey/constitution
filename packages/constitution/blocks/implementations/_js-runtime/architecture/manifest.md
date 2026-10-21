# Manifest

> Governs how `package.json` maps a package's further entries.

## Entries

### further-entry-is-a-subpath-named-after-what-it-offers → further-entry-sits-beside-the-surface · SHOULD

A further entry is an `exports` subpath named after what it offers, `./testing`, mapped to its file beside `src/index.ts`.

| Why | Tags |
|---|---|
| the specifier `@<scope>/<name>/testing` then names the door, and its file is found beside the surface it stands next to. | [] |
