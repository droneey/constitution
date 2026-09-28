# bunli

## bunli-spec-with-fake-terminal · SHOULD
A command's spec builds the program with a fake terminal and prompt session — `createCLI(meta, terminal)` — and runs it on an argument list.
**Why:** the spec drives the command as a user does, and reads what the user would see.
**Check:** test
**Tags:** testing
**Implements:** `command-tested-through-its-command-line`
