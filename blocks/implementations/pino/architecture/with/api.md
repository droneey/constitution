# pino with API

> Where a server that logs with pino enters each request's trace id.

### trace-middleware-registered-by-the-root · MUST
`root/` registers the middleware that enters each request's trace id, beside the instance it creates.

| Why | Tags |
|---|---|
| the instance's `mixin` reads the id the middleware enters, so the code that configures the one wires the other. | [] |
