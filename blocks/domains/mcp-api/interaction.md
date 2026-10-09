# Interaction

> Governs what a tool server asks of the person and tells them.

## Elicitation

### secret-never-asked-through-a-form · MUST
A tool server never asks for a password, a key, a token or a payment credential through a form the client shows; it sends the user to a URL of its own, which carries no credential or personal data.

| Why | Tags |
|---|---|
| what a form collects passes through the client and the model's context, where logs and other servers read it. | [security] |

### url-elicitation-completed-by-the-same-user · MUST
A server checks, by its own sign-in, that the user who completes a URL elicitation is the one it was issued for, before it keeps what the flow yields.

| Why | Tags |
|---|---|
| an attacker forwards the link to a victim and otherwise receives the victim's tokens. | [security] |

## Long calls

### long-tool-call-answered-with-a-task → long-operation-answered-with-a-handle · SHOULD
A tool call that may outlast the client's patience answers with a task of the protocol's tasks extension where the client supports it, and otherwise sends progress notifications on its response stream when its request asks for them.

| Why | Tags |
|---|---|
| a client with no news from a call cuts it at its timeout, while a task lets it follow the work without holding the call open. | [ux] |

## State

### request-state-verified-when-it-returns → outside-value-untyped-until-parsed · MUST
A `requestState` a tool server hands a client is read as the caller's input when it returns: where it steers access or what the tool does it is protected by an HMAC or an AEAD and carries the caller, a short expiry and the request it belongs to, each checked, and a state that may be used once is consumed on the server.

| Why | Tags |
|---|---|
| the state passes through the client, which may change it, replay it or hand it to another caller. | [security] |
