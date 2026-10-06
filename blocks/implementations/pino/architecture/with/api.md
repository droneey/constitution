# pino with API

> Where a server that logs with pino enters each request's trace id.

## trace-middleware-registered-by-the-root → pino-configured-by-the-root
`root/` registers the middleware that enters each request's trace id, beside the instance it creates.

| Why | Check | Tags |
|---|---|---|
| the instance's `mixin` reads the id the middleware enters, so the code that configures the one wires the other. | review | [] |
