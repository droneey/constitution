# Untrusted client

> Governs the functions a client its user controls can call on the server, and what the server sends it.

## Server functions

### server-function-parses-its-input → outside-value-untyped-until-parsed · MUST

A server function, an action or a loader the client can call is a public endpoint: it parses its arguments as outside input before it uses them.

| Why |
|---|
| the client's call is only a request anyone can forge, so its arguments are whatever the sender wrote, whatever types the shared code declares. |

### server-function-checks-access-itself → client-check-repeated-out-of-its-reach · MUST

A server function, an action or a loader the client can call checks its caller's right to what it does inside itself, whatever the screen that calls it has checked.

| Why |
|---|
| the screen that hides a button guards nothing, since anyone can call the function the button would have called. |

## What reaches the client

### client-configuration-projected-by-an-allowlist → client-holds-nothing-hidden · MUST

The configuration the server sends the client holds only the keys a public schema names, read from the server's configuration at each request, never the server's environment passed whole.

| Why |
|---|
| a secret added to the server's environment later would otherwise ship to every client without anyone choosing it. |

### state-sent-to-the-client-holds-only-what-its-user-may-see → client-holds-nothing-hidden · MUST

State the server sends the client — dehydrated loader and query data, serialised props, a server component's payload — is built for the view and holds only what its user may see, never a stored record passed whole.

| Why |
|---|
| everything the server sends the client can be read on its device, whatever the screen shows of it. |
