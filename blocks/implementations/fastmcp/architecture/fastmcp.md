# FastMCP

## tool-failures-answered-by-one-middleware → one-error-handler-registered-by-the-root
The handler is one middleware, which `root/` adds to the server, whose `on_call_tool` answers every failure of a call.

| Why | Check | Tags |
|---|---|---|
| the middleware wraps every call, so it also receives what fastmcp raises before the tool runs: a refused argument, an unknown tool. | review | [errors, security] |
