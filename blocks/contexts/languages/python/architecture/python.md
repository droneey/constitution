# Python

> A folder's surface is `__init__.py`, a role file is `<name>_<role>.py`, and the wiring file is `root/wiring.py`. Role folders and suffixes are spelled in snake_case: `entities/`, `value_objects/`, `use_cases/`, `errors/`, `constants/`, `types/`, `utils/`, `models/`, `contracts/`, `repositories/`, and `_entity.py`, `_value_object.py`, `_use_case.py`, `_error.py`, `_constants.py`, `_types.py`, `_utils.py`, `_model.py`, `_port.py`, `_repository.py`.

## Modules and files

### relative-imports-stay-in-the-feature → module-files-import-each-other-directly · MUST
An import that leaves its feature — or, outside `features/`, the top-level folder it sits in — is absolute, from the import package's name; files inside one feature import each other by relative path, at any depth, and a relative import never climbs out of it. A feature never imports itself by its absolute path.

| Why | Tags |
|---|---|
| the specifier then shows at a glance whether an import crosses a feature's border, and a feature that imports its own absolute path starts a cycle through its surface. | [] |

### python-role-and-surface-files → file-carries-its-role-suffix · MUST
A role file is `<name>_<role>.py` — `order_entity.py`, `orders_repository.py` — and a folder's surface is `__init__.py`.

| Why | Tags |
|---|---|
| a module's name allows no dot, so the role is its last word, spelled the same in every folder. | [] |

### surface-is-init-with-sorted-all → surface-only-re-exports · MUST
A surface `__init__.py` holds only `from .<module> import <Name>` lines and an `__all__` that lists those names, sorted.

| Why | Tags |
|---|---|
| `__all__` is the list of what the folder offers, and a sorted list shows an added or removed name in one line of a diff. | [] |

### import-package-holds-the-tree → package-laid-out-by-the-tree · SHOULD
The import package `src/<name>/` holds only the top-level folders of the tree and the role folders it needs, the delivery layer its blocks name, `__init__.py`, `__main__.py`, `main.py` and `py.typed`.

| Why | Tags |
|---|---|
| the import package's name is the project's own, so no check of names can tell its folder from the folders inside it, and a reviewer holds the rule. | [] |

### feature-package-holds-its-layers → feature-laid-out-by-its-tree · SHOULD
A feature's package holds only its layer packages and its `__init__.py`.

| Why | Tags |
|---|---|
| a module left beside the layers belongs to none of them; the feature's name is the project's own, so no check of names holds its folder apart, and a reviewer does. | [] |

### init-never-imported-from-inside → module-files-import-each-other-directly · MUST
A file never imports from the `__init__.py` of the module it belongs to: its relative import names the file that defines the name, never `from .. import Order` at the module's root.

| Why | Tags |
|---|---|
| the `__init__.py` imports the files below it, so a file that imports it back starts a cycle; no import contract tells a module's own files from the others, so a reviewer holds the rule. | [] |

### init-is-the-way-in-within-a-layer → module-reached-only-through-its-surface · MUST
A module is reached from another module of its own layer, and a domain role folder from the rest of its feature, only through their `__init__.py`.

| Why | Tags |
|---|---|
| an import contract holds the kernel and a module reached from outside its layer, but tells neither one module of a layer from another nor a package's `__init__.py` from a module, so a reviewer holds the rest. | [] |

### layer-init-empty → layer-folder-has-no-surface · MUST
A layer folder's `__init__.py` is empty: it makes the folder a package and offers nothing.

| Why | Tags |
|---|---|
| an import then names the role folder it couples to, and the coverage of every file below is measured as a package's. | [] |

## Values and configuration

### environment-read-only-under-root → root-alone-reads-the-environment · MUST
`os.environ` and `os.getenv` are read only under `root/`, in the entry files and in specs.

| Why | Tags |
|---|---|
| these are where Python reads a variable, so a search for them outside `root/`, the entry files and the specs finds every read the rule forbids. | [] |

### domain-imports-no-logging → domain-logs-nothing · MUST
A feature's `domain/` imports no `logging`.

| Why | Tags |
|---|---|
| the domain logs nothing, and an import contract holds what a reviewer would otherwise have to find. | [] |
