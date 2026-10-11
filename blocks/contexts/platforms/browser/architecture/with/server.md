# Browser with a server

> Governs what the server that renders the program may hold.

## Layers

### rendering-server-only-delivers · MUST
The server that renders the program only delivers it — documents, files and the tab's configuration — and holds no business rule, no data access and no server function of its own, save one session proxy, which exchanges its user's sign-in for tokens, keeps them behind a session cookie its script cannot read and forwards the tab's calls to the API unchanged.

| Why | Tags |
|---|---|
| a web tier with logic of its own is a second backend nobody designed, with its own secrets, failures and copies of the rules. | [security] |
