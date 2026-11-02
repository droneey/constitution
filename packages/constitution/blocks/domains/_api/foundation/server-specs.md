# Server specs

> Governs how a spec drives a server.

## General

### server-spec-runs-in-process → test-runs-in-a-sandbox · MUST

A unit or an integration spec drives a server in its own process, through no port but a loopback one the system chooses for it. It drives the server through its real middleware, parsing and handler, and what lies behind the handler is faked or real as the spec's kind asks; an end-to-end spec, and a spec that proves the server's own start or stop, reach it as its callers or its host do.

| Why |
|---|
| a unit or an integration spec that starts the server apart reaches past what its case controls, one that binds a port of its own choosing collides with another run's, and one that calls the handler directly skips the middleware and the parsing a caller's request goes through, so a fault there passes every spec. |
