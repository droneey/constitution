# FastMCP

### tool-failures-answered-by-one-middleware → one-error-handler-registered-by-the-root · MUST

The handler is one middleware, which `root/` adds to the server, whose `on_call_tool` answers every failure of a call.

| Why | Tags |
|---|---|
| the middleware wraps every call, so it also receives what fastmcp raises before the tool runs: a refused argument, an unknown tool. | [errors, security] |

### fastmcp-imported-by-delivery-units → layer-imports-dependencies-by-its-role · MUST

fastmcp's home reaches past the edge into the delivery units in the `app/` of a feature or a module of composition, which declare the tools.

| Why | Tags |
|---|---|
| a tool lives with the feature it serves, and the framework stays out of the domain and the use cases below it. | [] |
