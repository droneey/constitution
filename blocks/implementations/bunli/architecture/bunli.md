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

## bunli-configured-inline → one-explicit-composition-root
`createCLI` takes the program's configuration — its name, version, description and plugins — inline, and the program keeps no `bunli.config.*`.

| Why | Check | Tags |
|---|---|---|
| bunli merges a `bunli.config.*` it finds in the working folder into the configuration given inline, so a file beside the program changes what it ships as much as what a spec run from another folder builds, and the root no longer names every choice. | review | [] |
