# Storybook

## story-for-every-kit-state · SHOULD
Every UI-kit component has `<name>.stories.tsx` beside it, with a story per variant and state — disabled, loading, error, empty, long text, both themes. A story never replaces the spec.

| Why | Check | Tags |
|---|---|---|
| the catalogue shows every state a designer and a reviewer need to see; the spec proves the behaviour. | review | [ux, testing] |

## stories-render-from-fixtures → tests-run-in-a-sandbox
Stories render from fixtures and fakes; no request leaves a story.

| Why | Check | Tags |
|---|---|---|
| a story that reaches the network breaks when the server does, and shows data nobody chose. | review | [] |

## screenshots-over-kit-stories-only → screenshots-only-where-look-is-contract
Screenshots are compared over the UI kit's stories, where the look is the contract, and nowhere else.

| Why | Check | Tags |
|---|---|---|
| the kit's look is the one place a changed pixel is a changed contract. | review | [] |

## stories-outside-coverage · MUST
Stories are outside coverage.

| Why | Check | Tags |
|---|---|---|
| a story renders a component without asserting anything, so a line it covers would count as proven when no spec proves it. | review | [testing] |

## stories-unreachable-from-production → test-code-unreachable-from-production
Production code never imports a story.

| Why | Check | Tags |
|---|---|---|
| a story in production ships fixtures and fakes to users. | tool/imports | [] |
