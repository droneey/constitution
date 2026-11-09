# Accounts

> Governs guards of screens.

## Guards

### screen-guarded-through-the-session-owners-surface → missing-refused-or-failed-answered-in-the-presentation · SHOULD

Every screen's guard is decided by a binding unit of the feature that owns sessions, reached through its surface. What it decides is whether to admit the person and where to send them.

#### Why

A guard decided anywhere else repeats the decision wherever a screen needs it and reaches into the session's internals.

#### Examples

```pseudo title="Avoid"
# root/routes
import { sessionStore } from "features/accounts/infrastructure/sessions/session-store.adapter"

route("/orders", {
  guard: function() sessionStore.current() is <absent> ? RedirectTo("/sign-in") : Admit,
  screen: OrdersScreen
})
```

```pseudo title="Prefer"
# root/routes
import { guardScreen } from "features/accounts"

route("/orders", {
  guard: guardScreen({ requires: SignedIn }),
  screen: OrdersScreen
})
```
