# Source

> Governs where shadcn source is added and the alias its imports name.

## General

### shadcn-source-added-into-the-kit → component-lives-where-its-knowledge-lives · MUST

All shadcn source is added into the UI kit as source, never imported from a package.

| Why |
|---|
| a component imported from a package sits outside the kit's homes, so a reader does not find it where every other component is, and a copy of it hides in a dependency. |

### shadcn-imports-through-the-project-alias · MUST

Every import in shadcn source names the project's alias, as the `aliases` of `components.json` give it. Those `aliases` point at the kit's folders.

| Why |
|---|
| imports left as the generator wrote them break where the project's alias differs, and the shadcn CLI places each component it adds and rewrites its imports by the `aliases` of `components.json`, so a wrong alias there sends every next component out of the kit. |
