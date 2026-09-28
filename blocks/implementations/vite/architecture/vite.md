# Vite

## one-build-for-every-environment · SHOULD
One build serves every environment: settings per environment are read at run time, never built in through `import.meta.env`; build values only carry facts of the build itself.
**Why:** the bundle tested in staging is the one promoted to production, unchanged.
**Check:** review
**Tags:** architecture
**Implements:** `runtime-configuration-served-beside-bundle`
