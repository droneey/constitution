# User interface with a remote service

> Screens whose data travels through a transport to another system: what a form sends, and how their specs replace the transport.

### ui-specs-replace-the-transport → test-runs-in-a-sandbox · MUST
A screen's spec, and the spec of what loads or writes its data, run the real code down to the transport, and replace the transport with captured responses. A fake of a business operation serves only a screen that shows nothing a remote service gives.

| Why | Tags |
|---|---|
| the spec then runs the real data bindings, the code that talks to the server and the mapping, and catches a response the mapping gets wrong, which a faked operation never sees. | [] |

### idempotency-key-per-intent → operation-idempotent-by-design · SHOULD
A submission that must not repeat creates its idempotency key once, with the form, and reuses it on every retry — never a new key per click.

| Why | Tags |
|---|---|
| a key per click turns every retry into a new order. | [] |

### server-field-errors-shown-on-their-fields · SHOULD
A form maps the server's typed error onto the fields it names.

| Why | Tags |
|---|---|
| the user sees the server's refusal where they can fix it. | [ux] |
