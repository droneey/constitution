```yaml
# orders/contract/openapi.yaml
OrderStatus:
  type: string
  x-extensible-enum: [draft, paid, shipped]
SortDirection:
  type: string
  # Why: complete by its meaning, so it stays closed
  enum: [ascending, descending]
```
