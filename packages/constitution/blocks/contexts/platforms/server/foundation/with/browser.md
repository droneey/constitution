# Browser

> Governs where a server that renders a browser program keeps the tokens of its user's session.

## Secrets

### rendering-server-holds-bearer-tokens-behind-the-session → credential-never-readable-by-script · MUST

A server that renders a program whose API is another program taking bearer tokens keeps those tokens behind the session. It proxies the session: it exchanges its user's sign-in for tokens, keeps them behind the session cookie, and forwards the tab's calls to the API with the token in place of the cookie.

| Why |
|---|
| a token that reaches the tab is read by any script injected into the page, and opens the API to whoever runs that script — the backend-for-frontend pattern. |
