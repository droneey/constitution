# Accounts

> Governs a session ended by a refused read.

## Ended sessions

### unauthenticated-failure-ends-the-session-once · MUST

Every unauthenticated failure ends the session once, in the remote-data cache's one failure handler, through the surface of the feature owning sessions. Such a failure is one of a read or a write made with the person's session that the remote transport's renewal of the session, where it has one, could not cure.

#### Why

A session ended at each read or write that met its expiry ends several times and in several ways.

#### Examples

```pseudo title="Avoid"
# carts/presentation/bindings/queries/show-cart
try
  return await cache.read(cartKeys.detail(cartId), fetchCart)
catch UnauthenticatedError
  session.end()

# orders/presentation/bindings/queries/show-orders
try
  return await cache.read(orderKeys.list(), fetchOrders)
catch UnauthenticatedError
  goToSignIn()
```

```pseudo title="Prefer"
# presentation/failures/handle-remote-failure
import { endSession } from "features/accounts"

function handleRemoteFailure(failure)
  when failure
    is UnauthenticatedError then endSession()
    is ForbiddenError then showRefusal(failure)

# root/cache
let cache = createCache({ onFailure: handleRemoteFailure })
```
