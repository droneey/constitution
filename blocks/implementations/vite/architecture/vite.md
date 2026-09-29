# Vite

## one-build-for-every-environment → runtime-configuration-served-beside-bundle
One build serves every environment: `import.meta.env` carries only facts of the build itself, and a setting that differs by environment is read at run time.

| Why | Check | Tags |
|---|---|---|
| the bundle tested in staging is the one promoted to production, unchanged. | review | [] |
