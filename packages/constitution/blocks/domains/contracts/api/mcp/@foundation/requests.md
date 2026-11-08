# Requests

> Governs a tool call that outlasts its request and the state a request hands the client.

## Long work

### long-tool-call-answered-with-a-task → long-operation-answered-with-a-handle · SHOULD

Where its client supports the protocol's tasks extension, every tool call that may outlast the client's patience answers with a task.

| Why |
|---|
| a client with no news from a call cuts it at its timeout, while a task lets it follow the work without holding the call open. |

### long-tool-call-reports-its-progress · SHOULD

Where a request asks for progress and its client supports no task, every long tool call sends progress notifications. It sends them on its response stream, and a call is long when it may outlast the client's patience.

| Why |
|---|
| a client with no news from a call it cannot follow as a task cuts it at its timeout, and progress is the one news the protocol then carries. |

## State

### request-state-verified-when-it-returns · MUST

Every `requestState` that steers access or a tool's behaviour is sealed by an HMAC or an AEAD, and verified when it returns.

| Why |
|---|
| the state passes through the client, which may change it, so a state trusted unchecked does whatever the client wrote into it. |

### request-state-bound-to-its-call · MUST

Every `requestState` that steers access or a tool's behaviour carries its caller, a short expiry and the request it belongs to. Each is checked when the state returns.

| Why |
|---|
| a sealed state the client cannot change can still be replayed later or handed to another caller, and acts for whoever does. |

### single-use-request-state-consumed-on-the-server · MUST

Every `requestState` that may be used once is consumed on the server when it returns.

| Why |
|---|
| a state checked only by its seal and its expiry is used again as many times as its holder sends it within its life. |
