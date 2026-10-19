# Access control

> Governs routes guarded before they load.

## General

### guard-reaches-features-outside-react → screen-guarded-through-the-session-owners-surface · MUST

A route's guard calls the use case that decides access, taken from the router's context, outside React; never a hook or a component.

| Why | Tags |
|---|---|
| `beforeLoad` runs before any component renders, so a guard that needs a hook or a component's context has nothing to read. | [] |

### guards-in-before-load → screen-guarded-through-the-session-owners-surface · MUST

Access control of a route sits in its `beforeLoad`, and ends in `redirect`.

| Why | Tags |
|---|---|
| the guard runs before the screen loads anything, so a denied user sees nothing of it. | [security] |
