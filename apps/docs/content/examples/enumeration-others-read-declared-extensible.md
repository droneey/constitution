```yaml
# orders/contract/openapi.yaml
OrderStatus:
  type: string
  # readers must expect a status they do not know
  x-extensible-enum: [draft, paid, shipped]
SortDirection:
  type: string
  # complete by its meaning: stays closed
  enum: [ascending, descending]
```
