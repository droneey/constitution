# Expo

## native-modules-at-sdk-versions · SHOULD
Native modules are at the versions the SDK supports.

| Why | Check | Tags |
|---|---|---|
| a native module at another version builds and then crashes on a device. | review | [] |

## expo-router-file-names-kept → kebab-case-file-names
A route keeps the names Expo Router finds it by: `_layout.tsx`, `+not-found.tsx`, a group `(tabs)/` and a parameter `[orderId].tsx`.

| Why | Check | Tags |
|---|---|---|
| the router finds its layouts, groups and parameters by these names alone. | tool/names | [] |
