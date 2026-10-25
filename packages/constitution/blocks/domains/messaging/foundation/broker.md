# Broker

> Governs the program's rights on the broker and its connection to it.

## Rights

### broker-rights-scoped-to-own-channels → credential-has-least-privilege · MUST

A program's credential for the broker writes only the channels it publishes to and reads only those it consumes.

| Why |
|---|
| a credential that reaches every channel lets one compromised program read every message and forge any other's. |

### broker-reached-over-verified-tls · MUST

A connection to the broker that crosses a network runs over TLS — the program's own, or that of a proxy on its host that verifies for it — which verifies the broker's certificate and its name, and never turns the verification off.

| Why |
|---|
| a connection inside a private network is still read by whoever reaches that network, and one that skips the certificate trusts whoever answers. |
