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
An object the caller may not see is answered as not found, as if it did not exist, or, where the contract says so, every identifier the caller has no right to is refused alike, the right checked before the object is looked up; refused access is otherwise kept for an operation the caller may not perform on an object it does see.

| Why | Tags |
|---|---|
| a refusal given only to objects that exist confirms that the object exists, and either answer given alike to all hides it. | [security] |
