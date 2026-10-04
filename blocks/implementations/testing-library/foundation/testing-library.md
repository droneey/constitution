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

