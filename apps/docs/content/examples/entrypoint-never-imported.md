```pseudo title="Avoid"
# entrypoints/admin/main
import remindCarts
  from "entrypoints/worker"
```

```pseudo title="Prefer"
# entrypoints/admin/main
import remindCarts from "features/carts"

# entrypoints/worker/main
import remindCarts from "features/carts"
```
