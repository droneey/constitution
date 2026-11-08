# HTTP

> Governs the origins a tool server over HTTP answers, the token a tool server on the user's machine requires, and what a tool server answers by an HTTP status.

## Origins

### tool-server-refuses-a-foreign-origin → state-changing-request-refused-from-other-origins · MUST

Every tool server over HTTP answers `403` to every request, reading or not, whose `Origin` is present and not on its allowlist.

| Why |
|---|
| every call to a tool server may act, so a reading request from a page the user visits is as dangerous as a writing one. |

## Local servers

### local-tool-server-requires-its-token → local-connection-reaches-only-its-intended-peer · MUST

Every tool server over HTTP meant to run on the user's machine requires a token on every request.

| Why |
|---|
| a server on the loopback without a token serves every process and page on the machine — the MCP specification's security best practices. |

## Statuses

### tool-server-status-never-carries-a-tool-calls-outcome · MUST

Every tool server over HTTP answers by an HTTP status only what its transport and its authorization decide. Such decisions include those on the `Origin`, the token, the token's scope, the protocol version and its request headers, the method, and, in a revision that has one, the session. Everything a tool call decides, a refusal of the right to one object included, it answers as the tool's result.

| Why |
|---|
| a client reads an HTTP status as the verdict of the transport or the authorization, so a `403` for the right to one object starts a step-up of scope that no token can satisfy, and a tool's failure sent as a status never reaches the language model, which retries blind where the tool's result would tell it what to change — the MCP specification (2025-11-25 and 2026-07-28), whose transport and authorization answer by HTTP statuses while a tool's failure is a result with `isError: true` and a protocol error a JSON-RPC `error`. |
