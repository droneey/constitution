```pseudo title="Avoid"
# main
import { runCli } from "root"

let args = process.args

if args is empty then
  process.exit(runCli({ args: ["--help"], env: process.env, streams: process.streams }))

process.exit(runCli({ args, env: process.env, streams: process.streams }))
```

```pseudo title="Prefer"
# main
import { runCli } from "root"

process.exit(runCli({ args: process.args, env: process.env, streams: process.streams }))
```
