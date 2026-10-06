# Observability

## logging-configured-by-the-root → diagnostics-through-the-logging-port
`root/` builds the logging pipeline once, at boot — the steps every record passes and what binds the trace id to it — and no library of the program adds an output of its own.

| Why | Check | Tags |
|---|---|---|
| what every record carries is one choice, made where its sinks are chosen, and an output a library adds is a second pipeline that skips the first. | review | [] |
