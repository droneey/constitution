# HTTP

> Governs the request logger of an HTTP server that logs with pino.

## General

### request-logger-takes-the-instance → log-record-passes-one-pipeline · MUST

Every pino-http logger takes the program's instance as `logger`.

| Why |
|---|
| pino-http given no `logger` builds an instance of its own, which writes the caller's `authorization` header unmasked. |
