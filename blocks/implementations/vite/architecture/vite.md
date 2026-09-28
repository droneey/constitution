# Vite

## one-build-for-every-environment → runtime-configuration-served-beside-bundle
One build serves every environment: settings per environment are read at run time, never built in through `import.meta.env`; build values only carry facts of the build itself.

| Why | Check | Tags |
|---|---|---|
| the bundle tested in staging is the one promoted to production, unchanged. | review | [] |
