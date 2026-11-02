# Browser

> Governs what a server that renders a browser program may hold.

## General

### rendering-server-only-delivers · MUST

A server that renders a program whose API is another program only delivers that program. It serves documents, files and the tab's configuration, which it serves beside the bundle, and proxies its user's session to the API where the API needs it; it reaches no other store and runs no business rule.

| Why |
|---|
| a web tier with logic of its own is a second backend nobody designed, with its own secrets, failures and copies of the rules. |
