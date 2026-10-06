---
id: ty
summary: ty checks the types of Python.
requires: [python]
extends: null
abstract: false
languages: [python]
dictionary: [ty, ty.toml]
governs: ["ty.toml"]
---

# ty

> The type checker checks the `types` role. It has no `extends`: its configuration file is the part `presets/python/ty/self.toml` of the constitution's release archive, taken whole, beside which ty reads no `[tool.ty]` of `pyproject.toml`. The part turns every rule into an error, fails the run on a warning and leaves `# type: ignore` unread; `presets/python/ty/bindings.yaml` says which setting holds which rule. ty is in beta: a release may add rules, and the part makes each an error at once.

### ty-is-the-type-gate → rule-held-by-a-tool-where-one-can
ty's configuration makes every rule an error and fails on a warning.

| Why | Tags |
|---|---|
| a rule left at a warning or off is a rule the type checker sees broken and lets pass. | [] |

### ty-ignore-names-its-rule → suppression-silences-one-finding
A `# ty: ignore` names its rule and silences a finding ty would report, and a `# type: ignore` silences nothing.

| Why | Tags |
|---|---|
| a blanket suppression silences rules nobody meant to, one that silences nothing outlives its finding, and a comment of no tool of the project's can be judged by none. | [] |

### deprecated-calls-fail-the-types → deprecated-form-never-used
A use of anything marked `@deprecated` fails the type check as `deprecated`, which the part makes an error.

| Why | Tags |
|---|---|
| ty reports a deprecated use only as a warning unless its rule is an error. | [] |
