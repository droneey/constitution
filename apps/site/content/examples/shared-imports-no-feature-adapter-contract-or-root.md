```pseudo title="Avoid"
# shared/pagination/page.types
import Order from "features/orders"

type OrderPage = {
  items: Order[],
  next: Cursor,
}
```

```pseudo title="Prefer"
# shared/pagination/page.types
type Page<Item> = {
  items: Item[],
  next: Cursor,
}
```
