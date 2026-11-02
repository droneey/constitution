# Ignored names

> Governs vulture's ignored names.

## General

### ignored-names-state-their-reasons → suppression-silences-one-finding · MUST

A name vulture ignores is listed with its reason. Such a name is one only a framework or an entry reaches — a route, a tool function, a console script —; its list is `ignore_names` or `ignore_decorators` of `[tool.vulture]`, and its reason a comment beside it.

| Why |
|---|
| these lists are where vulture is silenced, and an entry without its reason cannot be judged, so a name kept after its framework stopped reaching it hides dead code for good. |
