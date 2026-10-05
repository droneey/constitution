# Testing Library

## queries-by-role-label-text → elements-found-by-role-label-text · MUST
Elements are queried by role first, then by label and text; `getByTestId`, `container.querySelector` and class selectors are forbidden.

| Why | Check | Tags |
|---|---|---|
| a spec that finds elements as a user does breaks only when the user's experience does. | tool/lint | [] |

## interactions-through-user-event · SHOULD
Interactions go through `userEvent`, never `fireEvent`.

| Why | Check | Tags |
|---|---|---|
| `userEvent` produces the whole sequence a person's action does — focus, keys, pointer — so the spec meets the bugs they would. | review | [testing] |

## async-ui-awaited-with-find → no-fixed-sleeps-in-tests
What appears asynchronously is awaited with `findBy…` or `waitFor`, never a fixed sleep.

| Why | Check | Tags |
|---|---|---|
| a sleep is too short on a slow machine and wasted on a fast one. | review | [testing] |

## hooks-proven-through-their-screen → spec-per-boundary
A hook that loads or writes data is proven through the screen or component that uses it; `renderHook` only for a hook that is a boundary of its own, such as a UI-kit hook.

| Why | Check | Tags |
|---|---|---|
| the screen is the boundary a user meets, and a hook tested alone repeats what its screen's spec proves. | review | [] |

## render-helper-builds-fresh-providers → specs-independent-of-order · MUST
One render helper in `__tests__/<name>.fixtures` mounts the providers a spec needs, fresh for each spec.

| Why | Check | Tags |
|---|---|---|
| every spec then runs inside the real composition, and nothing one spec's providers hold reaches the next. | review | [] |

## Accessibility

## ui-specs-run-the-axe-scan → ui-specs-scan-accessibility
Every screen and component spec runs the axe scan over what it rendered, on the WCAG 2.2 A and AA rules only, and passes with zero violations. Contrast, which a simulated DOM cannot judge, is turned off there and is the token-pair test's; the landmark rule runs in screen specs, not over a lone component.

| Why | Check | Tags |
|---|---|---|
| the scan catches a third of the problems in every spec, on every change, for free. | test | [] |
