# Server

> Governs what Start's server serves, where it serves the program.

## General

### runtime-config-from-one-server-function → one-bundle-serves-every-environment · MUST

One server function serves the public projection of the configuration read at start. The root route loads it once, before anything reads configuration.

| Why |
|---|
| configuration built into the bundle needs a build for each environment, and a setting first read in use fails there instead of at start. |
