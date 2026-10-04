# pino

## pino-configured-by-the-root → logging-configured-by-the-root
`root/` creates the one pino instance, with its mask, its `mixin` and its destination, and the middleware that enters each request's trace id; no other code creates an instance.

| Why | Check | Tags |
|---|---|---|
| every option that makes the pipeline is an option of the instance, so the code that creates it is the code that configures logging. | review | [] |

## code-logs-through-the-port → diagnostics-through-the-logging-port
Code logs through the logging port, which `root/` implements over the pino instance or a child of it; only `root/` imports pino.

| Why | Check | Tags |
|---|---|---|
| no code below the root then depends on a logging library, and a spec gives the port a fake. | review | [] |
