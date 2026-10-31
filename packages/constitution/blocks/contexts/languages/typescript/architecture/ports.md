# Ports

> Governs a contract at a boundary in TypeScript and its adapter: how a port is declared and how an adapter maps null.

## Contracts

### port-is-an-interface → contract-declared-by-the-layer-that-needs-it · MUST

A port is an `interface`, or a type of functions, holding no implementation, so an adapter conforms to it by its shape and never extends a class to implement it.

| Why |
|---|
| the inner layer then owns only a description, and an adapter that shares no base class can change, or give way to a fake, without touching the code that depends on the port. |

## Adapters

### null-mapped-to-undefined-in-the-adapter → outside-shape-mapped-in-the-adapter · MUST

A `null` of an outside format lives only in wire models and in the adapters that read and write them, which map it to and from `undefined`.

| Why |
|---|
| a `null` that travels inward brings a second absence into code that checks only for `undefined`. |
