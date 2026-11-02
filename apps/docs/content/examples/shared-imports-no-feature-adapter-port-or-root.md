```pseudo title="Avoid"
# shared/pagination/page.types
import Order from "features/orders"

type OrderPage = {
  orders: Order[],
  next: Cursor,
}
```

```pseudo title="Prefer"
# shared/pagination/page.types
type Page<Row> = {
  rows: Row[],
  next: Cursor,
}
```
