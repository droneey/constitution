---
id: ty
summary: ty checks the types of Python.
requires: [python]
extends: null
abstract: false
checks: [types]
languages: [python]
roles: []
dictionary: [ty, ty.toml]
governs: ["ty.toml"]
---

# ty

> The type checker checks the `types` role. It has no `extends`: its configuration file is the part `presets/python/ty/foundation/self.toml` of the constitution's release archive, taken whole, beside which ty reads no `[tool.ty]` of `pyproject.toml`. The part turns every rule into an error, fails the run on a warning and leaves `# type: ignore` unread; `presets/python/ty/bindings.yaml` says which setting holds which rule. ty is in beta: a release may add rules, and the part makes each an error at once.
