# Local servers

> Governs a tool server over HTTP on the user's machine: the address it binds and the hosts it answers.

## General

### loopback-tool-server-refuses-a-foreign-host → outside-address-followed-only-from-an-allowlist · MUST

Every tool server over HTTP on the loopback answers `403` to every request whose `Host` is not a loopback name.

#### Why

DNS rebinding points a name an attacker owns at the loopback, so a page under that name reaches a server on the user's machine unless its `Host` is checked.

#### Examples

```pseudo title="Avoid"
function admit(request)
  return next(request)
```

```pseudo title="Prefer"
let loopbackNames = ["localhost", "127.0.0.1", "[::1]"]

function admit(request)
  if not loopbackNames.contains(hostWithoutPort(request.headers.host)) then
    return status(403)

  return next(request)
```

### local-tool-server-reachable-only-from-its-machine · MUST

Every tool server over HTTP meant to run on the user's machine binds only the loopback address.

#### Why

A server bound to every network interface serves the whole network the machine sits on.

#### Examples

```pseudo title="Avoid"
let toolServerAddress = "0.0.0.0"
let toolServerPort = 7410

call toolServer.listen({ host: toolServerAddress, port: toolServerPort })
```

```pseudo title="Prefer"
let toolServerAddress = "127.0.0.1"
let toolServerPort = 7410

call toolServer.listen({ host: toolServerAddress, port: toolServerPort })
```
