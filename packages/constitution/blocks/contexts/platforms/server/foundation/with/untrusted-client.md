# Untrusted client

> Governs the functions a client its user controls can call on the server, and what the server sends it.

## Server functions

### server-function-parses-its-input → outside-value-untyped-until-parsed · MUST

A function the client can call on the server parses its arguments as outside input. Such a function — a server function, an action, a loader — is a public endpoint, and its arguments are parsed before any of its work runs.

| Why |
|---|
| the client's call is only a request anyone can forge, so its arguments are whatever the sender wrote, whatever types the shared code declares — parse, don't validate. |

## What reaches the client

### client-configuration-projected-by-an-allowlist → client-holds-nothing-hidden · MUST

The configuration the server sends the client holds only the keys a public schema names. They are read from the server's configuration at each request, never the server's environment passed whole.

| Why |
|---|
| a secret added to the server's environment later would otherwise ship to every client without anyone choosing it. |

### state-sent-to-the-client-holds-only-what-its-user-may-see → client-holds-nothing-hidden · MUST

State the server sends the client holds only what its user may see. Such state — dehydrated loader and query data, serialised props, a server component's payload — is built for the view, never a stored record passed whole.

| Why |
|---|
| everything the server sends the client can be read on its device, whatever the screen shows of it, so a field the screen hides is still read by whoever opens the device's tools. |
