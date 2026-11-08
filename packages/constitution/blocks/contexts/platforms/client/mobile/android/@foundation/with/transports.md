# Transports

> Governs the connections an Android app opens: its network security configuration.

## Connections

### cleartext-refused-by-the-network-security-configuration → network-connection-encrypted · MUST

Every Android app's network security configuration permits no cleartext traffic, for its base and for every domain it names. Exempt: a domain it names for a local connection alone, such as the loopback.

| Why |
|---|
| a configuration that permits cleartext for any domain lets that traffic travel in plain text, which anyone on a network the phone joins reads and changes. |
