# Configuration

> Governs who creates the pino instance and imports pino.

## General

### pino-configured-by-the-root → root-alone-configures-logging · MUST

`root/` creates the one pino instance, with its mask, its `mixin` and its destination; no other code creates an instance.

| Why |
|---|
| every option that makes the pipeline is an option of the instance, so the code that creates it is the code that configures logging. |

### code-logs-through-the-facade → root-alone-configures-logging · MUST

Code logs through the program's logging facade, which `root/` implements over the pino instance or a child of it.

| Why |
|---|
| a spec then configures the facade's sink instead of pino's. |

### only-the-root-imports-pino → root-alone-configures-logging · MUST

pino's home is `root/`: no other folder imports it.

| Why |
|---|
| no code below the root then depends on a logging library. |
