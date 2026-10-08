# pino

### pino-configured-by-the-root → root-alone-configures-logging · MUST
`root/` creates the one pino instance, with its mask, its `mixin` and its destination; no other code creates an instance.

| Why | Tags |
|---|---|
| every option that makes the pipeline is an option of the instance, so the code that creates it is the code that configures logging. | [] |

### code-logs-through-the-facade → root-alone-configures-logging · MUST
Code logs through the program's logging facade, which `root/` implements over the pino instance or a child of it; only `root/` imports pino.

| Why | Tags |
|---|---|
| no code below the root then depends on a logging library, and a spec configures the facade's sink instead of pino's. | [] |
