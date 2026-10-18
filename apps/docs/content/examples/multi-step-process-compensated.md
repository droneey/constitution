```mermaid
flowchart LR
  reserve[Reserve stock] --> charge[Charge payment]
  charge --> ship[Book shipping]
  ship -->|fails for good| refund[Refund payment]
  refund --> release[Release stock]
```
