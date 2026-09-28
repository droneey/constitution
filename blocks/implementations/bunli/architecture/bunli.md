# bunli

## bunli-command-from-a-factory · SHOULD
Each command file exports `create<Name>Command(context)`, which returns `defineCommand({ name, description, options, handler })`; the root builds the context, and `createCLI` registers the commands.
**Why:** a command receives what it needs from the root, and a spec builds it with fakes.
**Check:** review
**Tags:** architecture
**Implements:** `command-parses-calls-prints`

## bunli-flags-declared-by-schema · SHOULD
Every flag is `option(schema, { short, description })`, its schema a standard schema, and the handler receives the parsed flags.
**Why:** a flag is validated once, before the handler runs, and the handler works with typed values.
**Check:** review
**Tags:** types
**Implements:** `untrusted-input-parsed-at-edge`

## bunli-handler-through-the-error-handler · SHOULD
Every handler runs its work through the program's one error handler, which maps a failure to the exit map.
**Why:** every command then exits by the same map, whatever fails.
**Check:** review
**Tags:** errors
**Implements:** `exit-codes-from-one-map`
