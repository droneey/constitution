# Server specs

> Governs how a spec drives a server.

## General

### server-spec-runs-in-process → test-runs-in-a-sandbox · MUST

Every unit or integration spec that drives a server drives it in the spec's own process. Exempt: an end-to-end spec, and a spec that proves the server's own start or stop, which reach it as its callers or its host do.

| Why |
|---|
| a unit or an integration spec that starts the server apart reaches past what its case controls, and leaves a process behind when it fails. |

### server-spec-port-chosen-by-the-system → test-runs-in-a-sandbox · MUST

Every spec that starts a server has it listen on a loopback endpoint the system chooses. The spec never picks that endpoint itself.

| Why |
|---|
| a spec that listens on an endpoint of its own choosing collides with another run's, and fails at random when specs run side by side. |

### server-spec-passes-through-the-real-middleware → spec-proves-one-boundary · SHOULD

Every unit or integration spec that drives a server reaches its handlers through the server's real middleware and parsing, never directly. What lies behind the handler is faked or real as the spec's kind asks.

| Why |
|---|
| a spec that calls the handler directly skips the middleware and the parsing a caller's request goes through, so a fault there passes every spec. |
