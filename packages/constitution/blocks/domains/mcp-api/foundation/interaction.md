# Interaction

> Governs what a tool server asks of the person and tells them.

## Elicitation

### secret-never-asked-through-a-form · MUST

A tool server never asks for a password, a key, a token or a payment credential through a form the client shows; it sends the user to a URL of its own, which carries no credential or personal data.

| Why |
|---|
| what a form collects passes through the client and the model's context, where logs and other servers read it. |
