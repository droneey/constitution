# Layers

> Governs Bun's own modules and globals that only the edge reaches.

## Effects

### bun-module-with-an-effect-imported-only-by-the-edge → runtime-module-with-an-effect-imported-only-by-the-edge · MUST

Outside the edge, no file reaches an effect through Bun's own modules or its global. It imports no `bun:` module that holds one, such as `bun:sqlite` and `bun:ffi`, and calls no member of the `Bun` global that holds one, such as `Bun.file`, `Bun.write`, `Bun.spawn` and `Bun.serve`.

| Why |
|---|
| these reach the file system, a database, native code, a process or the network as the runtime's built-in modules do, so a unit of logic that uses one holds an effect no port shows, and its specs need the real effect or a patch of it. |
