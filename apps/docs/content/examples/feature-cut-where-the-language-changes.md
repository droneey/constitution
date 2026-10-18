```text title="Avoid"
features/
├── order-api/      the HTTP routes
├── order-worker/   the queue jobs
├── order-items/    a stored record
└── order-totals/   one entity
```

```text title="Prefer"
features/
├── ordering/   Order: a cart bought
├── shipping/   Shipment: parcels sent
└── billing/    Invoice: money owed
```
