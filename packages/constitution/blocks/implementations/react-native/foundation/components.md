# Components

> Governs the lists and styles of native components.

## General

### list-never-mapped-in-a-scroll-view → long-lists-virtualised · SHOULD

A list that can grow is never `map` in a `ScrollView`.

| Why | Tags |
|---|---|
| a `ScrollView` mounts every child at once, so a mapped list in it renders every row however long it grows. | [] |

### style-colour-read-from-tokens → tokens-single-source-of-appearance · MUST

A style names no literal colour.

| Why | Tags |
|---|---|
| a literal colour is a second palette the next theme misses. | [ux] |
