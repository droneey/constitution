# Expo

## native-projects-generated-by-prebuild → generated-files-marked-never-edited
The native projects are a build output, generated from `app.config.ts` and config plugins, never edited by hand.

| Why | Check | Tags |
|---|---|---|
| a hand-edited native project drifts from the configuration and is lost on the next generation. | review | [] |

## native-modules-at-sdk-versions · SHOULD
Native modules are installed at the versions the SDK supports, and the check verifies them with `expo install --check`.

| Why | Check | Tags |
|---|---|---|
| a native module at another version builds and then crashes on a device. | review | [] |

## expo-router-file-names-kept → kebab-case-file-names
Beside kebab-case, a route keeps the names Expo Router reads: `_layout.tsx`, `+not-found.tsx`, a group `(tabs)/` and a parameter `[orderId].tsx`.

| Why | Check | Tags |
|---|---|---|
| the router finds its layouts, groups and parameters by these names alone. | tool/names | [] |
