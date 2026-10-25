# Layout

> Governs the program's entry, role suffixes, relative imports and surfaces.

## Form

### program-entry-is-main-of-main-py → package-laid-out-by-the-tree · SHOULD

A program's entry is the function `main()` of `main.py` at the top of the import package; `__main__.py` and the script `[project.scripts]` names only call it.

| Why |
|---|
| the program has one way in, whether it is run by its script's name, by `python -m` or by its host, and that way in is found in one place. |

## Surfaces

### relative-imports-stay-in-the-module → module-files-import-each-other-directly · MUST

An import that leaves its module — a feature, or outside `features/` the top-level folder it sits in — is absolute, from the import package's name. Files inside one module import each other by relative path, and a relative import never climbs out of the module. A role folder of a feature's domain, and another module of a layer, are imported through their surface. A module never imports itself by its absolute path.

| Why |
|---|
| the import then shows at a glance whether it crosses a feature's border, and a feature that imports its own absolute path starts a cycle through its surface. |

### surface-is-init-with-sorted-all → surface-only-re-exports · MUST

A surface `__init__.py` holds only `from .<module> import <Name>` lines and an `__all__` that lists those names, sorted.

| Why |
|---|
| `__all__` is the list of what the folder offers, and a sorted list shows an added or removed name in one line of a diff. |

### layer-init-empty → surface-only-on-a-module-or-one-kind · MUST

The `__init__.py` of a layer folder, and that of an application's import package, is empty: it makes the folder a package and offers nothing.

| Why |
|---|
| an import then names the module or the role folder it couples to, never a folder whose members lie on both sides of a boundary. |

## Names

### role-suffix-spelled-in-snake-case → file-carries-its-role-suffix · MUST

A role file is `<name>_<role>.py`, its role the vocabulary's suffix in snake_case — `order_entity.py`, `orders_query_repository.py`.

| Why |
|---|
| a module's name allows no dot, so the role is its last word, spelled the same in every folder. |
