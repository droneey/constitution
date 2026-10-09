# Observability

> Governs where logging is configured.

## The pipeline

### library-adds-no-log-output → root-alone-configures-logging · MUST
No library — of the program's own or an installed one — adds an output to the log; an output an installed library adds by default is removed by the composition root, which routes that library's records into the one pipeline.

| Why | Tags |
|---|---|
| an output a library adds is a second pipeline that skips the mask and the trace id of the first. | [security] |
