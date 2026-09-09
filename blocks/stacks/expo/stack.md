# Stack — Expo

> The stack axis for a **device client on React Native**. **Skeleton:** the concerns below are the rows the first mobile project fills; a `TODO:` is an honest gap, not a choice. Until it is filled, no brand is chosen and no binding is in force.

---

## 1. The toolbox

Bun is the runtime for scripts and tooling; the runtime on the device is React Native's.

| Concern | Tool |
| --- | --- |
| Language | TypeScript |
| Framework | React 19 (the `framework` chapter) |
| App shell | TODO: Expo, managed workflow |
| Navigation | TODO: file-based navigation, and where its folder sits (the mobile `architecture` §2 collision) |
| Server state / data fetching | TODO |
| Forms | TODO |
| HTTP client | TODO |
| Styling | TODO: how tokens reach the device |
| Primitives | TODO: the accessible primitive library for a device |
| Persistence | TODO: cache persistence and secure storage |
| Lint + format | Biome, through `@droneey/devkit-ts-biome` |
| Dependency boundaries | dependency-cruiser |
| Git hooks | lefthook, through `@droneey/devkit-ts-lefthook` |
| TypeScript config | `@droneey/devkit-ts-tsconfig` |
| Tests | TODO: the runner and the component testing library |
| Boundary & schema validation | zod |

---

## 2. Data binding
TODO: the read/write binding units, the key factory, the concrete hook contract field names — kept identical to the web stack unless a device forces a difference.

---

## 3. State homes
TODO: server data in the cache; view state in navigation params or local state (mobile `architecture` §1); ephemeral UI in the component; global client state in one minimal store.

---

## 4. Screens
TODO: the navigator's folder convention, layouts, co-located screen-private pieces, guards.

---

## 5. UI & design system
TODO: the row-by-row binding of the `ui` chapter to the device toolchain — tokens, variants, primitives, slot, workshop.

---

## 6. Verification
TODO: what `check` runs for a device app — lint, types, tests with the 100 percent gate, boundaries, and the build or prebuild step.
