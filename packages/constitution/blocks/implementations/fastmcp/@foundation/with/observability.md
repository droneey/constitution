# Observability

> Governs how fastmcp's own records reach the log pipeline.

## General

### fastmcp-records-join-the-pipeline → log-record-passes-one-pipeline · MUST

Every record of fastmcp's passes the one pipeline. The program runs with `FASTMCP_LOG_ENABLED=false`, or its logging configuration removes the handlers fastmcp gives its `fastmcp` logger at import and lets the logger propagate.

| Why |
|---|
| at import fastmcp gives its logger handlers of its own and stops it from propagating, so its records would skip the masking and the trace id. |
