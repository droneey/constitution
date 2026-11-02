```pseudo title="Avoid"
# entrypoints/purge-stale-carts/main
function main(args)
  let stale = carts.olderThan(staleAge)

  carts.remove(stale)
```

```pseudo title="Prefer"
# entrypoints/purge-stale-carts/main
function main(args)
  let stale = carts.olderThan(staleAge)

  if not args.confirm then
    printPlan(stale)

    return

  carts.remove(stale)
```
