# bunli

## bunli-command-from-a-factory → delivery-units-stay-thin
Each command file exports `create<Name>Command(context)`, which returns `defineCommand({ name, description, options, handler })`; the root builds the context, and `createCLI` registers the commands.

| Why | Check | Tags |
|---|---|---|
| a command receives what it needs from the root, and a spec builds it with fakes. | review | [] |

## bunli-flags-declared-by-schema → untrusted-input-parsed-at-edge
Every flag is `option(schema, { short, description })`, its schema a standard schema, and the handler receives the parsed flags.

| Why | Check | Tags |
|---|---|---|
| a flag is validated once, before the handler runs, and the handler works with typed values. | review | [] |

## bunli-handler-through-the-error-handler → exit-codes-from-one-map
Every handler runs its work through the program's one error handler, which maps a failure to the exit map.

| Why | Check | Tags |
|---|---|---|
| every command then exits by the same map, whatever fails. | review | [] |
