# bunli

## bunli-command-from-a-factory → delivery-units-stay-thin
Each command file exports `create<Name>Command(context)`, which returns `defineCommand({ name, description, options, handler })`; the root builds the context, and `createCLI` registers the commands.

| Why | Check | Tags |
|---|---|---|
| a command receives what it needs from the root, and a spec builds it with fakes. | review | [] |

## bunli-handler-through-the-error-handler → one-error-handler-per-transport
Every handler runs its work through the program's one error handler, which maps a failure to the exit map.

| Why | Check | Tags |
|---|---|---|
| every command then exits by the same map, whatever fails. | review | [] |

## bunli-configured-inline → one-explicit-composition-root
The root gives `createCLI` the program's configuration — its name, version, description and plugins — inline.

| Why | Check | Tags |
|---|---|---|
| the root then names every choice the program makes, and a spec builds the same program from it. | review | [] |
