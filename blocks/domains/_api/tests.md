# Tests

> Governs the specs of a server.

## Servers

### server-spec-runs-in-process → test-runs-in-a-sandbox · MUST
A unit or integration spec of a server drives it in process, through its real middleware, parsing and handler, on a server built with fakes, and opens no port.

| Why | Tags |
|---|---|
| the request travels what a caller's does in production, and nothing leaves the process. | [testing] |
