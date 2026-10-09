# User interface with a remote service

> Governs forms whose input travels to another system, and the specs that stand in for it.

## Reads

### input-driven-requests-debounced · SHOULD
A request driven by typing is sent once the typing pauses, for a pause the project sets, never on every keystroke.

| Why | Tags |
|---|---|
| a request per keystroke floods the remote system and shows results for words the user has not finished. | [ux, performance] |

## Forms

### remote-field-error-shown-on-its-field · SHOULD
A form shows each field error the remote system returns on the field it names.

| Why | Tags |
|---|---|
| the user sees the remote system's refusal where they can fix it. | [ux] |

### user-input-survives-connection-loss · SHOULD
Input the user entered survives a request that times out or loses its connection, and is sent again without being typed again.

| Why | Tags |
|---|---|
| a user who loses their input to a dropped connection does not type it twice. | [ux, data] |

## Specs

### ui-specs-replace-the-transport → effect-faked-never-mocked · MUST
A screen's spec, and the spec of what reads or writes its data, run the real code down to the transport and replace the transport with captured responses; a fake of a business operation serves only a screen that shows nothing the remote system gives.

| Why | Tags |
|---|---|
| the spec then runs the real data bindings, the code that talks to the remote system and the mapping, and catches a response the mapping gets wrong, which a faked operation never sees. | [testing] |
