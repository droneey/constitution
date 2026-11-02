```text title="Avoid"
Person: Let customers save their
        carts.
Agent:  Done: a carts table, a
        sync worker and a cache,
        1,400 lines.
```

```text title="Prefer"
Person: Let customers save their
        carts.
Agent:  Two designs:
        a) a saved-carts table,
           ~300 lines, nothing new
           installed;
        b) a) and a cache, ~900
           lines, adds a cache
           server.
        Which one?
Person: a.
```
