# Anatomy

## Placement

## adapter-built-by-factory-or-module-object · SHOULD
An adapter is written as a factory function that takes its dependencies and returns the adapter. An adapter with no dependency may be a module object.

| Why | Check | Tags |
|---|---|---|
| a factory shows every dependency in its signature, and a module object is the smallest form of an adapter that needs none. | review | [] |
