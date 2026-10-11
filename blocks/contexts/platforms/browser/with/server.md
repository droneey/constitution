# Browser with a server

> Governs a program rendered on its own server and run in the tab: the boundary between the two, and what crosses it.

## Code

### first-client-render-matches-the-server-render · SHOULD
The tab's first render of a document produces the markup the server sent: nothing that depends on the clock, chance, the tab's locale or its storage renders differently before hydration ends.

| Why | Tags |
|---|---|
| a first render that differs from the server's is thrown away and redrawn, which costs the speed server rendering was for and flashes content under its user. | [performance, ux] |

## Types

### server-function-parses-its-input → outside-value-untyped-until-parsed · MUST
A server function, an action or a loader the tab can call is a public endpoint: it parses its arguments as outside input before it uses them.

| Why | Tags |
|---|---|
| the tab's call is only a request anyone can forge, so its arguments are whatever the sender wrote, whatever types the shared code declares. | [security] |

## Security

### personalised-document-kept-out-of-shared-caches · MUST
A document rendered with a person's session or data is never stored by a shared cache in front of the server — a CDN's or a proxy's — whatever the rules that cache is given.

| Why | Tags |
|---|---|
| a shared cache serves what it keeps to the next visitor, who then reads the first person's page. | [security, data] |

## Untrusted client

### server-only-module-marked-for-the-build → client-holds-nothing-hidden · MUST
A module that holds a secret, reads the server's environment or reaches its stores carries the mark of a server-only module — its name, its folder or an import that marks it — so the build of the tab's bundle fails when the tab's code reaches it.

| Why | Tags |
|---|---|
| shared code runs on both sides by default, and a server module the tab's graph reaches ships its secrets and its queries to every visitor. | [security] |

### server-function-checks-access-itself → client-check-repeated-out-of-its-reach · MUST
A server function, an action or a loader the tab can call checks its caller's right to what it does inside itself, whatever the screen that calls it has checked.

| Why | Tags |
|---|---|
| the screen that hides a button guards nothing, since anyone can call the function the button would have called. | [security] |

### tab-configuration-projected-by-an-allowlist → client-holds-nothing-hidden · MUST
The configuration the server sends the tab holds only the keys a public schema names, read from the server's configuration at each request, never the server's environment passed whole.

| Why | Tags |
|---|---|
| a secret added to the server's environment later would otherwise ship to every visitor without anyone choosing it. | [security] |

### state-sent-to-the-tab-holds-only-what-its-user-may-see → client-holds-nothing-hidden · MUST
State the server sends the tab — dehydrated loader and query data, serialised props, a server component's payload — is built for the view and holds only what its user may see, never a stored record passed whole.

| Why | Tags |
|---|---|
| everything the server embeds in the document can be read in the page's source, whatever the screen shows of it. | [security, data] |
