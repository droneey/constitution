# API with access control

> Governs what a caller is told of an object it may not see.

## Handles

### call-handle-checked-against-its-caller · MUST
A handle is checked against the caller on every request, and an expired or unknown one is answered as an expected failure that says so.

| Why | Tags |
|---|---|
| a leaked handle otherwise acts in another caller's name, and a caller recovers from an expired handle only if the answer says it expired. | [security] |

## Hidden objects

### hidden-object-answered-as-not-found · SHOULD
An object the caller may not see is answered as not found, as if it did not exist; refused access is kept for an operation the caller may not perform on an object it does see.

| Why | Tags |
|---|---|
| a refusal on a guessed identifier confirms that the object exists. | [security] |
