# Uvicorn

> Governs the server a FastMCP app is served on over HTTP.

## General

### http-app-served-on-a-server-the-root-builds → uvicorn-listener-closed-after-the-pause-by-handle-exit · MUST

Every FastMCP server served over HTTP runs as its `http_app()` on a `uvicorn.Server` the composition root builds, never through `run()` or `run_http_async()`.

| Why |
|---|
| `run_http_async` builds a `uvicorn.Server` of its own, so the root can override no `handle_exit` on it, and the server closes its listener at once on the stop signal (fastmcp 4.1.6). |
