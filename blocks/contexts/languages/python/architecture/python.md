# Python

> A folder's surface is `__init__.py`, a role file is `<name>_<role>.py`, and the wiring file is `root/wiring.py`. Role folders and suffixes are spelled in snake_case: `entities/`, `value_objects/`, `use_cases/`, `errors/`, `constants/`, `types/`, `utils/`, `models/`, `contracts/`, `repositories/`, and `_entity.py`, `_value_object.py`, `_use_case.py`, `_error.py`, `_constants.py`, `_types.py`, `_utils.py`, `_model.py`, `_port.py`, `_repository.py`.

## Modules and files

## relative-imports-stay-in-the-feature → folder-files-import-each-other-directly
An import that leaves its feature — or, outside `features/`, the top-level folder it sits in — is absolute, from the import package's name; files inside one feature import each other by relative path, at any depth, and a relative import never climbs out of it. A feature never imports itself by its absolute path.

| Why | Check | Tags |
|---|---|---|
| the specifier then shows at a glance whether an import crosses a feature's border, and a feature that imports its own absolute path starts a cycle through its surface. | review | [] |

## python-role-and-surface-files → file-carries-its-role-suffix
A role file is `<name>_<role>.py` — `order_entity.py`, `orders_repository.py` — and a folder's surface is `__init__.py`.

| Why | Check | Tags |
|---|---|---|
| a module's name allows no dot, so the role is its last word, spelled the same in every folder. | tool/names | [] |

## surface-is-init-with-sorted-all → surface-only-re-exports
A surface `__init__.py` holds only `from .<module> import <Name>` lines and an `__all__` that lists those names, sorted.

| Why | Check | Tags |
|---|---|---|
| `__all__` is the list of what the folder offers, and a sorted list shows an added or removed name in one line of a diff. | review | [] |

## layer-init-empty → layer-folder-has-no-surface
A layer folder's `__init__.py` is empty: it makes the folder a package and offers nothing.

| Why | Check | Tags |
|---|---|---|
| an import then names the role folder it couples to, and the coverage of every file below is measured as a package's. | review | [] |

## Values and configuration

## environment-read-only-under-root → environment-read-once-at-boot
`os.environ` and `os.getenv` are read only under `root/`, in the entry files and in specs.

| Why | Check | Tags |
|---|---|---|
| these are where Python reads a variable, so a search for them outside `root/`, the entry files and the specs finds every read the rule forbids. | review | [] |
