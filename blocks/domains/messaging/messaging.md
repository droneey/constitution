---
id: messaging
summary: "Work outside a request: messages, queues and scheduled jobs."
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: []
---
# Messaging

> A program that does work outside a request: it publishes or consumes messages — events, commands and jobs — through a broker or a queue, asynchronously and at least once, or runs jobs on a schedule, with or without a broker: what a message carries and how its contract changes, how a publish is confirmed and ordered, how a consumer processes each message once in effect and acknowledges it after its work, how a failure is settled, retried and dead-lettered, and how a scheduled job runs once per tick. The broker is an outside system behind a port; how a change and its message land together is in `with/owned-data.md`, how a message is traced and its lag watched in `with/observability.md`, whom a message acts for in `with/access-control.md`, and how long a broker keeps personal data in `with/privacy.md`.

## Rights

### broker-rights-scoped-to-own-channels → credential-has-least-privilege · MUST
A program's credential for the broker writes only the channels it publishes to and reads only those it consumes.

| Why | Tags |
|---|---|
| a credential that reaches every channel lets one compromised program read every message and forge any other's. | [security] |

### broker-reached-over-verified-tls · MUST
A connection to the broker that crosses a network runs over TLS, with the broker's certificate verified.

| Why | Tags |
|---|---|
| a connection inside a private network is still read by whoever reaches that network, and one that skips the certificate trusts whoever answers. | [security] |
