# TypeScript with package

## exports-map-each-entry → package-entries-curated
`exports` in `package.json` maps each entry of the package to its file, so a consumer reaches the package only through the entries it lists.

| Why | Check | Tags |
|---|---|---|
| a path `exports` does not map cannot be imported, so the curated entries are the whole of what a consumer can couple to. | review | [] |

## files-list-what-ships → package-entries-curated
`files` in `package.json` lists exactly what the package ships.

| Why | Check | Tags |
|---|---|---|
| without the list, every file the ignore rules leave in is packed, and ships by accident. | review | [] |

## root-manifest-private → package-root-private
The root `package.json` is `"private": true`.

| Why | Check | Tags |
|---|---|---|
| a package manager refuses to publish a manifest marked private, so the root can never be published by mistake. | review | [] |
