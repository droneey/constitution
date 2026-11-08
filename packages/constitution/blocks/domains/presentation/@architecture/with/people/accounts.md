# Accounts

> Governs guards of screens.

## Guards

### screen-guarded-through-the-session-owners-surface → missing-refused-or-failed-answered-in-the-presentation · SHOULD

Every screen's guard is decided by a binding unit of the feature that owns sessions, reached through its surface. What it decides is whether to admit the person and where to send them.

| Why |
|---|
| a guard decided anywhere else repeats the decision wherever a screen needs it and reaches into the session's internals. |
