# Vite with the browser

> A bundle the browser downloads.

### build-env-holds-only-build-facts → runtime-configuration-served-beside-bundle
`import.meta.env` carries only facts of the build itself — its mode, its version — never a setting that differs by environment.

| Why | Tags |
|---|---|
| Vite writes `import.meta.env` into the bundle at build time, so a setting read there would need a build for each environment. | [] |

### process-env-never-read-in-the-bundle → bundle-reads-no-build-environment
The bundle's code never reads `process.env`.

| Why | Tags |
|---|---|
| Vite writes the build's `process.env.NODE_ENV` into the bundle and leaves every other name undefined, so a read there is a value of the build or nothing. | [] |

### each-entry-has-a-size-budget → bundle-size-budget
Each entry of the build has a size budget of its own.

| Why | Tags |
|---|---|
| a budget for the whole output lets one entry grow at another's expense, and a page pays for the entry it loads. | [] |
