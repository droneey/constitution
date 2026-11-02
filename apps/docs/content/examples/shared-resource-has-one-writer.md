```pseudo title="Avoid"
# orders/application/use-cases/commands/import-orders
function createImportOrders({ files })
  return function(input, context)
    if not files.exists(input.path) then
      process.exit(ExitCode.Failure)
    ...
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/import-orders
function createImportOrders({ files })
  return function(input, context)
    if not files.exists(input.path) then
      throw new ImportFileMissingError(input.path)
    ...

# presentation/bindings/last-resort: the one writer of the exit code
catch ImportFileMissingError
  return ExitCode.Failure
```
