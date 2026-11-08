# Browser

> Governs a server that renders a browser program: what it may hold and do, where it keeps the tokens of its user's session, and which of its modules the tab's bundle may reach.

## Vocabulary

A **rendering server** is a server that renders a browser program whose API is another program, and serves it.

## General

### rendering-server-only-delivers · SHOULD

Every rendering server only delivers the program it renders. It serves documents, files and the tab's configuration, and proxies its user's session to the API where the API needs it; it reaches no store but the one its sessions live in, and runs no business rule.

| Why |
|---|
| a web tier with logic of its own is a second backend nobody designed, with its own secrets, failures and copies of the rules. |

## Secrets

### rendering-server-holds-bearer-tokens-behind-the-session → credential-never-readable-by-script · MUST

Where its API takes bearer tokens, every rendering server keeps those tokens on the server, behind its user's session. It exchanges its user's sign-in for the tokens and forwards each call of the tab to the API with the token in place of the session's own credential.

| Why |
|---|
| a token that reaches the tab is read by any script injected into the page, and opens the API to whoever runs that script — the backend-for-frontend pattern. |

## What reaches the tab

### server-only-module-kept-out-of-the-tabs-bundle → device-program-holds-nothing-hidden · MUST

No server-only module is reached by the tab's bundle. A module is server-only when it holds a secret, reads the server's environment variables or reaches its stores.

| Why |
|---|
| shared code runs on both sides by default, and a server module the tab's graph reaches ships its secrets and its queries to every visitor. |
