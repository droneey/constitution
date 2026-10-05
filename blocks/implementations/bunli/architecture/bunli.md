# bunli

## bunli-command-from-a-factory → delivery-units-stay-thin
Each command file exports `create<Name>Command(context)`, which returns `defineCommand({ name, description, options, handler })`; the root builds the context, and `createCLI` registers the commands.

| Why | Check | Tags |
|---|---|---|
| a command receives what it needs from the root, and a spec builds it with fakes. | review | [] |

## bunli-handler-through-the-error-handler → one-error-handler-per-transport · MUST
Every handler runs its work through the program's one error handler, which maps a failure to the exit map.

| Why | Check | Tags |
|---|---|---|
| every command then exits by the same map, whatever fails. | review | [] |
