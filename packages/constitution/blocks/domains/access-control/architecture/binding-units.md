# Binding units

> Governs where a binding unit declares the access its operation requires.

## General

### binding-unit-declares-its-access · MUST

Every binding unit of an operation a caller outside the program reaches declares whether that operation needs a verified identity, and nothing more of its access. Such a unit — a route, an endpoint, a command, a tool — declares it where it is defined, and the guard that authenticates the caller reads this declaration alone.

| Why |
|---|
| access declared away from its binding unit is not read when that unit is reviewed, so one that lost its access, or never had any, passes review unseen. |
