```text title="Avoid"
build     generate the client,
          compile
types     check the types: fails,
          client.gen is missing
```

```text title="Prefer"
generate  generate the client
types     generate, check the types
test      generate, run the specs
build     generate, compile
```
