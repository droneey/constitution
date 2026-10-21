# Access control

> Governs a handle checked against its caller.

## General

### call-handle-checked-against-its-caller → object-access-checked-against-the-caller · MUST

A handle is checked against the caller on every request.

| Why | Tags |
|---|---|
| a leaked handle otherwise acts in another caller's name. | [security] |
