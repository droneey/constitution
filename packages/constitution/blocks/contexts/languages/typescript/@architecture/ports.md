# Ports

> Governs a port at a boundary in TypeScript and its adapter: how a port is declared and how an adapter maps null.

## Declarations

### port-is-an-interface → behaviour-composed-not-inherited · SHOULD

In a typed file, every port is an `interface`, or a type of functions, holding no implementation.

| Why |
|---|
| a port that holds an implementation, or a base class its adapter extends, ties the adapter to the inner layer's code, so neither the adapter nor a fake can change without touching the code that depends on the port — the dependency inversion principle. |

## Adapters

### null-mapped-to-undefined-in-the-adapter → outside-shape-mapped-in-the-adapter · MUST

Every `null` of an outside format stays in the wire models and their adapters. The adapters that read and write those models map it to and from `undefined`.

| Why |
|---|
| a `null` that travels inward brings a second absence into code that checks only for `undefined`. |
