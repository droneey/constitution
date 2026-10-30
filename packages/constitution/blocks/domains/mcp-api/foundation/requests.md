# Requests

> Governs a tool call that outlasts its request and the state a request hands the client.

## Long work

### long-tool-call-answered-with-a-task → long-operation-answered-with-a-handle · SHOULD

A tool call that may outlast the client's patience answers with a task of the protocol's tasks extension where the client supports it, and otherwise sends progress notifications on its response stream when its request asks for them.

| Why |
|---|
| a client with no news from a call cuts it at its timeout, while a task lets it follow the work without holding the call open. |

## State

### request-state-verified-when-it-returns → outside-value-untyped-until-parsed · MUST

A `requestState` a tool server hands a client is read as the caller's input when it returns: where it steers access or what the tool does it is protected by an HMAC or an AEAD and carries the caller, a short expiry and the request it belongs to, each checked, and a state that may be used once is consumed on the server.

| Why |
|---|
| the state passes through the client, which may change it, replay it or hand it to another caller. |
