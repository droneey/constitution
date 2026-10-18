```pseudo title="Avoid"
# orders/import.ts
function importOrders(path)
  if not files.exists(path) then
    process.exit(2)
  ...

# main.ts
importOrders(args.path)
```

```pseudo title="Prefer"
# orders/import.ts
function importOrders(path)
  if not files.exists(path) then
    throw new ImportFileMissing(path)
  ...

# main.ts
try
  importOrders(args.path)
catch ImportFileMissing
  process.exitCode = 2
```
