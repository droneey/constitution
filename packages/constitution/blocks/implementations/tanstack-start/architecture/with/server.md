# Server

> Governs what Start's server holds, where it serves the program.

## General

### spa-mode-without-server-logic → rendering-server-only-delivers · MUST

Start's server holds no server function or server route but the one server function that serves the public projection of the configuration and, where the API takes bearer tokens, the session proxy.

| Why |
|---|
| a server function or a server route is where Start would hold logic of its own, so the two it may hold are named. |
