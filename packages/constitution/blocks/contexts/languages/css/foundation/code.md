# Code

> Governs any stylesheet code no other chapter governs: the classes a stylesheet declares.

## Dead code

### class-declared-is-used → dead-code-deleted · MUST

Every class a stylesheet declares is used by markup. A class a package offers to other packages through the stylesheet it publishes is exempt.

| Why |
|---|
| an unused class is dead code nobody dares delete, since nothing in the stylesheet shows that it styles nothing. |
