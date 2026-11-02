# Server

> Governs what Start's server holds, where it serves the program.

## General

### spa-mode-without-server-logic → rendering-server-only-delivers · MUST

Start's server holds no server function or server route but the configuration's server function and, where the API takes bearer tokens, the session proxy. The configuration's server function is the one that serves the public projection of the configuration.

| Why |
|---|
| a server function or a server route is where Start would hold logic of its own, so any beyond the two named splits the program's logic between Start's server and the program's own. |
