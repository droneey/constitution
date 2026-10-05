# FastMCP

## tool-failures-answered-by-one-middleware → one-error-handler-per-transport
One middleware, which `root/` adds to the server, answers every failure of a tool: an error of the error kit becomes a result the model reads as an error, with its code and details, and any other failure a masked internal error; the server is built with `mask_error_details=True`.

| Why | Check | Tags |
|---|---|---|
| the model reads an expected failure as data it can act on, and an unexpected one shows it no internal detail. | review | [errors, security] |
