# Errors

> Governs a failure of a command-line program: an unknown subcommand or flag, and a prefix of a subcommand's name.

## General

### unknown-subcommand-never-guessed · MUST

Every unknown subcommand or flag is a usage error, never guessed and run in place of what was typed. Exempt: one given beside `-h` or `--help`, which prints the help `help-printed-on-the-help-flags` gives.

#### Why

A guess run in place of what was typed may be the destructive subcommand, and the person or the script that typed it never learns of the typo.

#### Examples

```ts title="Avoid"
const command = commands.get(name) ?? closestCommand(name, commands); // "purg" runs purge

return command.run(rest, context);
```

```ts title="Prefer"
const command = commands.get(name);

if (command === undefined) {
  throw new UnknownSubcommandError(name, closestCommand(name, commands)?.name);
}

return command.run(rest, context);
```

### subcommand-never-answers-to-a-prefix · MUST

No subcommand answers to a prefix of its name. Exempt: an alias the program declares and keeps.

#### Why

A prefix that works today runs another subcommand once a new one shares its start, and the scripts that typed it go wrong without a word.

#### Examples

```ts title="Avoid"
const command = [...commands.values()].find((candidate) => candidate.name.startsWith(name)); // "exp" runs export until expire ships
```

```ts title="Prefer"
const aliases = new Map<string, Subcommand>([["ls", listOrdersCommand]]);

const command = commands.get(name) ?? aliases.get(name);
```

### unknown-subcommand-error-names-the-closest-match · SHOULD

Where a known subcommand or flag is close to an unknown one typed, every such usage error names the closest known one.

#### Why

A person who mistyped learns the right name from the error itself, where an error that names nothing sends them to the help to find it.

#### Examples

```text title="Avoid"
$ shop ordrs list
error: unknown command 'ordrs'
```

```text title="Prefer"
$ shop ordrs list
error: unknown command 'ordrs'
(Did you mean orders?)
```
