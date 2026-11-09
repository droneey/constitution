# Server

> Governs what Start's server holds, where it serves the program in SPA mode.

## General

### spa-mode-without-server-logic → rendering-server-only-delivers · SHOULD

Wherever Start's server serves the program in SPA mode, it holds no server function or server route beyond two. They are the configuration's server function and, where the API takes bearer tokens, the session proxy.

#### Why

A server function or a server route is where Start would hold logic of its own, so any beyond the two splits the program's logic between Start's server and the program's own.

#### Examples

```text title="Avoid"
src/root/server/
├── public-config.ts
├── list-orders.ts
├── place-order.ts
└── index.ts
```

```text title="Prefer"
src/root/server/
├── public-config.ts
├── session-proxy.ts
└── index.ts
```
