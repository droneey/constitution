```text title="Avoid"
code      formatter A, then the
          linter's formatter: each
          undoes the other
Markdown  formatter C, docs/ left
          out
```

```text title="Prefer"
code      formatter A, every file
Markdown  formatter C, every file
check     fails on a file either
          would change
```
