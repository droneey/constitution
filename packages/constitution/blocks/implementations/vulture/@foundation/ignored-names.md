# Ignored names

> Governs vulture's ignored names.

## General

### ignored-names-state-their-reasons → suppression-states-its-reason · MUST

Every name vulture ignores is listed with its reason. Such a name is one only a framework or an entry reaches, such as a route, a tool function or a console script. Its list is `ignore_names` or `ignore_decorators` of `[tool.vulture]`, and its reason a comment beside it.

#### Why

These lists are where vulture is silenced, and an entry without its reason cannot be judged, so a name kept after its framework stopped reaching it hides dead code for good.

#### Examples

```toml title="Avoid"
[tool.vulture]
paths = ["src"]
min_confidence = 60
ignore_names = ["lifespan", "list_orders"]
```

```toml title="Prefer"
[tool.vulture]
paths = ["src"]
min_confidence = 60
ignore_decorators = [
  "@router.get",  # Why: FastAPI calls a route; nothing in the program names it.
  "@mcp.tool",  # Why: the MCP client calls a tool by its registered name.
]
```
