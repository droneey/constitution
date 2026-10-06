# pino with API

> The request logger of a server that logs with pino.

### request-logger-takes-the-instance · MUST
pino-http takes the program's instance as `logger`.

| Why | Tags |
|---|---|
| pino-http given no `logger` builds an instance of its own, which writes the caller's `authorization` header unmasked. | [data, security] |
