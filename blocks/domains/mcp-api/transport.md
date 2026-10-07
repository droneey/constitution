# Transport

> Governs a tool server over standard input and output.

## Local

### stdio-server-writes-only-messages-to-stdout → shared-resource-has-one-writer · MUST
A server over stdio writes nothing but protocol messages to stdout; its logs and every library's output go to stderr.

| Why | Tags |
|---|---|
| one stray line on stdout corrupts the stream and drops the client's connection. | [errors] |
