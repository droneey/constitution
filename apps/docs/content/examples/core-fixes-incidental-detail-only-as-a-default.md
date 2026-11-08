```text title="Avoid"
core/@architecture/layout.md
  A role folder's surface is its index.ts.
  The use cases live in use-cases/.
```

```text title="Prefer"
core/@architecture/layout.md
  A role folder has a <surface>.
  **`use-cases/`**{#use-case} holds the use cases.

contexts/languages/typescript/@architecture/layout.md
  A surface is the index.ts of its folder.

contexts/languages/python/@architecture/layout.md
  **`use_cases/`**{#use-case} holds the use cases.
```
