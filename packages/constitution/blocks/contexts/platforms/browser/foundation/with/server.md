# Server

> Governs a program rendered on its own server and run in the tab: its first render, and the server's modules its bundle must never reach.

## Rendering

### first-client-render-matches-the-server-render · SHOULD

The tab's first render of a document produces the markup the server sent: nothing that depends on the clock, chance, the tab's locale or its storage renders differently before hydration ends.

| Why |
|---|
| a first render that differs from the server's is thrown away and redrawn, which costs the speed server rendering was for and flashes content under its user. |

## What reaches the tab

### server-only-module-marked-for-the-build → client-holds-nothing-hidden · MUST

A module that holds a secret, reads the server's environment or reaches its stores carries the mark of a server-only module — its name, its folder or an import that marks it — so the build of the tab's bundle fails when the tab's code reaches it.

| Why |
|---|
| shared code runs on both sides by default, and a server module the tab's graph reaches ships its secrets and its queries to every visitor. |
