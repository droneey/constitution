# Browser

> Governs where a server that renders a browser program keeps the tokens of its user's session.

## Secrets

### rendering-server-holds-bearer-tokens-behind-the-session → credential-never-readable-by-script · MUST

Where the API of the program a tab runs is another program that takes bearer tokens, the server that renders that program proxies the session: it exchanges its user's sign-in for tokens, keeps them behind the session cookie, and forwards the tab's calls to the API with the token in place of the cookie.

| Why |
|---|
| the tab then holds only a cookie its script cannot read, and the token that opens the API never reaches a page any injected script can read. |
