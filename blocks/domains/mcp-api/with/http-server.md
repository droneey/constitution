# MCP API over HTTP

> Governs the origins a tool server over HTTP answers, and a server on the user’s machine.

## Origins

### tool-server-refuses-a-foreign-origin → state-changing-request-refused-from-other-origins · MUST
A tool server over HTTP answers `403` to every request — reading or not — whose `Origin` is present and not on its allowlist, and one on loopback also refuses a `Host` that is not a loopback name.

| Why | Tags |
|---|---|
| DNS rebinding lets any web page reach a server on the user's machine or network, and every call to a tool server may act. | [security] |

## Local servers

### local-tool-server-reachable-only-from-its-machine · SHOULD
A tool server over HTTP meant to run on the user's machine binds the loopback address and requires a token.

| Why | Tags |
|---|---|
| a server bound to every interface serves the whole network the machine sits on. | [security] |
