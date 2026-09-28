# Testing Library

## queries-by-role-label-text · MUST
Elements are queried by role first, then by label and text; `getByTestId`, `container.querySelector` and class selectors are forbidden.
**Why:** a spec that finds elements as a user does breaks only when the user's experience does.
**Check:** tool — lint
**Tags:** testing, a11y
**Implements:** `elements-found-by-role-label-text`

## interactions-through-user-event · SHOULD
Interactions go through `userEvent`, never `fireEvent`.
**Why:** `userEvent` produces the whole sequence a person's action does — focus, keys, pointer — so the spec meets the bugs they would.
**Check:** review
**Tags:** testing

## async-ui-awaited-with-find · SHOULD
What appears asynchronously is awaited with `findBy…` or `waitFor`, never a fixed sleep.
**Why:** a sleep is too short on a slow machine and wasted on a fast one.
**Check:** review
**Tags:** testing

## hooks-proven-through-their-screen · SHOULD
A binding unit is proven through the screen or widget that uses it; `renderHook` only for a hook that is a boundary of its own, such as a UI-kit hook.
**Why:** the screen is the boundary a user meets, and a hook tested alone repeats what its screen's spec proves.
**Check:** review
**Tags:** testing
**Implements:** `spec-per-boundary`

## render-helper-builds-fresh-providers · SHOULD
One render helper in `__tests__/<name>.fixtures` mounts the providers a spec needs, fresh for each spec, with the transport replaced by captured responses.
**Why:** every spec then runs inside the real composition, and nothing leaks from one spec into the next.
**Check:** review
**Tags:** testing
**Implements:** `ui-specs-replace-the-transport`
