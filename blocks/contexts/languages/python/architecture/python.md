# Python

> Governs how core's tree is spelled in a Python import package: its entry, role files, surfaces, root and domain.

## Layers

### type-checking-import-held-to-the-layers → import-points-inward · MUST
An import inside `if TYPE_CHECKING:` is held to the layer matrix like any other.

| Why | Tags |
|---|---|
| a type a layer names is a dependency whether or not it loads at run time, and the layer changes when that type does. | [] |

## Layout

### program-entry-is-main-of-main-py → package-laid-out-by-the-tree · SHOULD
A program's entry is the function `main()` of `main.py` at the top of the import package; `__main__.py` and the script `[project.scripts]` names only call it.

| Why | Tags |
|---|---|
| the program has one way in, whether it is run by its script's name, by `python -m` or by its host, and that way in is found in one place. | [] |

### role-suffix-spelled-in-snake-case → file-carries-its-role-suffix · MUST
A role file is `<name>_<role>.py`, its role the vocabulary's suffix in snake_case: `_entity`, `_value_object`, `_error`, `_repository`, `_port`, `_adapter`, `_use_case`, `_utils`, `_types`, `_constants`, `_model`, `_config` — `order_entity.py`, `orders_query_repository.py`.

| Why | Tags |
|---|---|
| a module's name allows no dot, so the role is its last word, spelled the same in every folder. | [] |

### role-folder-spelled-in-snake-case → folder-takes-its-layer-or-role-name · SHOULD
A layer or role folder whose name has more than one word is spelled in snake_case: `value_objects/`, `use_cases/`.

| Why | Tags |
|---|---|
| a folder of the import package is a package, and a package's name allows no hyphen. | [] |

### relative-imports-stay-in-the-module → module-files-import-each-other-directly · MUST
An import that leaves its module — a feature, or outside `features/` the top-level folder it sits in — is absolute, from the import package's name; files inside one module import each other by relative path, at any depth, and a relative import never climbs out of it. A module never imports itself by its absolute path.

| Why | Tags |
|---|---|
| the import then shows at a glance whether it crosses a feature's border, and a feature that imports its own absolute path starts a cycle through its surface. | [] |

### surface-is-init-with-sorted-all → surface-only-re-exports · MUST
A surface `__init__.py` holds only `from .<module> import <Name>` lines and an `__all__` that lists those names, sorted.

| Why | Tags |
|---|---|
| `__all__` is the list of what the folder offers, and a sorted list shows an added or removed name in one line of a diff. | [] |

### layer-init-empty → surface-only-on-a-module-or-one-kind · MUST
The `__init__.py` of a layer folder, and that of an application's import package, is empty: it makes the folder a package and offers nothing.

| Why | Tags |
|---|---|
| an import then names the module or the role folder it couples to, never a folder whose members lie on both sides of a boundary. | [] |

## Ports

### port-is-a-protocol → contract-declared-by-the-layer-that-needs-it · MUST
A port is a `typing.Protocol` holding no implementation, so an adapter conforms to it by its shape.

| Why | Tags |
|---|---|
| a port that holds code ties every adapter to it, and one that is a class to inherit lets an adapter reach into what it was meant only to meet. | [] |

## Root

### wiring-file-is-root-wiring-py → composition-root-wires-everything · MUST
The composition root wires the program in `root/wiring.py`.

| Why | Tags |
|---|---|
| every concrete choice of a Python program is then found in one file of one name. | [] |

### environment-read-only-under-root → root-alone-reads-the-environment · MUST
`os.environ`, `os.getenv` and `os.putenv` are reached only under `root/`, in the entry files and in specs.

| Why | Tags |
|---|---|
| a read of the environment anywhere else is a dependency on the process that no signature shows and no spec can hand in. | [security] |

## Domain

### domain-imports-no-logging → domain-logs-nothing · MUST
A feature's `domain/` imports neither `logging` nor a logging library.

| Why | Tags |
|---|---|
| a domain that cannot reach a logger returns what happened to its caller, which decides what an operator is told. | [] |
