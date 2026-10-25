# API

> Governs where a server that logs with pino enters each request's trace id.

## General

### trace-middleware-registered-by-the-root · MUST

`root/` registers the middleware that enters each request's trace id, beside the instance it creates.

| Why |
|---|
| the instance's `mixin` reads the id the middleware enters, so the code that configures the one wires the other. |
