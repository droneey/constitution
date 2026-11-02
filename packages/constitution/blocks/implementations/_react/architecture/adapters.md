# Adapters

> Governs an adapter in a React program: its form.

## General

### adapter-is-a-factory-or-module-object → adapter-builds-no-client-as-its-module-loads · MUST

An adapter in a React program is never a class. It is a factory function that takes its dependencies and returns the adapter, or a module object where it has no dependency and no state.

| Why |
|---|
| a class's method handed to a hook or a handler loses its `this` and fails when called, where a method of a factory's object keeps working; a factory also shows every dependency in its signature, as the functions a React program is built of do. |
