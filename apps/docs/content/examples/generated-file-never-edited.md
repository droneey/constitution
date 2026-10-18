```bash title="Avoid"
# fix a field's type by hand
$EDITOR src/api/orders-client.gen.ts
```

```bash title="Prefer"
# fix the field in the source
$EDITOR api/orders.openapi.yaml
npm run generate
```
