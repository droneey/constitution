# Specs

> Governs the specs that render the user interface: interactions, waits and providers.

## General

### interactions-through-user-event · SHOULD

Interactions go through `userEvent`, never `fireEvent`.

| Why |
|---|
| `userEvent` produces the whole sequence a person's action does — focus, keys, pointer — so the spec meets the bugs they would. |

### async-ui-awaited-with-find → test-never-sleeps-a-fixed-time · SHOULD

What appears asynchronously is awaited with `findBy…` or `waitFor`.

| Why |
|---|
| both retry until the screen shows what the spec waits for, or fail when their timeout passes. |

### render-helper-builds-fresh-providers → case-independent-of-order · MUST

One render helper in `__tests__/<name>.fixtures` mounts the providers a spec needs, fresh for each spec.

| Why |
|---|
| every spec then runs inside the real composition, and nothing one spec's providers hold reaches the next. |
