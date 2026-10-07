# Transport

> Governs how a tool server is reached on its machine.

## Local

### local-tool-server-reachable-only-from-its-machine · SHOULD
A tool server meant to run on the user's machine speaks over stdio, or binds `127.0.0.1` and requires a token.

| Why | Tags |
|---|---|
| a server bound to every interface serves the whole network the machine sits on. | [security] |

### stdio-server-writes-only-messages-to-stdout → shared-resource-has-one-writer · MUST
A server over stdio writes nothing but protocol messages to stdout; its logs and every library's output go to stderr.

| Why | Tags |
|---|---|
| one stray line on stdout corrupts the stream and drops the client's connection. | [errors] |
