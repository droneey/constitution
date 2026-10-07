# FastMCP with structlog

### fastmcp-records-join-the-chain → one-chain-for-every-record · MUST
The program runs with `FASTMCP_LOG_ENABLED=false`, or its logging configuration removes the handlers fastmcp gives its `fastmcp` logger at import and lets the logger propagate, so fastmcp's records pass the root logger's chain.

| Why | Tags |
|---|---|
| at import fastmcp gives its logger handlers of its own and stops it from propagating, so its records would skip the masking and the trace id. | [security] |
