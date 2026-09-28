# Testing

## What a spec proves

## spec-per-boundary-of-the-tree → spec-per-boundary
The boundaries of the tree are what a caller outside a folder reaches through its surface: a use-case, an adapter, a delivery unit such as a screen or a command of the command line, a reusable component, a primitive of `libs/`, and a module of pure rules of the domain. Composition and the wiring file get no spec. How a screen and a component are proven is stated by the blocks of a user interface.

| Why | Check | Tags |
|---|---|---|
| each of these is a unit another part of the program relies on through its surface, and what sits behind a surface is proven through it. | review | [] |

## The sandbox

## effects-faked-through-ports · SHOULD
In a test, network, time, randomness, processes and credentials are faked through their ports.

| Why | Check | Tags |
|---|---|---|
| a fake behind the same port as the real effect replaces it without touching the code under test. | review | [testing] |

## Files and names

## test-code-unreachable-from-production · MUST
Production code never imports a file of `__tests__/` or of `tests/`.

| Why | Check | Tags |
|---|---|---|
| a fake or a fixture in production code ships test behaviour to users. | tool — architecture | [testing] |
