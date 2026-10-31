# Browser

> Governs what a server that renders a browser program may hold.

## General

### rendering-server-only-delivers · MUST

Where the API of the program a tab runs is another program, the server that renders that program only delivers it — documents, files and the tab's configuration, by whatever endpoint serves them — and proxies its user's session to the API where the API needs it; it reaches no other store and runs no business rule.

| Why |
|---|
| a web tier with logic of its own is a second backend nobody designed, with its own secrets, failures and copies of the rules. |
