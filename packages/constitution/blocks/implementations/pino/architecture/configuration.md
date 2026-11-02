# Configuration

> Governs who creates the pino instance and how code logs through it, and where its trace id is read back.

## General

### pino-configured-by-the-root → root-alone-configures-logging · MUST

pino is configured by `root/` alone and reached through the program's logging facade. `root/` creates the one instance — with its `mixin`, its destination and the signal mask of `libs/` as its `hooks.streamWrite`, which masks each finished line — and implements the facade over it or a child of it, handing each call of the facade to the instance as it is and deciding nothing; code logs through the facade, never through pino itself, and no other code creates an instance.

| Why |
|---|
| every option that makes the pipeline is an option of the instance, so code elsewhere that creates one configures logging behind the root's back, and the mask reaches the line pino writes only through that option; code that calls pino itself is bound to the library, so a spec must configure pino's sink to read what it logs, and a change of logger touches every caller — the dependency inversion principle. |

### trace-id-mixin-kept-beside-the-middleware → trace-middleware-kept-in-libs · MUST

The `mixin` that reads the trace id lives beside the trace middleware. It lives in the module of `libs/` that holds the middleware, and `root/` hands it to the pino instance it creates.

| Why |
|---|
| the instance's `mixin` reads the id the middleware enters, so with the two ends in different modules a change to how one keeps the id leaves the other reading nothing, and the records lose the id unseen. |
