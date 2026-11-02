# Layers

> Governs the modules of the runtime that only the edge imports.

## Effects

### runtime-module-with-an-effect-imported-only-by-the-edge → effects-held-only-by-the-edge · MUST

Outside the edge, no file imports a module of the runtime that holds an effect. Those are the Node.js modules `child_process`, `cluster`, `dgram`, `dns`, `fs`, `http`, `http2`, `https`, `inspector`, `module`, `net`, `os`, `perf_hooks`, `process`, `quic`, `readline`, `repl`, `sqlite`, `tls`, `trace_events`, `tty`, `v8`, `vm`, `wasi` and `worker_threads`, with or without `node:` and with their subpaths.

| Why |
|---|
| each of these reaches the file system, the network, a process or the clock, so a unit of logic that imports one holds an effect no port shows, and its specs need the real effect or a patch of it. |
