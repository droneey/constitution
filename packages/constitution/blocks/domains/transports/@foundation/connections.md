# Connections

> Governs a connection and the servers outside input names: the encryption and the peer's identity of a connection other than a local one, the peer a local one reaches, the keys it pins and the allowlist of the servers it reaches.

## Vocabulary

A **local connection** is one that never leaves the program's machine: over the loopback, or through a socket file of that machine.

## Encryption

### network-connection-encrypted · MUST

Every connection the program opens or accepts, other than a local connection, is encrypted, whatever stands at its other end. That end may be a store, a broker, a user or another system. The encryption is the program's own or that of a proxy its host runs for it, the hop between that proxy and the program being the host's. Exempt: an unencrypted connection the program accepts and answers only with a redirect to the same location over the encrypted scheme, or with a refusal, carrying nothing else.

#### Why

A connection inside a private network is still read by whoever reaches that network — zero trust.

#### Examples

```pseudo title="Avoid"
# orders/infrastructure/store/client
let client = new StoreClient({
  host: config.ordersDatabaseHost,
  encryption: off,
})
```

```pseudo title="Prefer"
# orders/infrastructure/store/client
let client = new StoreClient({
  host: config.ordersDatabaseHost,
  encryption: required,
  verifyPeer: true,
})
```

### opened-connection-verifies-its-peer · MUST

Every connection the program opens, other than a local connection, verifies its peer's identity and its name, never turning that verification off. The verification is the program's own or that of a proxy its host runs for it.

#### Why

A connection that skips the peer's identity or its name talks to whoever sits on its path, and reads and changes what passes as that party pleases — zero trust.

#### Examples

```pseudo title="Avoid"
# root/run
let database = createStoreClient({
  url: config.ordersDatabaseUrl,
  tls: { verifyPeer: false },
})
```

```pseudo title="Prefer"
# root/run
let database = createStoreClient({
  url: config.ordersDatabaseUrl,
  tls: {
    verifyPeer: true,
    authority: config.databaseAuthority,
  },
})
```

### pinned-endpoint-carries-a-backup-pin · MUST

Every endpoint whose key the program pins is pinned to at least two keys. One of them is a backup not yet in use.

#### Why

A pinned key that must be replaced otherwise cuts every copy of the program that pinned it off that endpoint until the copy is updated, and an installed app waits for its user to update it.

#### Examples

```pseudo title="Avoid"
let pins = {
  "api.shop.example": {
    current: "sha256/9n6ZbyFq1RbqQ0kUq3c0VbVf3pHq2c9oT0cA8Yt2r1E=",
  },
}
```

```pseudo title="Prefer"
let pins = {
  "api.shop.example": {
    current: "sha256/9n6ZbyFq1RbqQ0kUq3c0VbVf3pHq2c9oT0cA8Yt2r1E=",
    backup: "sha256/Lm4xQe7Tz0YbJ2pNw8aK5dRf1sUv3hGc6oB9iZyX0tA=",
  },
}
```

## Local connections

### local-connection-reaches-only-its-intended-peer · MUST

Every local connection the program opens or accepts reaches only the peer it is meant for. It does so through a socket file in a folder only the program's user can open, a check of the user the peer runs as, a loopback socket bound exclusively, or a token the peer presents. Exempt: a connection the program opens to a peer its host runs and names to it, such as a store, a cache or a proxy on the loopback.

#### Why

A local connection needs no encryption, yet another user's process on the same machine, or another program sharing its loopback, can listen where the program expects its peer or connect where it expects its own, so a connection that checks nothing hands that process what the program sends and takes its requests for the peer's — RFC 8252.

#### Examples

```pseudo title="Avoid"
# desktop/sync/agent-socket
let socket = listen("/tmp/sync-agent.sock")

socket.onConnection(function(peer)
  serve(peer))
```

```pseudo title="Prefer"
# desktop/sync/agent-socket
let folder = createFolder(userRuntimeFolder() + "/sync", { mode: ownerOnly })
let socket = listen(folder + "/agent.sock")

socket.onConnection(function(peer)
  if peer.user != currentUser() then
    return peer.close()

  serve(peer))
```

## Addresses

### outside-address-reached-only-from-an-allowlist · MUST

Every server an address in outside input names is reached only from the program's own allowlist. Such servers include a callback to notify, a file to fetch and a link to preview. A redirect the program follows from one of them is reached only by the same check. Exempt: a server whose names cannot be known in advance, which is reached only when the address its name resolves to, checked as the connection opens, is public: neither multicast nor marked not globally reachable by the IANA special-purpose address registries, every IPv6 form that embeds an IPv4 address being read as that IPv4 address.

#### Why

Whoever chooses the address chooses what the program reaches on their behalf, such as the program's own network or the cloud's metadata endpoint, which its callers cannot reach themselves, and a server that passed the check answers with a redirect to any of them — OWASP's SSRF Prevention Cheat Sheet.

#### Examples

```pseudo title="Avoid"
# webhooks/infrastructure/http/subscriber-notifier.adapter
function notify(subscription, event, context)
  call http.post(subscription.callbackUrl, event, context)
```

```pseudo title="Prefer"
# webhooks/infrastructure/http/subscriber-notifier.adapter
function notify(subscription, event, context)
  let isAllowed = function(url)
    return allowedCallbackHosts.has(url.host)

  if not isAllowed(subscription.callbackUrl) then
    throw new CallbackHostNotAllowedError(subscription.callbackUrl.host)

  call http.post(subscription.callbackUrl, event, {
    followRedirect: isAllowed,
    signal: context.signal,
  })
```
