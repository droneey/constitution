# TanStack Router with access control

> Routes some users may not open.

## guards-in-before-load · SHOULD
Access control of a route sits in its `beforeLoad`, and ends in `redirect`.

| Why | Check | Tags |
|---|---|---|
| the guard runs before the screen loads anything, so a denied user sees nothing of it. | review | [security] |
