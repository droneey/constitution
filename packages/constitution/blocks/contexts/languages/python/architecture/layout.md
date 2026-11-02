# Layout

> Governs a package's tree in Python: the program's entry, its surfaces, its relative imports and its role suffixes.

## The vocabulary

A module path joins words by underscores, so Python spells two of core's role folders its own way: **`use_cases/`**{#use-case} holds the use cases, and **`value_objects/`**{#value-object} holds the value objects.

## Form

### program-entry-is-main-of-main-py → package-laid-out-by-the-tree · MUST

A program's entry is the function `main()` of `main.py` at the top of the import package. `__main__.py` and the script `[project.scripts]` names only call it.

| Why |
|---|
| a program started its own way by its script, by `python -m` and by its host runs a different start in each, and a fix made to one misses the others. |

## Surfaces

### relative-imports-stay-in-the-module → file-never-imports-its-own-modules-surface · MUST

An import within a module is relative, and one that leaves it is absolute. The module is the outermost one holding the file — a feature, a composition module, a lib, a module of a shared layer, or else the top-level folder it sits in. An import that leaves it starts from the import package's name; files inside it import each other by relative path, and a relative import never climbs out of it. A role folder of the module, and another module of a layer, are imported through their surface, and a module never imports itself by its absolute path.

| Why |
|---|
| an import whose form does not show whether it crosses a module's border hides that crossing from its reader, and a module that imports its own absolute path starts a cycle through its surface. |

### surface-is-init-with-sorted-all → surface-only-re-exports · MUST

A surface `__init__.py` only re-exports, and lists what it offers in a sorted `__all__`. It holds only `from .<module> import <Name>` lines and an `__all__` that lists those names, sorted.

| Why |
|---|
| a surface without `__all__` leaves its readers and the type checker to guess which of its names it offers, and an unsorted list buries an added or removed name in a reordered diff. |

### feature-surface-leaves-out-the-rebuild → surface-offers-operations-not-mechanisms · MUST

A feature's `__init__.py` leaves its aggregates' rebuild from storage out. It neither imports the rebuild nor lists it in its `__all__`, so only the feature's own adapters reach it, by its module.

| Why |
|---|
| Python cannot keep a function of a module private, so a rebuild its feature's surface offers lets any caller outside build an aggregate from data no transition checked. |

### layer-init-empty → surface-only-on-a-module-or-one-kind · MUST

The `__init__.py` of a folder with no surface offers nothing. It is empty and only makes the folder a package: a layer folder's, a domain's `shared/`'s and that of the import package of a program no package imports. The `__init__.py` of `root/`, the one layer folder with a surface, offers only what the entry files run, as every surface offers what its callers use.

| Why |
|---|
| an `__init__.py` that offers a layer's members lets one import reach both sides of a boundary and couples its caller to members it never uses; only the entry files and the specs import `root/`, so its door couples no layer to what the root holds. |

## Names

### role-suffix-spelled-in-snake-case → file-carries-its-role-suffix · MUST

A role file is `<name>_<role>.py`. Its role is the vocabulary's suffix in snake_case, as the module name's last word.

| Why |
|---|
| a module's name allows no dot, so a role suffix joined by one makes the module impossible to import by its name, and a role spelled differently from folder to folder hides it from the reader and from the check. |
