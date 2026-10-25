# HTTP server

> Governs the request logger of an HTTP server that logs with pino.

## General

### request-logger-takes-the-instance · MUST

pino-http takes the program's instance as `logger`.

| Why |
|---|
| pino-http given no `logger` builds an instance of its own, which writes the caller's `authorization` header unmasked. |
