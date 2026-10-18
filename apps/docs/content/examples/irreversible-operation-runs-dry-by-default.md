```pseudo title="Avoid"
# scripts/purge-stale-carts.ts
function main(args)
  let stale = carts.olderThan(staleAge)
  carts.delete(stale)
```

```pseudo title="Prefer"
# scripts/purge-stale-carts.ts
function main(args)
  let stale = carts.olderThan(staleAge)
  if not args.confirm then
    printPlan(stale)
    return
  carts.delete(stale)
```
