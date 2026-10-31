# Adapters

> Governs an adapter in a React program: its form.

## General

### adapter-is-a-factory-or-module-object → adapter-built-by-factory-object-or-class · SHOULD

An adapter is a factory function that takes its dependencies and returns the adapter, or a module object where it has no dependency and no state; never a class.

| Why |
|---|
| a React program is built of functions, a factory shows every dependency in its signature, and a method of a factory's object handed to a hook or a handler keeps working where a class's loses its `this`. |
