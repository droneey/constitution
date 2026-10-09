# Tests

> Governs the specs of a server.

## Servers

### server-spec-runs-in-process → test-runs-in-a-sandbox · MUST
A unit or integration spec of a server drives it in process, through its real middleware, parsing and handler, and opens no port; what lies behind the handler is faked or real as the spec's kind asks.

| Why | Tags |
|---|---|
| the request travels what a caller's does in production, and nothing leaves the process. | [testing] |
