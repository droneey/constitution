# User interface with a remote service

> Specs of screens whose data travels through a transport to another system.

## ui-specs-replace-the-transport → tests-run-in-a-sandbox
A screen's spec, and the spec of what loads or writes its data, run inside their providers, with the transport replaced by captured responses. A fake of a business operation serves only a screen that shows no remote data.

| Why | Check | Tags |
|---|---|---|
| the spec then runs the real data bindings, the code that talks to the server and the mapping, and catches a response the mapping gets wrong, which a faked operation never sees. | test | [] |
