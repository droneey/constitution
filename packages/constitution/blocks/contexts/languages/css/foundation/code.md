# Code

> Governs the classes a stylesheet declares.

## Dead code

### class-declared-is-used → dead-code-deleted · MUST

Every class a stylesheet declares is used by markup, save a class a package offers to other packages through the stylesheet it publishes.

| Why |
|---|
| an unused class is dead code nobody dares delete, since nothing in the stylesheet shows that it styles nothing. |
