# bunli

### bunli-command-from-a-factory → delivery-unit-stays-thin · SHOULD
Each command file exports `create<Name>Command(context)`, which returns `defineCommand({ name, description, options, handler })`; the root builds the context, and `createCLI` registers the commands.

| Why | Tags |
|---|---|
| a command receives what it needs from the root, and a spec builds it with fakes. | [] |

### bunli-handler-through-the-error-handler → last-resort-handler-one-per-entry · MUST
Every handler runs its work through the program's one error handler, which maps a failure to the exit map.

| Why | Tags |
|---|---|
| every command then exits by the same map, whatever fails. | [] |

### bunli-configured-inline → composition-root-wires-everything · MUST
The root gives `createCLI` the program's configuration — its name, version, description and plugins — inline.

| Why | Tags |
|---|---|
| the root then names every choice the program makes, and a spec builds the same program from it. | [] |
