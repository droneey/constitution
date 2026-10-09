# TanStack Router with access control

> Routes guarded before they load.

### guard-reaches-features-outside-react → screen-guarded-through-the-session-owners-surface · MUST
A route's guard reaches the feature that decides access through the feature's composition outside React, never through the UI layer.

| Why | Tags |
|---|---|
| `beforeLoad` runs before any component renders, so a guard that needs a hook or a component's context has nothing to read. | [] |
