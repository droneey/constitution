# Testing Library with a remote service

> Specs of screens whose data travels through a transport to another system.

## render-helper-builds-fresh-providers → ui-specs-replace-the-transport
One render helper in `__tests__/<name>.fixtures` mounts the providers a spec needs, fresh for each spec, with the transport replaced by captured responses.

| Why | Check | Tags |
|---|---|---|
| every spec then runs inside the real composition, against answers the vendor really gave. | review | [] |
