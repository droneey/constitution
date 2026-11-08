# Transports

> Governs the connections an app on a phone or tablet opens: the certificate authorities it trusts.

## Connections

### connection-trusts-only-the-systems-authorities → opened-connection-verifies-its-peer · MUST

Every connection the app opens trusts only the certificate authorities its system trusts by default, never one it adds or opts into. Exempt: a host's own certificate authority, which the app's network configuration names with its host and its reason, and through which the connection still verifies its peer.

| Why |
|---|
| a phone joins networks its user does not control, and an authority the app adds, or opts into where the user or a profile installed it, lets whoever holds it read and change the app's traffic there. |
