# Observability

## logging-configured-by-the-root → one-explicit-composition-root
`root/` configures logging once, at boot — the pipeline, where its records go, and what binds the trace id; no other code configures it, and no library of the program adds an output of its own.

| Why | Check | Tags |
|---|---|---|
| where records go and what they carry is one choice, made where every other concrete choice is. | review | [] |
