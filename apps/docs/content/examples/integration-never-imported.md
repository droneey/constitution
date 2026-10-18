```pseudo title="Avoid"
# integrations/react/use-flag
import readFlag from "../../index"

function useFlag(name)
  return readFlag(name)
```

```pseudo title="Prefer"
# integrations/react/use-flag
import readFlag from "features/flags"

function useFlag(name)
  return readFlag(name)
```
