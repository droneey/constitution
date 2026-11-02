# Browser

> Governs a bundle the browser downloads.

## General

### build-env-holds-only-build-facts → one-bundle-serves-every-environment · MUST

The bundle reads from the build only the facts of the build itself. `import.meta.env` carries only such facts — its mode, its version —, never a setting that differs by environment, and the bundle's code never reads `process.env`.

| Why |
|---|
| Vite writes `import.meta.env` into the bundle at build time, so a setting read there would need a build for each environment, and it writes the build's `process.env.NODE_ENV` and leaves every other name undefined, so a read of `process.env` is a value of the build or nothing. |
