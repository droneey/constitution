# Ports

> Governs a port at a boundary in Python: how it is declared.

## Declarations

### port-is-a-protocol → behaviour-composed-not-inherited · SHOULD

Every port is a `typing.Protocol` holding no implementation, so an adapter conforms to it by its shape.

| Why |
|---|
| a port that holds code ties every adapter to it, and one that is a class to inherit lets an adapter reach into what it was meant only to meet — the dependency inversion principle. |
