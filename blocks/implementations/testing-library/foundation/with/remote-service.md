# Testing Library with a remote service

> Specs of screens whose data travels through a transport to another system.

## render-helper-builds-fresh-providers → ui-specs-replace-the-transport
One render helper in `__tests__/<name>.fixtures` mounts the providers a spec needs, fresh for each spec, with the transport replaced by captured responses and the cache client's retries off; no client is shared between specs.

| Why | Check | Tags |
|---|---|---|
| every spec then runs inside the real composition, and nothing leaks from one spec's cache into the next. | review | [] |
