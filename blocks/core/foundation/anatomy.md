# Anatomy

## Placement

## adapter-built-by-factory-or-module-object · SHOULD
The code that implements an interface over an external system is written as a factory function that takes its dependencies and returns the implementation. One with no dependency may be a module object.

| Why | Check | Tags |
|---|---|---|
| a factory shows every dependency in its signature, and a module object is the smallest form of an implementation that needs none. | review | [] |
