# Specs

> Governs the specs that render the user interface: interactions, waits and providers.

## Vocabulary

The **render helper** is the one function, in a fixtures file beside the specs, that mounts the unit a case renders with the providers it needs.

## General

### interactions-through-user-event · SHOULD

Every interaction goes through `userEvent`, never `fireEvent`.

| Why |
|---|
| `fireEvent` dispatches one event where a person's action makes a sequence (focus, keys, pointer) so a spec on it passes on a control a person cannot use. |

### async-ui-awaited-with-find → test-never-sleeps-a-fixed-time · SHOULD

Everything that appears asynchronously is awaited with `findBy…` or `waitFor`.

| Why |
|---|
| a query that does not wait fails before the screen shows what it waits for, and a fixed delay is too short on a slow machine; `findBy…` and `waitFor` retry until the screen shows it, or fail when their timeout passes. |

### render-helper-builds-fresh-providers → case-independent-of-order · MUST

The render helper mounts fresh providers for each case.

| Why |
|---|
| providers shared between cases carry one case's state into the next, so a case passes or fails by the order they run in. |

### ui-spec-renders-through-the-render-helper · SHOULD

Every spec that renders the interface renders through the render helper, never mounting providers by hand.

| Why |
|---|
| providers mounted by hand in each spec drift from the real composition and from one another, so a spec passes over a tree the program never builds. |
