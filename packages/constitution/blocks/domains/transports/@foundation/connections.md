# Connections

> Governs a connection and the servers outside input names: the encryption and the peer's identity of a connection other than a local one, the peer a local one reaches, the keys it pins and the allowlist of the servers it reaches.

## Vocabulary

A **local connection** is one that never leaves the program's machine: over the loopback, or through a socket file of that machine.

## Encryption

### network-connection-encrypted · MUST

Every connection the program opens or accepts, other than a local connection, is encrypted, whatever stands at its other end. That end may be a store, a broker, a user or another system. The encryption is the program's own or that of a proxy its host runs for it, the hop between that proxy and the program being the host's. Exempt: an unencrypted connection the program accepts and answers only with a redirect to the same location over the encrypted scheme, or with a refusal, carrying nothing else.

| Why |
|---|
| a connection inside a private network is still read by whoever reaches that network — zero trust. |

### opened-connection-verifies-its-peer · MUST

Every connection the program opens, other than a local connection, verifies its peer's identity and its name, never turning that verification off. The verification is the program's own or that of a proxy its host runs for it.

| Why |
|---|
| a connection that skips the peer's identity or its name talks to whoever sits on its path, and reads and changes what passes as that party pleases — zero trust. |

### pinned-endpoint-carries-a-backup-pin · MUST

Every endpoint whose key the program pins is pinned to at least two keys. One of them is a backup not yet in use.

| Why |
|---|
| a pinned key that must be replaced otherwise cuts every copy of the program that pinned it off that endpoint until the copy is updated, and an installed app waits for its user to update it. |

## Local connections

### local-connection-reaches-only-its-intended-peer · MUST

Every local connection the program opens or accepts reaches only the peer it is meant for. It does so through a socket file in a folder only the program's user can open, a check of the user the peer runs as, a loopback socket bound exclusively, or a token the peer presents. Exempt: a connection the program opens to a peer its host runs and names to it, such as a store, a cache or a proxy on the loopback.

| Why |
|---|
| a local connection needs no encryption, yet another user's process on the same machine, or another program sharing its loopback, can listen where the program expects its peer or connect where it expects its own, so a connection that checks nothing hands that process what the program sends and takes its requests for the peer's — RFC 8252. |

## Addresses

### outside-address-reached-only-from-an-allowlist · MUST

Every server an address in outside input names is reached only from the program's own allowlist. Such servers include a callback to notify, a file to fetch and a link to preview. A redirect the program follows from one of them is reached only by the same check. Exempt: a server whose names cannot be known in advance, which is reached only when the address its name resolves to, checked as the connection opens, is public: neither multicast nor marked not globally reachable by the IANA special-purpose address registries, every IPv6 form that embeds an IPv4 address being read as that IPv4 address.

| Why |
|---|
| whoever chooses the address chooses what the program reaches on their behalf, such as the program's own network or the cloud's metadata endpoint, which its callers cannot reach themselves, and a server that passed the check answers with a redirect to any of them — OWASP's SSRF Prevention Cheat Sheet. |
