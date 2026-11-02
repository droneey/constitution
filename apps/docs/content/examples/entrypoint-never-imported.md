```pseudo title="Avoid"
# entrypoints/admin/main
import remindCarts
  from "entrypoints/worker"
```

```pseudo title="Prefer"
# entrypoints/admin/main
import runAdmin from "root"

runAdmin(process.args, process.env)

# entrypoints/worker/main
import runWorker from "root"

runWorker(process.env)

# root/carts
import createRemindCarts from "features/carts"
```
