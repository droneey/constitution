# Local servers

> Governs a tool server over HTTP on the user's machine: the address it binds and the hosts it answers.

## General

### loopback-tool-server-refuses-a-foreign-host → outside-address-followed-only-from-an-allowlist · MUST

Every tool server over HTTP on the loopback answers `403` to every request whose `Host` is not a loopback name.

| Why |
|---|
| DNS rebinding points a name an attacker owns at the loopback, so a page under that name reaches a server on the user's machine unless its `Host` is checked. |

### local-tool-server-reachable-only-from-its-machine · MUST

Every tool server over HTTP meant to run on the user's machine binds only the loopback address.

| Why |
|---|
| a server bound to every network interface serves the whole network the machine sits on. |
