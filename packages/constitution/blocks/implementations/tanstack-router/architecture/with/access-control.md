# Access control

> Governs routes guarded before they load.

## General

### guards-in-before-load → screen-guarded-through-the-session-owners-surface · MUST

Access control of a route sits in its `beforeLoad`, which calls the use case that decides access, taken from the router's context, never a hook or a component, and ends in `redirect`.

| Why |
|---|
| `beforeLoad` runs before the screen loads anything, so a denied user sees nothing of it, and before any component renders, so a guard that needs a hook or a component's context has nothing to read. |
