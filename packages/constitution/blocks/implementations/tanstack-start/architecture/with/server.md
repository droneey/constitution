# TanStack Start with a server

> Governs what Start's server holds, where it serves the program.

### spa-mode-without-server-logic → rendering-server-only-delivers · MUST

Start's server holds no server function, server route or data access, save the one server function that serves the public projection of the configuration and, where the API takes bearer tokens, the session proxy its parent allows.

| Why | Tags |
|---|---|
| a server tier with logic of its own is a second backend nobody designed. | [security] |
