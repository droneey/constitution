# Configuration

> Governs who creates the pino instance, the facade over it, and where its trace id is read back.

## General

### pino-configured-by-the-root → root-alone-configures-logging · MUST

Only `root/` configures pino. It creates the one instance with its `mixin`, its destination and, as its `hooks.streamWrite`, the mask of `libs/`, which masks each serialized line.

| Why |
|---|
| every option that makes the pipeline is an option of the instance, so code elsewhere that creates one configures logging behind the root's back, and the mask reaches the line pino writes only through that option. |

### logging-facade-implemented-over-the-pino-instance → composition-root-decides-nothing · MUST

The root implements the logging facade over the pino instance or its child, handing each call on as it is.

| Why |
|---|
| a facade that reshapes a call before pino sees it decides how records look in the root, where no case proves it, and hides from the mask and the `mixin` what it changed — the dependency inversion principle. |

### trace-id-mixin-kept-beside-the-middleware → trace-middleware-kept-in-libs · SHOULD

Every `mixin` that reads the trace id lives in the module of `libs/` that holds the trace middleware. `root/` hands it to the pino instance it creates.

| Why |
|---|
| the instance's `mixin` reads the id the middleware enters, so with the two ends in different modules a change to how one keeps the id leaves the other reading nothing, and the records lose the id unseen. |
