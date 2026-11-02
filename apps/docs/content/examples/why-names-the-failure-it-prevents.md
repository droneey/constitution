```md title="Avoid"
### unit-talks-only-to-its-neighbours · SHOULD

A unit calls its own collaborators, never theirs.

| Why |
|---|
| short calls keep the code clean and easy to read — Clean Code. |
```

```md title="Prefer"
### unit-talks-only-to-its-neighbours · SHOULD

A unit calls its own collaborators, never theirs.

| Why |
|---|
| a chain couples the caller to the whole path, so a change anywhere along it breaks the caller — the law of Demeter. |
```
