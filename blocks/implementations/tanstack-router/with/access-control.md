# TanStack Router with access control

> Routes some users may not open.

### guards-in-before-load → access-denied-unless-granted
Access control of a route sits in its `beforeLoad`, and ends in `redirect`.

| Why | Tags |
|---|---|
| the guard runs before the screen loads anything, so a denied user sees nothing of it. | [security] |
