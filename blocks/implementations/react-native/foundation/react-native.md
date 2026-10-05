# React Native

## long-lists-virtualised · SHOULD
A list that can grow renders through a virtualised list, never `map` inside a scroll view.

| Why | Check | Tags |
|---|---|---|
| a mapped list mounts every row at once, and a long one freezes the device. | review | [performance] |

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
