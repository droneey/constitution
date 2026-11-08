# Accounts

> Governs a remote-data cache that outlives no session.

## Sessions

### cache-cleared-when-the-session-ends · MUST

Every remote-data cache of one person's remote data is cleared when that person's session ends. It is also cleared when another person signs in, in memory and wherever it persists.

#### Why

The remote-data cache holds what the last person was allowed to read, and the next person on the device otherwise sees it.

#### Examples

```pseudo title="Avoid"
# root/cache
let cache = createCache({ onFailure: handleRemoteFailure, persistTo: deviceStorage })  # outlives the session
```

```pseudo title="Prefer"
# root/cache
import { onSessionEnded, onSignedIn } from "features/accounts"

let cache = createCache({ onFailure: handleRemoteFailure, persistTo: deviceStorage })

async function clearCache()
  cache.clear()
  await cache.clearPersisted()

onSessionEnded(clearCache)
onSignedIn(clearCache)
```
