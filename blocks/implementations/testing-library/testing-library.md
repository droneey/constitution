---
id: testing-library
summary: Testing Library — specs that use the UI the way a person does.
requires: [_react]
extends: null
abstract: false
languages: []
dictionary: [Testing Library, userEvent]
governs: ["**/__tests__/**/*.test.tsx"]
---

# Testing Library

> Specs that render the user interface and use it as a person does.

### queries-by-role-label-text → elements-found-by-role-label-text · MUST
Elements are queried by role first, then by label and text; `getByTestId` is forbidden.

| Why | Tags |
|---|---|
| a spec that finds elements as a user does breaks only when the user's experience does. | [] |

### interactions-through-user-event · SHOULD
Interactions go through `userEvent`, never `fireEvent`.

| Why | Tags |
|---|---|
| `userEvent` produces the whole sequence a person's action does — focus, keys, pointer — so the spec meets the bugs they would. | [testing] |

### async-ui-awaited-with-find → test-never-sleeps-a-fixed-time · SHOULD
What appears asynchronously is awaited with `findBy…` or `waitFor`, never a fixed sleep.

| Why | Tags |
|---|---|
| a sleep is too short on a slow machine and wasted on a fast one. | [testing] |

### hooks-proven-through-their-screen → spec-proves-one-boundary · SHOULD
A hook that loads or writes data is proven through the screen or component that uses it; `renderHook` only for a hook that is a boundary of its own, such as a UI-kit hook.

| Why | Tags |
|---|---|
| the screen is the boundary a user meets, and a hook tested alone repeats what its screen's spec proves. | [] |

### render-helper-builds-fresh-providers → case-independent-of-order · MUST
One render helper in `__tests__/<name>.fixtures` mounts the providers a spec needs, fresh for each spec.

| Why | Tags |
|---|---|
| every spec then runs inside the real composition, and nothing one spec's providers hold reaches the next. | [] |

## Requirements

| Requirement | How | Met |
|---|---|---|
| `a11y-scan-inside-component-specs` | over a document, axe runs on the rendered container through a matcher registered in the test setup and reports each violation with its element (`ui-specs-run-the-axe-scan`); a native renderer leaves no document for it to scan | partly |
