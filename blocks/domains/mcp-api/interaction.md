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

### long-tool-call-reports-progress · SHOULD
A tool call that may outlast the client's patience sends progress notifications when its request carries a `progressToken`.

| Why | Tags |
|---|---|
| a client with no news from a call cuts it at its timeout, and the user sees nothing meanwhile. | [ux] |
