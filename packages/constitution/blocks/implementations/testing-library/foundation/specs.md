# Specs

> Governs the specs that render the user interface: queries, interactions, waits, hooks and providers.

## General

### queries-by-role-label-text → element-found-by-role-label-or-text · MUST

Elements are queried by role first, then by label and text, and an element no person perceives — one hidden from assistive technology, or a framework's own element — by `getByTestId`, through the test id its renderer reads.

| Why |
|---|
| a spec that finds elements as a user does breaks only when the user's experience does, and an element no person perceives has no role, label or text to query, so `getByTestId` reads the one attribute its renderer keeps for the spec. |

### interactions-through-user-event · SHOULD

Interactions go through `userEvent`, never `fireEvent`.

| Why |
|---|
| `userEvent` produces the whole sequence a person's action does — focus, keys, pointer — so the spec meets the bugs they would. |

### async-ui-awaited-with-find → test-never-sleeps-a-fixed-time · SHOULD

What appears asynchronously is awaited with `findBy…` or `waitFor`, never a fixed sleep.

| Why |
|---|
| a sleep is too short on a slow machine and wasted on a fast one. |

### hooks-proven-through-their-screen → spec-proves-one-boundary · SHOULD

A hook that loads or writes data — an operation's hook, or the hook that holds a component's effects — is proven through the screen, widget or component that uses it; `renderHook` only for a hook that is a boundary of its own, such as a UI-kit hook.

| Why |
|---|
| the screen is the boundary a user meets, and a hook tested alone repeats what its screen's spec proves. |

### render-helper-builds-fresh-providers → case-independent-of-order · MUST

One render helper in `__tests__/<name>.fixtures` mounts the providers a spec needs, fresh for each spec.

| Why |
|---|
| every spec then runs inside the real composition, and nothing one spec's providers hold reaches the next. |
