# Adapters

> Governs an adapter in a React program: its form.

## General

### adapter-is-a-factory-or-module-object → unit-handed-its-dependencies · MUST

Every adapter in a React program is a factory function or a module object, never a class. A factory takes the adapter's dependencies and returns the adapter; a module object serves where the adapter has no dependency and no state.

| Why |
|---|
| a class's method handed to a hook or a handler loses its `this` and fails when called, where a method of a factory's object keeps working; a factory also shows every dependency in its signature, as the functions a React program is built of do. |
