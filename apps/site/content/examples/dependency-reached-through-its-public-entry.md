```pseudo title="Avoid"
import { parseIso }
  from "dates/dist/internal/iso.js"

let due = parseIso(invoice.dueDate)
```

```pseudo title="Prefer"
import { parseIso } from "dates"

let due = parseIso(invoice.dueDate)
```
