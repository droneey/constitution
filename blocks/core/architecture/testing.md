# Testing

## What a spec proves

## spec-per-boundary-of-the-tree → spec-per-boundary
The boundaries of the tree are what a caller outside a folder reaches through its surface: a use-case, an adapter, a delivery unit such as a screen or a command of the command line, a reusable component, a primitive of `libs/`, and a module of pure rules of the domain. Composition and the wiring file get no spec. How a screen and a component are proven is stated by the blocks of a user interface.

| Why | Check | Tags |
|---|---|---|
| each of these is a unit another part of the program relies on through its surface, and what sits behind a surface is proven through it. | review | [] |
