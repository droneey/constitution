# Specs

> Governs the specs that render the user interface: interactions, waits and providers.

## General

### interactions-through-user-event · SHOULD

Interactions go through `userEvent`, never `fireEvent`.

| Why |
|---|
| `fireEvent` dispatches one event where a person's action makes a sequence (focus, keys, pointer) so a spec on it passes on a control a person cannot use. |

### async-ui-awaited-with-find → test-never-sleeps-a-fixed-time · SHOULD

What appears asynchronously is awaited with `findBy…` or `waitFor`.

| Why |
|---|
| a query that does not wait fails before the screen shows what it waits for, and a fixed delay is too short on a slow machine; `findBy…` and `waitFor` retry until the screen shows it, or fail when their timeout passes. |

### render-helper-builds-fresh-providers → case-independent-of-order · MUST

One render helper mounts fresh providers for each spec. It sits in `__tests__/<name>.fixtures` and mounts the providers a spec needs.

| Why |
|---|
| providers shared between specs carry one spec's state into the next, so a spec passes or fails by the order they run in, and providers mounted by hand in each spec drift from the real composition. |
