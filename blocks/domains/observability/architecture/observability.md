# Observability

## diagnostics-through-the-logging-port → no-debug-output-in-shipped-code
Diagnostics a program keeps on purpose go through the logging port, never straight to the console or a stream.

| Why | Check | Tags |
|---|---|---|
| a port decides in one place where diagnostics go and what they may carry, and a test replaces it without touching the code. | review | [] |

## logging-configured-by-the-root → one-explicit-composition-root
`root/` configures logging once, at boot — the pipeline, where its records go, and what binds the trace id; no other code configures it, and no library of the program adds an output of its own.

| Why | Check | Tags |
|---|---|---|
| where records go and what they carry is one choice, made where every other concrete choice is. | review | [] |
