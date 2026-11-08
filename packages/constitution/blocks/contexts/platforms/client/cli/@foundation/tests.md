# Tests

> Governs how a command-line program is tested.

## What a spec proves

### program-tested-through-its-command-line → spec-proves-one-boundary · SHOULD

Every command-line program is tested through its command line. Its spec runs the program on an argument list, with its terminal, prompts and clock replaced, and checks standard output, standard error and the exit code.

#### Why

The command line is the program's boundary, so a spec that reaches past it proves less than its user sees, and one with a real terminal or a real clock fails with the machine it runs on.

#### Examples

```ts title="Avoid"
test("should export paid orders", async () => {
  // Act
  const csv = await exportOrders({ status: OrderStatus.Paid }, context); // past the command line

  // Assert
  expect(csv).toContain("A-1042");
});
```

```ts title="Prefer"
test("should export paid orders", async () => {
  // Act
  const run = await runCli(["orders", "export", "--status", "paid"], {
    terminal: fakeTerminal({ interactive: false }),
    clock: fixedClock(Temporal.Instant.from("2026-03-01T09:00:00Z")),
  });

  // Assert
  expect(run.exitCode).toBe(ExitCode.Success);
  expect(run.stdout).toContain("A-1042");
  expect(run.stderr).toBe("");
});
```
