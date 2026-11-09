# HTTP

> Governs the request logger of an HTTP server that logs with pino.

## General

### request-logger-takes-the-instance → log-record-passes-one-pipeline · MUST

Every pino-http logger takes the program's instance as `logger`.

#### Why

Pino-http given no `logger` builds an instance of its own, which writes the caller's `authorization` header unmasked.

#### Examples

```ts title="Avoid"
import pinoHttp from 'pino-http';

server.use(pinoHttp());
```

```ts title="Prefer"
import pinoHttp from 'pino-http';
import { logger } from './logger';

server.use(pinoHttp({ logger }));
```
