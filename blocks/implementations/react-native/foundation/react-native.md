# React Native

## list-never-mapped-in-a-scroll-view → long-lists-virtualised
A list that can grow is never `map` in a `ScrollView`.

| Why | Check | Tags |
|---|---|---|
| a `ScrollView` mounts every child at once, so a mapped list in it renders every row however long it grows. | review | [] |

## no-literal-colour-in-a-style → tokens-single-source-of-appearance
A style names no literal colour.

| Why | Check | Tags |
|---|---|---|
| a literal colour is a second palette the next theme misses. | tool/lint | [ux] |

## react-native-imported-from-its-entry → dependencies-imported-from-their-entries
React Native is imported from `react-native`, never from its internal paths.

| Why | Check | Tags |
|---|---|---|
| the internal paths of React Native move between releases, and the linter refuses them. | tool/lint | [] |
