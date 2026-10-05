# Vite with the browser

> A bundle the browser downloads.

## build-env-holds-only-build-facts → runtime-configuration-served-beside-bundle
`import.meta.env` carries only facts of the build itself — its mode, its version — never a setting that differs by environment.

| Why | Check | Tags |
|---|---|---|
| Vite writes `import.meta.env` into the bundle at build time, so a setting read there would need a build for each environment. | review | [] |

## process-env-never-read-in-the-bundle → bundle-reads-no-build-environment
The bundle's code never reads `process.env`.

| Why | Check | Tags |
|---|---|---|
| Vite writes the build's `process.env.NODE_ENV` into the bundle and leaves every other name undefined, so a read there is a value of the build or nothing. | review | [] |

## bundle-measured-against-budget → bundle-size-budget
The build's output is measured against the bundle's size budget in the check, entry by entry.

| Why | Check | Tags |
|---|---|---|
| the budget holds only if every build is measured against it. | review | [] |
