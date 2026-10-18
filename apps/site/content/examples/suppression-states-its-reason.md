```pseudo title="Avoid"
for each batch in batches
  # lint-ignore-next-line no-loop-await
  await ledger.append(batch)
```

```pseudo title="Prefer"
for each batch in batches
  # the ledger takes batches in order
  # lint-ignore-next-line no-loop-await
  await ledger.append(batch)
```
