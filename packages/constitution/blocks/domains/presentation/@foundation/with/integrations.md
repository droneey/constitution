# Integrations

> Governs a change a screen shows before the remote system confirms it, writes that overlap, forms whose input travels to another system, and the specs that stand in for it.

## Writes

### optimistic-change-rolled-back-on-refusal · MUST

Every change a screen shows before the remote system confirms it is rolled back if the system refuses it. Exempt: data of a stream folded in as it arrives, which is no such change.

| Why |
|---|
| an optimistic change without a rollback leaves the screen showing what the remote system refused. |

### overlapping-writes-keep-each-others-results · MUST

No write that overlaps another undoes its result: the rollback of one leaves every other unconfirmed write's change shown.

| Why |
|---|
| a rollback that also undoes the other unconfirmed writes drops changes that still stand, and the screen shows neither what the user did nor what the system holds. |

### in-flight-read-never-overwrites-a-pending-change · MUST

No read already in flight overwrites a change a screen shows ahead of the remote system's confirmation.

| Why |
|---|
| a late read erases a change already shown, and the screen shows neither what the user did nor what the system holds. |

### pending-item-shown-from-its-input · SHOULD

Every item a person creates through a remote system is shown from the write's input until the system answers the write.

| Why |
|---|
| an item shown only once the remote system answers leaves the person's action looking lost until then, and the person may make it again. |

### pending-item-keeps-its-place · SHOULD

Every item a screen shows while it waits for the identifier the remote system assigns keeps its place when that identifier arrives.

| Why |
|---|
| an item that jumps when the remote system names it reads as a new item, and the person loses sight of the one they made. |

## Input

### input-driven-requests-debounced · SHOULD

Every request driven by typing is sent once the typing pauses, for a pause the project sets, never on every keystroke.

| Why |
|---|
| a request per keystroke floods the remote system and shows results for words the user is still typing. |

### remote-field-error-shown-on-its-field · SHOULD

Every field error the remote system returns is shown on the field it names.

| Why |
|---|
| an error shown away from its field leaves the user searching the form for what the remote system refused. |

### user-input-survives-connection-loss · MUST

All input the person entered survives a request that times out or loses its connection. It can be sent again without being typed again.

| Why |
|---|
| a person whose input a dropped connection erases must type it again, and many give up instead. |

## Specs

### screen-spec-replaces-only-the-transport → effect-faked-never-mocked · SHOULD

Every screen's spec runs the real code down to the remote transport, and replaces only the remote transport, with captured responses. So does the spec of what reads or writes the screen's data. Exempt: the spec of a screen that shows nothing the remote system gives, which may fake a business operation.

| Why |
|---|
| a spec over a faked operation skips the data bindings, the code that talks to the remote system and the mapping, so a response the mapping gets wrong passes it. |
