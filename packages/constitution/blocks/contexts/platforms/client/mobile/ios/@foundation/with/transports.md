# Transports

> Governs the connections an iOS app opens: App Transport Security.

## Connections

### app-transport-security-never-weakened-by-an-exception → network-connection-encrypted · MUST

Every iOS app keeps the protection of App Transport Security's defaults. No exception it declares weakens that protection, such as one that allows plain traffic or an outdated protocol.

| Why |
|---|
| an exception that weakens App Transport Security lets a connection fall back to plain traffic or an outdated protocol, which anyone on a network the phone joins reads and changes. |
