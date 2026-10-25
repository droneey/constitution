# Browser

> Governs what a server that renders a browser program may hold.

## General

### rendering-server-only-delivers · MUST

Where the API of the program a tab runs is another program, the server that renders that program only delivers it — documents, files and the tab's configuration, by whatever endpoint serves them — and, where the API takes bearer tokens, proxies the session: it exchanges its user's sign-in for tokens, keeps them behind the session cookie, and forwards the tab's calls to the API with the token in place of the cookie. It reaches no other store and runs no business rule.

| Why |
|---|
| a web tier with logic of its own is a second backend nobody designed, with its own secrets, failures and copies of the rules. |
