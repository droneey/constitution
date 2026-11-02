# Remote service

> Governs forms whose input travels to another system, and the specs that stand in for it.

## Input

### input-driven-requests-debounced · SHOULD

A request driven by typing waits for the typing to pause. It is sent once the typing pauses, for a pause the project sets, never on every keystroke.

| Why |
|---|
| a request per keystroke floods the remote system and shows results for words the user has not finished. |

### remote-field-error-shown-on-its-field · SHOULD

A field error the remote system returns is shown on its field. A form shows each such error on the field it names.

| Why |
|---|
| an error shown away from its field leaves the user searching the form for what the remote system refused. |

### user-input-survives-connection-loss · SHOULD

The user's input survives a lost connection. Input the user entered survives a request that times out or loses its connection, and is sent again without being typed again.

| Why |
|---|
| a user whose input a dropped connection erases must type it again, and many give up instead. |

## Specs

### screen-spec-replaces-only-the-transport → effect-faked-never-mocked · MUST

A screen's spec runs the real code down to the transport. That spec, and the spec of what reads or writes the screen's data, replace only the transport, with captured responses; a fake of a business operation serves only a screen that shows nothing the remote system gives.

| Why |
|---|
| a spec over a faked operation skips the data bindings, the code that talks to the remote system and the mapping, so a response the mapping gets wrong passes it. |
